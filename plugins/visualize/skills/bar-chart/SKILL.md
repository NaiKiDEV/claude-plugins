---
name: bar-chart
description: Render labeled non-negative values as a horizontal bar chart of solid block characters, for comparing magnitudes across categories.
argument-hint: [content to visualize, or nothing to use the last output]
disable-model-invocation: true
allowed-tools: Bash(node *) Read Grep Glob
disallowed-tools: Edit Write NotebookEdit
---

Render $ARGUMENTS as a horizontal bar chart.

## Resolve what was asked

- **No argument.** The target is the last substantive assistant message in the conversation, not this invocation. Pull whatever labeled numeric values fit a bar chart out of it.
- **The argument is the content itself**, numbers or values described or pasted directly. Use them as given.
- **The argument names something else**, a file, "the benchmark results", "last quarter's numbers by region". Locate it first with Read, Grep, or Glob, then extract labels and values.
- Never invent numbers to fill the shape. If the source does not map cleanly to labeled non-negative values, say what was inferred, or say the fit is poor and point to a better-suited visualize skill (a table for mixed columns, a matrix for a comparison grid) instead of forcing it.

## Schema

```json
{
  "title": "optional string",
  "bars": [{"label": "Q1", "value": 42}, {"label": "Q2", "value": 78}],
  "unit": "optional string, e.g. \"%\" or \"ms\", appended after each value"
}
```

- `title`: optional string.
- `bars`: required, non-empty array of `{label: string, value: number}`. `value` must be zero or positive. This skill renders non-negative values only and does not attempt a zero-centered diverging bar chart for negatives; that is out of scope.
- `unit`: optional string, appended right after each value.

## Character set

Bars are filled with the solid block character `█` (U+2588). No ASCII fallback: this is the only fill character the script emits. Everything else in the output (labels, digits, the unit string, spacing) is whatever the caller supplied or plain ASCII.

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
