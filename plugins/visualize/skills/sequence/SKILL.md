---
name: sequence
description: Render an exchange between two or more parties as a sequence diagram with lifelines and directional message arrows, drawn with box-drawing characters.
argument-hint: [content to visualize, or nothing to use the last output]
disable-model-invocation: true
allowed-tools: Bash(node *) Read Grep Glob
disallowed-tools: Edit Write NotebookEdit
---

Render $ARGUMENTS as a sequence diagram.

## Resolve what was asked

- No argument: the target is the last substantive assistant message in the conversation, not this invocation. Pull whatever exchange fits out of it.
- Argument is the content itself, such as a described interaction between parties: use it directly.
- Argument names something else, such as a file, "the login flow", or "the checkout process": locate it first (Read, Grep, Glob) the way `/where` or `/how` would, then extract the participants and messages.
- Never invent participants or messages to fill the shape. If the source does not map cleanly onto participants exchanging messages, say what was inferred, or say the fit is poor and point at `flowchart` instead of forcing it: a single actor working through branching steps belongs there, an exchange between parties belongs here.

## Schema

```json
{
  "participants": ["Client", "API", "DB"],
  "messages": [
    {"from": "Client", "to": "API", "label": "POST /login"},
    {"from": "API", "to": "DB", "label": "SELECT user"},
    {"from": "DB", "to": "API", "label": "row"},
    {"from": "API", "to": "Client", "label": "200 OK"}
  ]
}
```

- `participants`: required, array of at least two unique non-empty strings, left to right in display order.
- `messages`: required, non-empty array, ordered top to bottom (earliest first).
  - `from`: required string, must match a `participants` entry.
  - `to`: required string, must match a `participants` entry, different from `from`.
  - `label`: required string.

Arrow direction follows the two participants' column order, not which field is `from` and which is `to`: a message moving from a left column to a right column ends in `→`, right to left ends in `←`. Column spacing grows to fit the widest name or label touching a gap, including a label that spans more than one gap.

## Characters

The script draws with a fixed set of box-drawing glyphs. No ASCII fallback: this is what every render looks like.

- Lifelines: `│`, one per participant, running down every row.
- Message arrows: a `─` fill between the two columns, ending in `→` for left-to-right or `←` for right-to-left.

## Render

Build the JSON payload from the resolved participants and messages, then pipe it through the script from this skill's own base directory:

```
node scripts/render.js <<'JSON'
{ ... }
JSON
```

Relay stdout verbatim. Do not hand-retype it or adjust its spacing. A non-zero exit means stderr names the problem: fix the JSON once and retry. If it still fails, say so rather than hand-drawing a fallback.

## Output

- The rendered block, exactly as the script printed it.
- One line noting the source used (the argument, the located file, or the last assistant message) and anything inferred while mapping it onto the schema.
