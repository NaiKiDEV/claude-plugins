---
name: matrix
description: Render a row-by-column comparison as a bordered grid using Unicode box-drawing lines, for feature comparisons, plan matrices, or lightweight heatmaps.
argument-hint: [content to visualize, or nothing to use the last output]
disable-model-invocation: true
allowed-tools: Bash(node *) Read Grep Glob
disallowed-tools: Edit Write NotebookEdit
---

Render $ARGUMENTS as a bordered comparison matrix.

## Resolve what was asked

- **No argument.** The target is the last substantive assistant message in the conversation, not this invocation. Pull whatever row-by-column comparison fits out of it.
- **The argument is the content itself**, a described comparison or pasted rows and columns. Use it directly.
- **The argument names something else**, a file, "the feature comparison", "the plan matrix". Locate it first with Read, Grep, or Glob, then extract rows and columns.
- Never invent cells to fill the shape. If the source does not map cleanly to a row-by-column grid, say what was inferred, or say the fit is poor and point to a better-suited visualize skill (a table for a single list of records, a bar-chart for magnitudes) instead of forcing it.

## Schema

```json
{
  "rowLabels": ["Feature A", "Feature B"],
  "colLabels": ["Plan Basic", "Plan Pro"],
  "cells": [["yes", "yes"], ["no", "yes"]]
}
```

- `rowLabels`: required, non-empty array of strings.
- `colLabels`: required, non-empty array of strings.
- `cells`: required, `rowLabels.length` rows by `colLabels.length` columns, row-major. Values print as given, so pass short strings such as `"x"`/`"."` for a lightweight heatmap look or full words for a feature matrix; there is no fixed symbol set to conform to. If choosing symbols for a heatmap, `●`/`○` or the shading blocks `░▒▓█` read well against the grid, but that is a suggestion, not a requirement; any short string works.

## Character set

The grid is drawn with single-line Unicode box-drawing characters: `┌ ┬ ┐ ├ ┼ ┤ └ ┴ ┘ ─ │`. This matches the table skill's border style exactly. No ASCII fallback: this is the only border character set the script emits. Cell content is printed exactly as given in `cells`, whatever charset that is.

## Render

Build the JSON payload from what was resolved, then pipe it through the script from this skill's own base directory:

```
node scripts/render.js <<'JSON'
{ ... }
JSON
```

Relay stdout verbatim. Never hand-retype it or adjust its spacing. A non-zero exit means stderr names the problem: fix the JSON once and retry. If it still fails, say so rather than hand-drawing a fallback.

## Output

- The rendered block, verbatim.
- One line naming the source used (the conversation, a file, a described comparison) and anything inferred.
