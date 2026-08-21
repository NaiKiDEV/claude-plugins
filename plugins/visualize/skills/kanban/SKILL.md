---
name: kanban
description: Render tasks grouped by status as a side-by-side kanban board, for sprint boards, backlog triage, or any work broken into stages.
argument-hint: [content to visualize, or nothing to use the last output]
disable-model-invocation: true
allowed-tools: Bash(node *) Read Grep Glob
disallowed-tools: Edit Write NotebookEdit
---

Render $ARGUMENTS as a kanban board.

## Resolve what was asked

- No argument: the target is the last substantive assistant message in the conversation, not this invocation. Pull whatever set of tasks by status fits out of it.
- The argument IS the content, a described set of tasks grouped by status: use it directly.
- The argument NAMES something else, a file, "the sprint board", "the task list": locate it first with Read, Grep, or Glob, then extract the columns.
- Never invent cards to fill the shape. If the source does not map cleanly onto columns and cards, say what was inferred, or say the fit is poor and point at a better-suited visualize skill (a list or a table) instead of forcing it.

## Schema

The script reads this exact JSON on stdin:

```json
{
  "columns": [
    {"name": "To Do", "cards": ["Task A", "Task B"]},
    {"name": "In Progress", "cards": ["Task C"]},
    {"name": "Done", "cards": []}
  ]
}
```

- `columns`: required non-empty array, one bordered box per entry. Each entry needs `name` (non-empty string) and `cards` (array of strings, may be empty).

Every column box renders at the same width: the longest card or column header across all columns (the `(empty)` placeholder counts toward this too, so it never overflows its box). An empty column prints a single `(empty)` placeholder row, as plain text, unchanged. Columns with fewer cards than the tallest column pad with blank bordered rows so every box ends on the same bottom border line.

Each column is its own self-contained box, drawn with the light box-drawing set `┌ ─ ┐ │ └ ┘ ├ ┤`, all single-code-unit characters. The header/body divider inside a box uses the tee glyphs `├ ┤`, the same way a table's internal row dividers work. Columns sit side by side with a space gap, never sharing an edge, so there is no shared-junction rendering to get wrong between columns.

## Render

Build the JSON payload from the resolved columns, then pipe it through the script from this skill's own base directory (Claude Code states the base directory when the skill loads):

```
node scripts/render.js <<'JSON'
{ ... }
JSON
```

Relay stdout verbatim. Never hand-retype or adjust its spacing.

A non-zero exit means the JSON was malformed or missing a required field: stderr names the problem. Fix the JSON once and retry. If it still fails, say so rather than hand-drawing a fallback.

## Output

- The rendered block, exactly as the script printed it.
- One line noting the source used (the conversation, the named file, and so on) and anything inferred.
