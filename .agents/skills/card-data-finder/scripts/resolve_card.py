#!/usr/bin/env python3

import argparse
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Tuple


LOCAL_API_BASE = 'http://localhost:3000'
LIST_ENDPOINT = '/api/v1/cards'
DETAIL_ENDPOINT = '/api/v1/cards/{card_id}'
IMAGE_PREFIX = '/api/v1/cards/'
PAGE_SIZE = 60
DEFAULT_PRINTING_LIMIT = 10
RARITY_PRIORITY = {
    'ur': 100,
    'sar': 95,
    'csr': 90,
    'chr': 88,
    'sr': 85,
    'ar': 80,
    'rrr': 75,
    'rr': 70,
    'r': 60,
    '★': 58,
    'c★★': 57,
    'c★': 56,
    'u': 30,
    'c': 20,
    '无标记': 10,
}

SKILL_ROOT = Path(__file__).resolve().parents[1]
ASSETS_DIR = SKILL_ROOT / 'assets'
DATA_PATH = ASSETS_DIR / 'local_cards_index.json'


def normalize(text: str) -> str:
    text = (text or '').strip().lower()
    return re.sub(r'[\s_\-]+', '', text)


def fetch_json(url: str) -> Dict[str, Any]:
    request = urllib.request.Request(url, headers={'Accept': 'application/json'})
    with urllib.request.urlopen(request, timeout=30) as response:
      body = response.read()
    return json.loads(body.decode('utf-8'))


def build_absolute_image_url(image_url: str) -> str:
    if not image_url:
        return ''
    if image_url.startswith('http://') or image_url.startswith('https://'):
        return image_url
    return urllib.parse.urljoin(LOCAL_API_BASE, image_url)


def normalize_attack_cost(cost: List[str]) -> List[str]:
    mapped = {
        '草': 'GRASS',
        '火': 'FIRE',
        '水': 'WATER',
        '雷': 'LIGHTNING',
        '超': 'PSYCHIC',
        '斗': 'FIGHTING',
        '恶': 'DARK',
        '钢': 'METAL',
        '龙': 'DRAGON',
        '无色': 'COLORLESS',
    }
    return [mapped.get(item, item) for item in (cost or [])]


def build_raw_data(detail: Dict[str, Any]) -> Dict[str, Any]:
    raw_card = {
        'id': detail.get('id'),
        'name': detail.get('name'),
        'yorenCode': detail.get('yorenCode'),
        'cardType': detail.get('cardTypeCode'),
        'commodityCode': (detail.get('commodityCodes') or [''])[0],
        'details': {
            'regulationMarkText': detail.get('regulationMark'),
            'collectionNumber': detail.get('collectionNumber'),
            'rarityLabel': detail.get('rarityLabel'),
            'cardTypeLabel': detail.get('cardTypeLabel'),
            'attributeLabel': detail.get('attributeLabel'),
            'trainerTypeLabel': detail.get('trainerTypeLabel'),
            'energyTypeLabel': detail.get('energyTypeLabel'),
            'pokemonTypeLabel': detail.get('pokemonTypeLabel'),
            'specialCardLabel': detail.get('specialCardLabel'),
            'hp': detail.get('hp'),
            'evolveText': detail.get('evolveText'),
            'weakness': detail.get('weakness'),
            'resistance': detail.get('resistance'),
            'retreatCost': detail.get('retreatCost'),
        },
        'image': detail.get('imageUrl'),
        'ruleLines': detail.get('ruleLines') or [],
        'attacks': [
            {
                'id': attack.get('id'),
                'name': attack.get('name'),
                'text': attack.get('text') or '',
                'cost': normalize_attack_cost(attack.get('cost') or []),
                'damage': '' if attack.get('damage') is None else str(attack.get('damage')),
            }
            for attack in (detail.get('attacks') or [])
        ],
        'features': [
            {
                'id': feature.get('id'),
                'name': feature.get('name'),
                'text': feature.get('text') or '',
            }
            for feature in (detail.get('features') or [])
        ],
        'illustratorNames': detail.get('illustratorNames') or [],
        'pokemonCategory': detail.get('pokemonCategory'),
        'pokedexCode': detail.get('pokedexCode'),
        'pokedexText': detail.get('pokedexText'),
        'height': detail.get('height'),
        'weight': detail.get('weight'),
        'deckRuleLimit': detail.get('deckRuleLimit'),
    }

    collection = {
        'id': detail.get('collectionId'),
        'commodityCode': (detail.get('commodityCodes') or [''])[0],
        'name': detail.get('collectionName'),
        'commodityNames': detail.get('commodityNames') or [],
    }

    return {
        'raw_card': raw_card,
        'collection': collection,
        'image_url': build_absolute_image_url(detail.get('imageUrl') or ''),
        'source': 'local-api',
        'api_card': detail,
    }


def rarity_score(printing: Dict[str, Any]) -> int:
    label = str(printing.get('rarityLabel') or '').strip().lower()
    code = str(printing.get('rarityCode') or '').strip().lower()
    return max(
        RARITY_PRIORITY.get(label, 0),
        RARITY_PRIORITY.get(code, 0)
    )


def select_top_printings(detail: Dict[str, Any], limit: int = DEFAULT_PRINTING_LIMIT) -> List[Dict[str, Any]]:
    printings = list(detail.get('printings') or [])
    printings.sort(
        key=lambda item: (
            rarity_score(item),
            str(item.get('regulationMark') or ''),
            str(item.get('collectionNumber') or ''),
            int(item.get('id') or 0),
        ),
        reverse=True
    )
    return printings[:limit]


def build_printing_variants(detail: Dict[str, Any], limit: int = DEFAULT_PRINTING_LIMIT) -> List[Dict[str, Any]]:
    variants: List[Dict[str, Any]] = []
    for printing in select_top_printings(detail, limit):
        variants.append({
            'id': printing.get('id'),
            'imageUrl': build_absolute_image_url(printing.get('imageUrl') or ''),
            'collectionNumber': printing.get('collectionNumber'),
            'collectionName': printing.get('collectionName'),
            'collectionId': printing.get('collectionId'),
            'regulationMark': printing.get('regulationMark'),
            'rarityCode': printing.get('rarityCode'),
            'rarityLabel': printing.get('rarityLabel'),
        })
    return variants


def fetch_card_detail(card_id: int) -> Dict[str, Any]:
    return fetch_json(urllib.parse.urljoin(LOCAL_API_BASE, DETAIL_ENDPOINT.format(card_id=card_id)))


def fetch_page(page: int) -> Dict[str, Any]:
    query = urllib.parse.urlencode({
        'page': page,
        'pageSize': PAGE_SIZE,
        'sort': 'collectionNumberAsc',
    })
    url = urllib.parse.urljoin(LOCAL_API_BASE, LIST_ENDPOINT) + '?' + query
    return fetch_json(url)


def download_data(data_path: Path) -> Dict[str, Any]:
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    page = 1
    items: List[Dict[str, Any]] = []
    total_pages = 1

    while page <= total_pages:
        payload = fetch_page(page)
        items.extend(payload.get('items') or [])
        pagination = payload.get('pagination') or {}
        total_pages = int(pagination.get('totalPages') or 1)
        page += 1

    parsed = {
        'source': 'local-api',
        'base_url': LOCAL_API_BASE,
        'total_items': len(items),
        'items': items,
    }

    tmp_path = data_path.with_suffix('.json.tmp')
    tmp_path.write_text(json.dumps(parsed, ensure_ascii=False, indent=2), encoding='utf-8')
    tmp_path.replace(data_path)
    return parsed


def load_data(data_path: Path) -> Dict[str, Any]:
    if not data_path.exists():
        return download_data(data_path)
    return json.loads(data_path.read_text(encoding='utf-8'))


def flatten_cards(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    for card in data.get('items', []):
        row = {
            'id': card.get('id'),
            'name': card.get('name'),
            'yoren_code': card.get('yorenCode'),
            'commodity_code': (card.get('commodityCodes') or [''])[0],
            'card_type': card.get('cardTypeCode'),
            'card_type_label': card.get('cardTypeLabel'),
            'collection_id': card.get('collectionId'),
            'collection_name': card.get('collectionName'),
            'collection_number': card.get('collectionNumber'),
            'rarity': card.get('rarityCode'),
            'rarity_label': card.get('rarityLabel'),
            'regulation_mark_text': card.get('regulationMark'),
            'set_version': to_set_version(card.get('regulationMark')),
            'hp': card.get('hp'),
            'evolve_text': card.get('evolveText'),
            'attribute_label': card.get('attributeLabel'),
            'pokemon_type_label': card.get('pokemonTypeLabel'),
            'special_card_label': card.get('specialCardLabel'),
            'image_url': build_absolute_image_url(card.get('imageUrl') or ''),
        }
        rows.append(row)
    return rows


def to_set_version(regulation_mark: Any) -> str:
    mark = str(regulation_mark or '').strip().lower()
    return f'set_{mark}' if mark else ''


def score_row(row: Dict[str, Any], query: str) -> int:
    q = normalize(query)
    if not q:
        return 0

    score = 0
    name = normalize(str(row.get('name') or ''))
    collection_name = normalize(str(row.get('collection_name') or ''))
    yoren_code = normalize(str(row.get('yoren_code') or ''))
    commodity_code = normalize(str(row.get('commodity_code') or ''))
    collection_number = normalize(str(row.get('collection_number') or ''))
    card_id = normalize(str(row.get('id') or ''))

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
        score = score_row(row, query)
        if score > 0:
            scored.append((score, row))

    scored.sort(
        key=lambda item: (
            item[0],
            str(item[1].get('regulation_mark_text') or ''),
            str(item[1].get('collection_number') or ''),
            str(item[1].get('id') or ''),
        ),
        reverse=True
    )

    output: List[Dict[str, Any]] = []
    for index, (score, row) in enumerate(scored[:limit], start=1):
        item = dict(row)
        item['index'] = index
        item['score'] = score
        output.append(item)

    return len(scored), output


def run_update(args: argparse.Namespace) -> int:
    try:
        data = download_data(DATA_PATH)
    except urllib.error.URLError as err:
        print(json.dumps({'ok': False, 'error': f'download failed: {err}'}, ensure_ascii=False))
        return 1

    out = {
        'ok': True,
        'saved_to': str(DATA_PATH),
        'source': data.get('source'),
        'base_url': data.get('base_url'),
        'total_items': data.get('total_items'),
    }
    print(json.dumps(out, ensure_ascii=False, indent=2))
    return 0


def run_search(args: argparse.Namespace) -> int:
    if args.refresh:
        try:
            data = download_data(DATA_PATH)
        except urllib.error.URLError as err:
            print(json.dumps({'ok': False, 'error': f'refresh failed: {err}'}, ensure_ascii=False))
            return 1
    else:
        data = load_data(DATA_PATH)

    rows = flatten_cards(data)
    total_matches, candidates = search(rows, args.query, args.limit)

    result: Dict[str, Any] = {
        'ok': True,
        'query': args.query,
        'total_matches': total_matches,
        'returned_candidates': len(candidates),
        'needs_selection': total_matches > 1,
        'candidates': candidates,
        'source': 'local-api',
        'base_url': LOCAL_API_BASE,
    }

    if args.select is not None:
        selected = next((candidate for candidate in candidates if candidate.get('index') == args.select), None)
        if selected is None:
            result['ok'] = False
            result['error'] = f'invalid --select index: {args.select}'
            print(json.dumps(result, ensure_ascii=False, indent=2))
            return 1

        detail = fetch_card_detail(int(selected['id']))
        selected = dict(selected)
        selected['api_card'] = detail
        selected['card'] = build_raw_data(detail)
        selected['image_url'] = build_absolute_image_url(detail.get('imageUrl') or '')
        selected['selectedLogicalCard'] = detail
        selected['selectedPrintings'] = build_printing_variants(detail, args.limit_printings)
        selected['r2ImageUrls'] = [item['imageUrl'] for item in selected['selectedPrintings']]
        selected['rawDataSeed'] = selected['card']
        result['selected'] = selected
    elif len(candidates) == 1:
        detail = fetch_card_detail(int(candidates[0]['id']))
        selected = dict(candidates[0])
        selected['api_card'] = detail
        selected['card'] = build_raw_data(detail)
        selected['image_url'] = build_absolute_image_url(detail.get('imageUrl') or '')
        selected['selectedLogicalCard'] = detail
        selected['selectedPrintings'] = build_printing_variants(detail, args.limit_printings)
        selected['r2ImageUrls'] = [item['imageUrl'] for item in selected['selectedPrintings']]
        selected['rawDataSeed'] = selected['card']
        result['selected'] = selected

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description='Resolve card objects and local image URLs.')
    subparsers = parser.add_subparsers(dest='command', required=True)

    update_parser = subparsers.add_parser('update', help='Download and update local API cache.')
    update_parser.set_defaults(func=run_update)

    search_parser = subparsers.add_parser('search', help='Search card candidates from local API cache.')
    search_parser.add_argument('query', help='Card name/code/id keyword.')
    search_parser.add_argument('--limit', type=int, default=20, help='Max candidates to return.')
    search_parser.add_argument('--select', type=int, default=None, help='Select index from current candidates.')
    search_parser.add_argument('--refresh', action='store_true', help='Refresh cache before searching.')
    search_parser.add_argument('--limit-printings', type=int, default=DEFAULT_PRINTING_LIMIT, help='Max printings to include when selecting a logical card.')
    search_parser.set_defaults(func=run_search)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return args.func(args)


if __name__ == '__main__':
    sys.exit(main())
