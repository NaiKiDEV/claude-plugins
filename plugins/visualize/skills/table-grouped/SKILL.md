---
name: table-grouped
description: Render tabular content as a bordered grid split into labeled row groups, with optional per-group subtotals and a grand total.
argument-hint: [content to visualize, or nothing to use the last output]
disable-model-invocation: true
allowed-tools: Bash(node *) Read Grep Glob
disallowed-tools: Edit Write NotebookEdit
---

Render $ARGUMENTS as a grouped table.

## Resolve what was asked

- No argument: the target is the last substantive assistant message in the conversation, not this invocation. Pull whatever groups and rows fit out of it.
- The argument is the content itself: pasted data, a typed list, or a described set of grouped rows. Use it directly.
- The argument names something else, such as a file, a decision, or "the pricing tiers": locate it first with Read, Grep, or Glob, then extract the groups and rows from what you find.
- Never invent data to fill the shape. If the source has no natural grouping, do not manufacture one. Say the fit is poor and suggest plain `table` instead. If the source's groups map cleanly but subtotals or a grand total are not present in the source, leave those fields out rather than computing or guessing numbers.

## Schema

```json
{
  "title": "optional string",
  "columns": ["Item", "Qty", "Price"],
  "groups": [
    {"label": "Produce", "rows": [["Apples", "10", "$5"]], "subtotal": ["", "", "$32"]},
    {"label": "Dairy", "rows": [["Milk", "4", "$12"]], "subtotal": ["", "", "$12"]}
  ],
  "grandTotal": ["", "", "$120"]
}
```

- `title`: optional string, printed above the table.
- `columns`: required, non-empty array of strings.
- `groups`: required array. Each group has a required `label` string, a required `rows` array of arrays (each with exactly as many cells as `columns`), and an optional `subtotal` row with the same cell count as `columns`.
- `grandTotal`: optional footer row, same cell count as `columns`, rendered below a separator at the very bottom.

Borders render as single-line Unicode box-drawing characters only: `┌ ┬ ┐ ├ ┼ ┤ └ ┴ ┘ ─ │`. Every internal divider, including group labels, subtotals, and the grand total, shares the same junction style; only the top and bottom rows use their own corners.

## Render

Build the JSON payload from the resolved data and pipe it through the script, resolved relative to this skill's own base directory:

```
node scripts/render.js <<'JSON'
{ ... }
JSON
```

Relay stdout verbatim. Never hand-retype it or adjust its spacing. On a non-zero exit, stderr names the exact problem: fix the JSON once and retry. If it still fails, say so rather than hand-drawing a fallback table.

## Output

The rendered block, followed by one line naming the source used (the argument, the last assistant message, or the located file) and anything that was inferred to fit the shape.
