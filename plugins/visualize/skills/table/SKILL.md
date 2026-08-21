---
name: table
description: Render tabular content as a bordered grid, with optional per-column alignment and a totals footer.
argument-hint: [content to visualize, or nothing to use the last output]
disable-model-invocation: true
allowed-tools: Bash(node *) Read Grep Glob
disallowed-tools: Edit Write NotebookEdit
---

Render $ARGUMENTS as a table.

## Resolve what was asked

- No argument: the target is the last substantive assistant message in the conversation, not this invocation. Pull whatever rows and columns fit out of it.
- The argument is the content itself: pasted data, a typed list, or a described set of rows. Use it directly.
- The argument names something else, such as a file, a decision, or "the pricing tiers": locate it first with Read, Grep, or Glob, then extract the rows and columns from what you find.
- Never invent data to fill the shape. If the source has fewer or more columns than it looks like it wants, use what is actually there. If the source does not map cleanly onto a flat table, say what was inferred, or say the fit is poor and suggest `table-grouped` or another visualize skill instead of forcing it.

## Schema

```json
{
  "title": "optional string",
  "columns": ["Name", "Status", "Owner"],
  "align": ["left", "left", "left"],
  "rows": [["Apples", "done", "alice"]],
  "totals": ["", "3 done", ""]
}
```

- `title`: optional string, printed above the table.
- `columns`: required, non-empty array of strings.
- `align`: optional, one entry per column, each `left`, `right`, or `center`. Defaults to `left`.
- `rows`: required array of arrays. Each row must have exactly as many cells as `columns`.
- `totals`: optional footer row, same cell count as `columns`, rendered below its own separator.

Borders render as single-line Unicode box-drawing characters only: `┌ ┬ ┐ ├ ┼ ┤ └ ┴ ┘ ─ │`. Every internal divider shares the same junction style; only the top and bottom rows use their own corners.

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
