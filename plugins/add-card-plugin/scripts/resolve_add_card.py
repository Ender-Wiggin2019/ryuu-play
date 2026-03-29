#!/usr/bin/env python3

import argparse
import json
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional


API_BASE = 'http://localhost:3000'
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


def fetch_json(url: str) -> Dict[str, Any]:
    req = urllib.request.Request(url, headers={'Accept': 'application/json'})
    with urllib.request.urlopen(req, timeout=30) as res:
        return json.load(res)


def rarity_score(item: Dict[str, Any]) -> int:
    label = str(item.get('rarityLabel') or '').strip().lower()
    code = str(item.get('rarityCode') or '').strip().lower()
    return max(RARITY_PRIORITY.get(label, 0), RARITY_PRIORITY.get(code, 0))


def select_printings(detail: Dict[str, Any], limit: int) -> List[Dict[str, Any]]:
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


def build_set_target(detail: Dict[str, Any]) -> str:
    mark = str((detail.get('printings') or [{}])[0].get('regulationMark') or '').strip().lower()
    return f'packages/sets/src/standard/set_{mark}/' if mark else 'packages/sets/src/standard/'


def build_raw_data_seed(detail: Dict[str, Any], printings: List[Dict[str, Any]]) -> Dict[str, Any]:
    primary = printings[0] if printings else {}
    return {
        'logicalCardId': detail.get('id'),
        'name': detail.get('name'),
        'imageUrl': detail.get('imageUrl'),
        'regulationMark': primary.get('regulationMark'),
        'collectionNumber': primary.get('collectionNumber'),
        'rarityLabel': primary.get('rarityLabel'),
        'ruleLines': detail.get('ruleLines') or [],
        'attacks': detail.get('attacks') or [],
        'features': detail.get('features') or [],
        'printings': printings,
    }


def search_cards(query: str, regulation_mark: Optional[str]) -> Dict[str, Any]:
    params = {'q': query, 'page': 1, 'pageSize': 10}
    if regulation_mark:
        params['regulationMark[]'] = regulation_mark
    url = API_BASE + '/api/v1/cards?' + urllib.parse.urlencode(params, doseq=True)
    payload = fetch_json(url)
    items = list(payload.get('items') or [])
    items.sort(
        key=lambda item: (
            int(item.get('printCount') or 0),
            str(item.get('name') or ''),
            int(item.get('id') or 0),
        ),
        reverse=True
    )
    payload['items'] = items
    return payload


def resolve_detail(logical_card_id: int) -> Dict[str, Any]:
    return fetch_json(f'{API_BASE}/api/v1/cards/{logical_card_id}')


def build_card_plan(query: str, regulation_mark: Optional[str], select_id: Optional[int], limit_printings: int) -> Dict[str, Any]:
    logical_card_id = select_id
    search_result = None

    if logical_card_id is None:
        search_result = search_cards(query, regulation_mark)
        items = search_result.get('items') or []
        if not items:
            return {
                'query': query,
                'ok': False,
                'error': 'NO_LOGICAL_CARD_MATCH'
            }
        logical_card_id = int(items[0]['id'])

    detail = resolve_detail(logical_card_id)
    printings = select_printings(detail, limit_printings)
    return {
        'query': query,
        'ok': True,
        'logicalCandidates': (search_result or {}).get('items', []),
        'selectedLogicalCard': detail,
        'selectedPrintings': printings,
        'r2ImageUrls': [item.get('imageUrl') for item in printings if item.get('imageUrl')],
        'setTarget': build_set_target(detail),
        'rawDataSeed': build_raw_data_seed(detail, printings),
        'implementationHints': [
            '优先在 packages/sets 实现单卡逻辑，只有缺底层规则能力时再改 packages/common。',
            '同逻辑多卡图只实现一次逻辑，variant 通过 unique fullName 与 printings 接入。',
            '卡效完成后不要只停在编译通过，必须进入 scenario-lab-testing 的终端回归。',
        ],
        'regressionPlan': {
            'skill': 'scenario-lab-testing',
            'path': 'terminal',
            'preferredEntry': 'npm run scenario:debug -- <scenario-file>',
            'successCondition': 'Scenario Lab regression passed',
            'notes': [
                '默认不依赖浏览器操作。',
                '造局使用 patch，效果执行使用 action/prompt/resolve。',
                '只有断言通过才算这张卡完成。'
            ]
        }
    }


def main() -> int:
    parser = argparse.ArgumentParser(description='Resolve logical cards and scaffold data for Ryuu Play card creation.')
    parser.add_argument('queries', nargs='+', help='Pokemon names, keywords, or logical card ids')
    parser.add_argument('--regulation-mark', default=None)
    parser.add_argument('--select-id', type=int, default=None)
    parser.add_argument('--limit-printings', type=int, default=DEFAULT_PRINTING_LIMIT)
    args = parser.parse_args()

    cards = [
        build_card_plan(query, args.regulation_mark, args.select_id, args.limit_printings)
        for query in args.queries
    ]
    payload = {
        'ok': all(item.get('ok') for item in cards),
        'pokemonQueries': args.queries,
        'cards': cards,
        'workflow': {
            'search': '从 localhost:3000 逻辑卡 API 查询目标卡与 printings',
            'implement': '在 packages/sets 实现卡牌逻辑，必要时扩展 packages/common',
            'regression': '使用 scenario-lab-testing 做终端回归，断言通过后才算完成'
        },
        'terminalCondition': {
            'doneWhen': 'all scenario-lab regressions pass',
            'skill': 'scenario-lab-testing',
            'browserRequired': False
        }
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0 if payload['ok'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
