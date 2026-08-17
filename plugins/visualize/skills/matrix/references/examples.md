# matrix examples

Sample inputs and the script's actual stdout, run via `node scripts/render.js` from this skill's base directory. The grid uses single-line Unicode box-drawing characters: `┌ ┬ ┐ ├ ┼ ┤ └ ┴ ┘ ─ │`, matching the table skill's border style.

## Feature comparison across plans

Input:

```json
{"rowLabels": ["SSO", "Audit log", "API access"], "colLabels": ["Basic", "Pro", "Enterprise"], "cells": [["no", "no", "yes"], ["no", "yes", "yes"], ["limited", "yes", "yes"]]}
```

Output:

```
┌────────────┬─────────┬─────┬────────────┐
│            │ Basic   │ Pro │ Enterprise │
├────────────┼─────────┼─────┼────────────┤
│ SSO        │ no      │ no  │ yes        │
│ Audit log  │ no      │ yes │ yes        │
│ API access │ limited │ yes │ yes        │
└────────────┴─────────┴─────┴────────────┘
```

## Lightweight heatmap with short symbols

`cells` values are not restricted to a fixed symbol set, so single characters work for a compact grid. This example uses `x`/`.`; `●`/`○` or the shading blocks `░▒▓█` are also good choices, purely a caller preference.

Input:

```json
{"rowLabels": ["Mon", "Tue", "Wed"], "colLabels": ["9am", "12pm", "3pm", "6pm"], "cells": [["x", ".", ".", "x"], [".", "x", "x", "."], ["x", "x", ".", "."]]}
```

Output:

```
┌─────┬─────┬──────┬─────┬─────┐
│     │ 9am │ 12pm │ 3pm │ 6pm │
├─────┼─────┼──────┼─────┼─────┤
│ Mon │ x   │ .    │ .   │ x   │
│ Tue │ .   │ x    │ x   │ .   │
│ Wed │ x   │ x    │ .   │ .   │
└─────┴─────┴──────┴─────┴─────┘
```

## Edge case: a 1x1 matrix

Input:

```json
{"rowLabels": ["Only feature"], "colLabels": ["Only plan"], "cells": [["yes"]]}
```

Output:

```
┌──────────────┬───────────┐
│              │ Only plan │
├──────────────┼───────────┤
│ Only feature │ yes       │
└──────────────┴───────────┘
```
