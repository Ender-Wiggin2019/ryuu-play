#!/usr/bin/env python3

import argparse
import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Tuple


DATA_URL = "https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/ptcg_chs_infos.json"
IMAGE_BASE_URL = "https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/"

SKILL_ROOT = Path(__file__).resolve().parents[1]
ASSETS_DIR = SKILL_ROOT / "assets"
DATA_PATH = ASSETS_DIR / "ptcg_chs_infos.json"


def normalize(text: str) -> str:
    text = (text or "").strip().lower()
    return re.sub(r"[\s_\-]+", "", text)


def download_data(data_path: Path) -> Dict[str, Any]:
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    with urllib.request.urlopen(DATA_URL, timeout=30) as response:
        body = response.read()

    parsed = json.loads(body.decode("utf-8"))

    tmp_path = data_path.with_suffix(".json.tmp")
    tmp_path.write_text(json.dumps(parsed, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp_path.replace(data_path)
    return parsed


def load_data(data_path: Path) -> Dict[str, Any]:
    if not data_path.exists():
        return download_data(data_path)
    return json.loads(data_path.read_text(encoding="utf-8"))


def to_image_url(image_path: str) -> str:
    normalized = image_path.replace("\\", "/")
    return IMAGE_BASE_URL + normalized.lstrip("/")


def get_detail_value(card: Dict[str, Any], key: str) -> Any:
    details = card.get("details") or {}
    if isinstance(details, dict):
        return details.get(key)
    return None


def to_set_version(regulation_mark: Any) -> str:
    mark = str(regulation_mark or "").strip().lower()
    if not mark:
        return ""
    return f"set_{mark}"


def flatten_cards(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    for collection in data.get("collections", []):
        collection_meta = {k: v for k, v in collection.items() if k != "cards"}
        cards = collection.get("cards") or []
        for card in cards:
            image = card.get("image")
            if not image:
                continue

            row = {
                "id": card.get("id"),
                "name": card.get("name") or get_detail_value(card, "cardName"),
                "yoren_code": card.get("yorenCode") or get_detail_value(card, "yorenCode"),
                "commodity_code": card.get("commodityCode") or get_detail_value(card, "commodityCode"),
                "card_type": card.get("cardType") or get_detail_value(card, "cardType"),
                "collection_id": collection.get("id"),
                "collection_name": collection.get("name"),
                "collection_number": get_detail_value(card, "collectionNumber"),
                "rarity": get_detail_value(card, "rarity"),
                "regulation_mark_text": get_detail_value(card, "regulationMarkText"),
                "set_version": to_set_version(get_detail_value(card, "regulationMarkText")),
                "hp": get_detail_value(card, "hp"),
                "image": image,
                "image_url": to_image_url(image),
                "hash": card.get("hash"),
                "card": {
                    "raw_card": card,
                    "collection": collection_meta,
                },
            }
            rows.append(row)
    return rows


def score_row(row: Dict[str, Any], query: str) -> int:
    q = normalize(query)
    if not q:
        return 0

    score = 0
    name = normalize(str(row.get("name") or ""))
    collection_name = normalize(str(row.get("collection_name") or ""))
    yoren_code = normalize(str(row.get("yoren_code") or ""))
    commodity_code = normalize(str(row.get("commodity_code") or ""))
    collection_number = normalize(str(row.get("collection_number") or ""))
    card_id = normalize(str(row.get("id") or ""))

    if q == name:
        score = max(score, 100)
    elif name.startswith(q):
        score = max(score, 90)
    elif q in name:
        score = max(score, 80)

    if q and q == yoren_code:
        score = max(score, 95)
    elif q and q in yoren_code:
        score = max(score, 82)

    if q and q == commodity_code:
        score = max(score, 93)
    elif q and q in commodity_code:
        score = max(score, 81)

    if q and q == collection_number:
        score = max(score, 88)

    if q and q == card_id:
        score = max(score, 96)

    if q and q in collection_name:
        score = max(score, 60)

    return score


def search(rows: List[Dict[str, Any]], query: str, limit: int) -> Tuple[int, List[Dict[str, Any]]]:
    scored: List[Tuple[int, Dict[str, Any]]] = []
    for row in rows:
        s = score_row(row, query)
        if s > 0:
            scored.append((s, row))

    scored.sort(key=lambda item: (item[0], str(item[1].get("id") or "")), reverse=True)

    output: List[Dict[str, Any]] = []
    for idx, (score, row) in enumerate(scored[:limit], start=1):
        item = dict(row)
        item["index"] = idx
        item["score"] = score
        output.append(item)
    return len(scored), output


def run_update(args: argparse.Namespace) -> int:
    try:
        data = download_data(DATA_PATH)
    except urllib.error.URLError as err:
        print(json.dumps({"ok": False, "error": f"download failed: {err}"}, ensure_ascii=False))
        return 1

    out = {
        "ok": True,
        "saved_to": str(DATA_PATH),
        "collections": len(data.get("collections", [])),
    }
    print(json.dumps(out, ensure_ascii=False, indent=2))
    return 0


def run_search(args: argparse.Namespace) -> int:
    if args.refresh:
        try:
            data = download_data(DATA_PATH)
        except urllib.error.URLError as err:
            print(json.dumps({"ok": False, "error": f"refresh failed: {err}"}, ensure_ascii=False))
            return 1
    else:
        data = load_data(DATA_PATH)

    rows = flatten_cards(data)
    total_matches, candidates = search(rows, args.query, args.limit)

    result: Dict[str, Any] = {
        "ok": True,
        "query": args.query,
        "total_matches": total_matches,
        "returned_candidates": len(candidates),
        "needs_selection": total_matches > 1,
        "candidates": candidates,
    }

    if args.select is not None:
        selected = next((c for c in candidates if c.get("index") == args.select), None)
        if selected is None:
            result["ok"] = False
            result["error"] = f"invalid --select index: {args.select}"
            print(json.dumps(result, ensure_ascii=False, indent=2))
            return 1
        result["selected"] = selected

    elif len(candidates) == 1:
        result["selected"] = candidates[0]

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Resolve card objects and GitHub image URLs.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    update_parser = subparsers.add_parser("update", help="Download and update local dataset cache.")
    update_parser.set_defaults(func=run_update)

    search_parser = subparsers.add_parser("search", help="Search card candidates from local dataset cache.")
    search_parser.add_argument("query", help="Card name/code/id keyword.")
    search_parser.add_argument("--limit", type=int, default=20, help="Max candidates to return.")
    search_parser.add_argument("--select", type=int, default=None, help="Select index from current candidates.")
    search_parser.add_argument("--refresh", action="store_true", help="Refresh dataset before searching.")
    search_parser.set_defaults(func=run_search)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
