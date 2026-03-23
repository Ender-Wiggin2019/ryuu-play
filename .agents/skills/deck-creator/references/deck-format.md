# Deck Format Notes

## Accepted line format

Each card row should look like:

`{COUNT} {NAME} {SET_CODE} {SET_NUMBER}`

Examples:

- `3 Teal Mask Ogerpon ex SVP 166`
- `1 Boss's Orders ASC 256`
- `3 Basic Fighting Energy SVE 14`

The parser only requires `{COUNT}` and `{NAME}`.  
`{SET_CODE}` and `{SET_NUMBER}` are optional metadata.

## Ignored lines

The parser ignores these rows:

- `By: ...`
- `Pokémon:12` / `Trainer:36` / `Energy:12`
- `Total Cards:60`

## Output expectation

The analyzer generates:

- `deck_todo.md` for missing cards
- `deck_plan.md` for build plan with EN/CN descriptions
- `analysis_report.json` for machine-readable summary

## Output directory rule

- Default output directory is `docs/decks/<deck-name>/`.
- If user does not provide deck name, ask for it before running analysis.
- You may still override with `--output-dir` for special cases.
