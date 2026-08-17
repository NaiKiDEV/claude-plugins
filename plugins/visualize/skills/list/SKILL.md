---
name: list
description: Render content as a plain-ASCII nested bullet list, for outlining points, breaking a topic into parts, or turning prose into a scannable hierarchy.
argument-hint: [content to visualize, or nothing to use the last output]
disable-model-invocation: true
allowed-tools: Bash(node *) Read Grep Glob
disallowed-tools: Edit Write NotebookEdit
---

Render $ARGUMENTS as a plain-ASCII nested list.

## Resolve what was asked

- No argument: the target is the last substantive assistant message in the conversation, not this invocation. Pull whatever structure fits out of it.
- Argument is the content itself, such as pasted data, a typed description, or a list: use it directly.
- Argument names something else, such as a file, a decision, or "the launch tasks": locate it first (Read, Grep, Glob) the way `/where` or `/how` would, then extract the structure.
- Never invent data to fill the shape. If the source does not map cleanly onto a list, say what was inferred, or say the fit is poor and point at a better-suited visualize skill instead of forcing it.

## Schema

```json
{
  "title": "optional string",
  "items": [
    {"text": "First point", "children": [{"text": "sub point", "children": []}]},
    {"text": "Second point", "children": []}
  ],
  "marker": "-"
}
```

- `title`: optional string. Omit it for no header line.
- `items`: required array of item objects.
  - `text`: required string.
  - `children`: optional array of item objects, same shape, recursed to arbitrary depth. Defaults to empty.
- `marker`: optional, one of `-` `*` `+`. Defaults to `-`. Sets where the depth cycle starts: depth 0 renders `marker`, then the sequence `-` `*` `+` continues from that point and repeats every three levels.

## Render

Build the JSON payload from the resolved content, then pipe it through the script from this skill's own base directory:

```
node scripts/render.js <<'JSON'
{ ... }
JSON
```

Relay stdout verbatim. Do not hand-retype it or adjust its spacing. A non-zero exit means stderr names the problem: fix the JSON once and retry. If it still fails, say so rather than hand-drawing a fallback.

## Output

- The rendered block, exactly as the script printed it.
- One line noting the source used (the argument, the located file, or the last assistant message) and anything inferred while mapping it onto the schema.
