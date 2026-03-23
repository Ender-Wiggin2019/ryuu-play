#!/usr/bin/env python3

import argparse
import json
import re
import subprocess
import sys
import unicodedata
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple


WORKSPACE_ROOT = Path(__file__).resolve().parents[4]
SETS_ROOT = WORKSPACE_ROOT / "packages" / "sets" / "src"
POKEMON_TCG_DATA_EN_ROOT = WORKSPACE_ROOT / "pokemon-tcg-data" / "cards" / "en"
CARD_DATA_FINDER_SCRIPT = (
    WORKSPACE_ROOT
    / ".agents"
    / "skills"
    / "card-data-finder"
    / "scripts"
    / "resolve_card.py"
)

CHINESE_QUERY_ALIASES: Dict[str, List[str]] = {
    "Sandy Shocks": ["沙铁皮"],
    "Slither Wing": ["爬地翅"],
    "Squawkabilly ex": ["怒鹦哥ex", "怒鹦哥"],
    "Boss's Orders": ["老大的指令"],
    "Professor Sada's Vitality": ["奥琳博士的气魄"],
    "Judge": ["裁判"],
    "Switch Cart": ["交替推车"],
    "Pal Pad": ["朋友手册"],
    "Prime Catcher": ["顶尖捕捉器"],
    "Trekking Shoes": ["健行鞋"],
    "Bravery Charm": ["勇气护符"],
    "Basic Grass Energy": ["基本草能量"],
    "Basic Lightning Energy": ["基本雷能量"],
    "Basic Fighting Energy": ["基本斗能量"],
}


IGNORE_LINE_PATTERNS = [
    re.compile(r"^\s*By\s*:", re.IGNORECASE),
    re.compile(r"^\s*Total\s+Cards\s*:\s*\d+\s*$", re.IGNORECASE),
    re.compile(r"^\s*(Pok[eé]mon|Trainer|Energy)\s*:\s*\d+\s*$", re.IGNORECASE),
]
CARD_LINE_PATTERN = re.compile(r"^\s*(\d+)\s+(.+?)\s*$")
IMPLEMENTED_NAME_PATTERN = re.compile(
    r"public\s+name\s*:\s*string\s*=\s*['\"](.+?)['\"];?"
)


def normalize_name(value: str) -> str:
    value = (value or "").strip().lower()
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = value.replace("’", "'")
    value = re.sub(r"[^a-z0-9]+", "", value)
    return value


def to_folder_name(value: str) -> str:
    normalized = (value or "").strip().lower()
    normalized = unicodedata.normalize("NFKD", normalized)
    normalized = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    normalized = re.sub(r"[^a-z0-9]+", "-", normalized).strip("-")
    return normalized


def looks_like_set_code(token: str) -> bool:
    cleaned = token.strip()
    return bool(re.fullmatch(r"[A-Za-z0-9]{2,8}", cleaned)) and any(
        ch.isalpha() for ch in cleaned
    )


def looks_like_number_token(token: str) -> bool:
    cleaned = token.strip()
    return bool(re.fullmatch(r"[A-Za-z0-9]+(?:/[A-Za-z0-9]+)?", cleaned))


def parse_deck_line(raw_line: str) -> Optional[Dict[str, str]]:
    line = raw_line.strip()
    if not line:
        return None
    for pattern in IGNORE_LINE_PATTERNS:
        if pattern.match(line):
            return None

    match = CARD_LINE_PATTERN.match(line)
    if not match:
        return None

    quantity = int(match.group(1))
    tail = match.group(2).strip()
    tokens = tail.split()

    set_code = ""
    set_number = ""
    name_tokens = tokens

    if len(tokens) >= 3 and looks_like_set_code(tokens[-2]) and looks_like_number_token(tokens[-1]):
        set_code = tokens[-2]
        set_number = tokens[-1]
        name_tokens = tokens[:-2]

    name = " ".join(name_tokens).strip()
    if not name:
        return None

    return {
        "quantity": quantity,
        "name": name,
        "set_code": set_code,
        "set_number": set_number,
        "raw_line": raw_line.rstrip(),
    }


def parse_deck_text(deck_text: str) -> List[Dict[str, str]]:
    parsed: List[Dict[str, str]] = []
    for line in deck_text.splitlines():
        item = parse_deck_line(line)
        if item is not None:
            parsed.append(item)
    return parsed


def load_implemented_names() -> Dict[str, List[str]]:
    name_map: Dict[str, List[str]] = defaultdict(list)
    for path in sorted(SETS_ROOT.rglob("*.ts")):
        text = path.read_text(encoding="utf-8")
        for hit in IMPLEMENTED_NAME_PATTERN.findall(text):
            normalized = normalize_name(hit)
            if not normalized:
                continue
            if hit not in name_map[normalized]:
                name_map[normalized].append(hit)
    return name_map


def load_english_cards() -> Dict[str, List[Dict]]:
    index: Dict[str, List[Dict]] = defaultdict(list)
    if not POKEMON_TCG_DATA_EN_ROOT.exists():
        return index

    for path in sorted(POKEMON_TCG_DATA_EN_ROOT.glob("*.json")):
        cards = json.loads(path.read_text(encoding="utf-8"))
        for card in cards:
            name = card.get("name", "")
            normalized = normalize_name(name)
            if normalized:
                index[normalized].append(card)
    return index


def card_rarity_weight(rarity: str) -> int:
    value = (rarity or "").lower()
    common_like = ["common", "uncommon", "c", "u", "普", "非闪"]
    rare_like = ["rare", "r", "holo", "double rare", "ultra", "secret", "illustration"]

    score = 50
    if any(token in value for token in common_like):
        score -= 20
    if any(token in value for token in rare_like):
        score += 10
    if any(token in value for token in ["ultra", "secret", "hyper", "special"]):
        score += 20
    return score


def pick_english_card(card_name: str, set_code: str, set_number: str, english_index: Dict[str, List[Dict]]) -> Optional[Dict]:
    candidates = english_index.get(normalize_name(card_name), [])
    if not candidates:
        return None

    deck_set_code = (set_code or "").lower()
    deck_number = (set_number or "").lower()
    scored: List[Tuple[int, Dict]] = []

    for card in candidates:
        score = card_rarity_weight(str(card.get("rarity", "")))
        card_id = str(card.get("id", "")).lower()
        card_number = str(card.get("number", "")).lower()
        id_prefix = card_id.split("-", 1)[0] if "-" in card_id else ""

        if deck_set_code and id_prefix == deck_set_code:
            score -= 30
        if deck_number and card_number == deck_number:
            score -= 20
        if deck_set_code and deck_number and f"{deck_set_code}-{deck_number}" == card_id:
            score -= 20
        scored.append((score, card))

    scored.sort(key=lambda item: item[0])
    return scored[0][1]


def build_english_description(card: Optional[Dict]) -> str:
    if not card:
        return "No english effect text found from pokemon-tcg-data."

    lines: List[str] = []
    supertype = card.get("supertype")
    if supertype:
        lines.append(f"Type: {supertype}")
    if card.get("subtypes"):
        lines.append(f"Subtypes: {', '.join(card['subtypes'])}")

    ability = card.get("abilities") or []
    for item in ability:
        name = item.get("name", "").strip()
        text = item.get("text", "").strip()
        if name or text:
            lines.append(f"Ability - {name}: {text}".strip(": "))

    attacks = card.get("attacks") or []
    for attack in attacks:
        name = attack.get("name", "").strip()
        text = attack.get("text", "").strip()
        damage = attack.get("damage", "").strip()
        body = f"Attack - {name}"
        if damage:
            body += f" ({damage})"
        if text:
            body += f": {text}"
        lines.append(body)

    for rule in card.get("rules", []) or []:
        lines.append(f"Rule: {rule}")

    if not lines:
        return "No english effect text found from pokemon-tcg-data."
    return " | ".join(lines)


def call_card_data_finder(query: str) -> Dict:
    if not CARD_DATA_FINDER_SCRIPT.exists():
        return {"ok": False, "error": "card-data-finder script is missing."}

    cmd = [
        "python3",
        str(CARD_DATA_FINDER_SCRIPT),
        "search",
        query,
        "--limit",
        "20",
    ]
    process = subprocess.run(cmd, capture_output=True, text=True, cwd=str(WORKSPACE_ROOT))
    if process.returncode != 0:
        return {"ok": False, "error": process.stderr.strip() or process.stdout.strip()}
    return json.loads(process.stdout)


def candidate_mark_weight(mark: str) -> int:
    order = {
        "H": 8,
        "G": 7,
        "F": 6,
        "E": 5,
        "D": 4,
        "C": 3,
        "B": 2,
        "A": 1,
    }
    return order.get((mark or "").strip().upper(), 0)


def pick_best_cn_candidate(candidates: List[Dict], set_number: str) -> Optional[Dict]:
    if not candidates:
        return None

    expected_number = str(set_number or "").strip().lower()
    scored: List[Tuple[int, Dict]] = []

    for candidate in candidates:
        score = 0
        if candidate.get("source") == "ptcg-chs":
            score += 50

        collection_number = str(candidate.get("collection_number") or "").lower()
        if expected_number and collection_number:
            if collection_number == expected_number:
                score += 40
            elif collection_number.startswith(f"{expected_number}/"):
                score += 35
            elif f"/{expected_number}" in collection_number:
                score += 20

        score += candidate_mark_weight(str(candidate.get("regulation_mark_text") or "")) * 2
        scored.append((score, candidate))

    scored.sort(key=lambda item: item[0], reverse=True)
    return scored[0][1]


def extract_cn_description(selected: Dict) -> str:
    raw_card = (
        selected.get("card", {})
        .get("raw_card", {})
    )
    details = raw_card.get("details", {})
    snippets: List[str] = []

    ability_items = details.get("abilityItemList") or []
    for item in ability_items:
        name = str(item.get("abilityName", "")).strip()
        text = str(item.get("abilityText", "")).strip()
        if name or text:
            snippets.append(f"{name}：{text}".strip("："))

    for key in ("abilityText", "effectText", "featureText", "pokedexText", "ruleText"):
        value = details.get(key)
        if isinstance(value, str) and value.strip():
            snippets.append(value.strip())

    rule_list = details.get("ruleList") or []
    for rule in rule_list:
        if isinstance(rule, str) and rule.strip():
            snippets.append(rule.strip())

    deduped: List[str] = []
    seen = set()
    for snippet in snippets:
        if snippet not in seen:
            deduped.append(snippet)
            seen.add(snippet)

    if deduped:
        return " | ".join(deduped)
    return "未从 card-data-finder 命中中文效果文本。"


def resolve_chinese_info(card_name: str, set_number: str) -> Dict:
    query_list = CHINESE_QUERY_ALIASES.get(card_name, []) + [card_name]

    last_error = ""
    for query in query_list:
        raw = call_card_data_finder(query)
        if not raw.get("ok"):
            last_error = raw.get("error", "card-data-finder search failed")
            continue

        selected = raw.get("selected")
        if not selected:
            selected = pick_best_cn_candidate(raw.get("candidates", []), set_number=set_number)
        if not selected:
            last_error = "no selected candidate"
            continue

        return {
            "description": (
                selected.get("name", "")
                if (
                    extract_cn_description(selected) == "未从 card-data-finder 命中中文效果文本。"
                    and "能量" in str(selected.get("name", ""))
                )
                else extract_cn_description(selected)
            ),
            "ok": True,
            "name": selected.get("name", ""),
            "image_url": selected.get("image_url", ""),
            "collection_name": selected.get("collection_name", ""),
            "collection_number": selected.get("collection_number", ""),
            "rarity": selected.get("rarity", ""),
            "regulation_mark_text": selected.get("regulation_mark_text", ""),
        }

    return {"ok": False, "error": last_error or "card-data-finder search failed"}


def write_markdown_outputs(
    output_dir: Path,
    missing_cards: List[Dict],
    implemented_cards: List[Dict],
) -> Tuple[Path, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    now_text = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    todo_path = output_dir / "deck_todo.md"
    plan_path = output_dir / "deck_plan.md"

    todo_lines = [
        "# Deck Missing Cards TODO",
        "",
        f"- Generated at: {now_text}",
        f"- Missing unique cards: {len(missing_cards)}",
        "",
        "## TODO List",
        "",
    ]
    if not missing_cards:
        todo_lines.append("- No missing cards. This deck can be assembled from implemented cards.")
    else:
        for card in missing_cards:
            todo_lines.append(f"- [ ] {card['name']} x{card['quantity']}")

    plan_lines = [
        "# Deck Build Plan",
        "",
        f"- Generated at: {now_text}",
        f"- Implemented unique cards: {len(implemented_cards)}",
        f"- Missing unique cards: {len(missing_cards)}",
        "",
        "## Missing Cards Plan",
        "",
    ]
    if not missing_cards:
        plan_lines.append("- No missing cards, skip implementation plan.")
    else:
        for index, card in enumerate(missing_cards, start=1):
            plan_lines.extend(
                [
                    f"### {index}. {card['name']} (x{card['quantity']})",
                    f"- English description: {card['english_description']}",
                    f"- 中文描述: {card['chinese_description']}",
                    f"- 来源建议: {card['source_hint']}",
                    f"- 实现动作: 在 `packages/sets/src/standard/{card['target_set_version']}/` 新增卡牌并接入 set index。",
                    "",
                ]
            )

    todo_path.write_text("\n".join(todo_lines) + "\n", encoding="utf-8")
    plan_path.write_text("\n".join(plan_lines) + "\n", encoding="utf-8")
    return todo_path, plan_path


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Parse deck text and generate missing-card TODO + plan."
    )
    parser.add_argument(
        "--deck-file",
        required=True,
        help="Path to a deck text file (copied from deck link).",
    )
    parser.add_argument(
        "--output-dir",
        default="",
        help="Directory to save todo/plan/report files. If empty, use docs/decks/<deck-name>.",
    )
    parser.add_argument(
        "--deck-name",
        default="",
        help="Deck folder name used when --output-dir is not provided.",
    )
    args = parser.parse_args()

    deck_file = Path(args.deck_file).resolve()
    if not deck_file.exists():
        print(json.dumps({"ok": False, "error": f"Deck file not found: {deck_file}"}))
        return 1

    deck_text = deck_file.read_text(encoding="utf-8")
    parsed_cards = parse_deck_text(deck_text)
    if not parsed_cards:
        print(
            json.dumps(
                {
                    "ok": False,
                    "error": "No card lines parsed from deck content.",
                }
            )
        )
        return 1

    merged: Dict[str, Dict] = {}
    for item in parsed_cards:
        key = normalize_name(item["name"])
        if key not in merged:
            merged[key] = dict(item)
        else:
            merged[key]["quantity"] += item["quantity"]

    implemented_name_map = load_implemented_names()
    english_index = load_english_cards()

    implemented_cards: List[Dict] = []
    missing_cards: List[Dict] = []

    for key, item in merged.items():
        if key in implemented_name_map:
            implemented_cards.append(
                {
                    "name": item["name"],
                    "quantity": item["quantity"],
                    "implemented_aliases": implemented_name_map[key],
                }
            )
            continue

        english_card = pick_english_card(
            item["name"],
            item.get("set_code", ""),
            item.get("set_number", ""),
            english_index,
        )
        english_description = build_english_description(english_card)
        chinese_result = resolve_chinese_info(
            item["name"],
            item.get("set_number", ""),
        )

        if chinese_result.get("ok"):
            chinese_description = chinese_result.get("description", "")
            source_hint = (
                f"card-data-finder: {chinese_result.get('name', '')} "
                f"{chinese_result.get('collection_name', '')} "
                f"{chinese_result.get('collection_number', '')}"
            ).strip()
            regulation_mark = str(chinese_result.get("regulation_mark_text", "")).strip().lower()
            target_set_version = f"set_{regulation_mark}" if regulation_mark else "set_h"
        else:
            chinese_description = "未自动匹配到中文卡牌，请用 card-data-finder 手动检索并确认候选。"
            source_hint = "card-data-finder: search <name> 后手动选择候选"
            target_set_version = "set_h"

        missing_cards.append(
            {
                "name": item["name"],
                "quantity": item["quantity"],
                "set_code": item.get("set_code", ""),
                "set_number": item.get("set_number", ""),
                "english_description": english_description,
                "chinese_description": chinese_description,
                "source_hint": source_hint,
                "target_set_version": target_set_version,
            }
        )

    if args.output_dir.strip():
        output_dir = (WORKSPACE_ROOT / args.output_dir.strip()).resolve()
    else:
        folder_name = to_folder_name(args.deck_name)
        if not folder_name:
            print(
                json.dumps(
                    {
                        "ok": False,
                        "error": "Deck name is required when --output-dir is not provided. Please pass --deck-name <name>.",
                    }
                )
            )
            return 1
        output_dir = (WORKSPACE_ROOT / "docs" / "decks" / folder_name).resolve()
    todo_path, plan_path = write_markdown_outputs(
        output_dir=output_dir,
        missing_cards=sorted(missing_cards, key=lambda item: item["name"]),
        implemented_cards=sorted(implemented_cards, key=lambda item: item["name"]),
    )

    report = {
        "ok": True,
        "deck_file": str(deck_file),
        "parsed_lines": len(parsed_cards),
        "implemented_unique_cards": len(implemented_cards),
        "missing_unique_cards": len(missing_cards),
        "todo_file": str(todo_path),
        "plan_file": str(plan_path),
        "implemented_cards": implemented_cards,
        "missing_cards": missing_cards,
    }
    report_path = output_dir / "analysis_report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
