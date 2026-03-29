#!/usr/bin/env python3

import argparse
import json
from typing import Optional


def build_steps(mode: str, target: Optional[str]) -> list[str]:
    route = {
        'testing': '/testing',
        'scenario': '/scenario',
        'table': target or '/table/:id',
    }[mode]
    return [
        '执行 npm run restart:app',
        '打开 http://127.0.0.1:12021/',
        '使用默认账号 easygod3780 / pass123 登录',
        f'进入 {route}',
        '按目标复现操作',
        '采集 prompt、日志、快照、截图、网络与 console 证据',
    ]


def main() -> int:
    parser = argparse.ArgumentParser(description='Build a structured Chrome card testing session template.')
    parser.add_argument('--mode', choices=['testing', 'scenario', 'table'], required=True)
    parser.add_argument('--target', default=None, help='Optional route or id for table mode')
    parser.add_argument('--goal', required=True, help='What this browser test should verify')
    args = parser.parse_args()

    payload = {
        'ok': True,
        'defaults': {
            'node': 22,
            'baseUrl': 'http://127.0.0.1:12021/',
            'username': 'easygod3780',
            'password': 'pass123',
        },
        'mode': args.mode,
        'goal': args.goal,
        'steps': build_steps(args.mode, args.target),
        'observations': [],
        'screenshots': [],
        'networkFindings': [],
        'assertionSummary': {
            'passed': None,
            'summary': '',
        }
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
