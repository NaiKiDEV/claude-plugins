---
name: checklist
description: Render content as a plain-ASCII checklist with done, pending, blocked, and in-progress states, for tracking tasks, steps, or a plan's completion.
argument-hint: [content to visualize, or nothing to use the last output]
disable-model-invocation: true
allowed-tools: Bash(node *) Read Grep Glob
disallowed-tools: Edit Write NotebookEdit
---

Render $ARGUMENTS as a plain-ASCII checklist.

## Resolve what was asked

- No argument: the target is the last substantive assistant message in the conversation, not this invocation. Pull whatever structure fits out of it.
- Argument is the content itself, such as pasted data, a typed description, or a list of tasks: use it directly.
- Argument names something else, such as a file, a decision, or "the launch tasks": locate it first (Read, Grep, Glob), then extract the structure.
- Never invent data to fill the shape. If the source does not map cleanly onto a checklist, say what was inferred, or say the fit is poor and point at a better-suited visualize skill instead of forcing it. States must come from the source, not a guess: if completion is not stated anywhere, do not assign `done`.

## Schema

```json
{
  "title": "optional string",
  "items": [
    {"text": "Task", "state": "done", "children": []}
  ],
  "showProgress": true
}
```

- `title`: optional string. Omit it for no header line.
- `items`: required array of item objects.
  - `text`: required string.
  - `state`: required, one of `done` `pending` `blocked` `in-progress`. Renders as `[x]` `[ ]` `[!]` `[~]` respectively.
  - `children`: optional array of item objects, same shape, recursed to arbitrary depth. Defaults to empty.
- `showProgress`: optional boolean. When true, appends a final summary line `N/M done (P%)` computed from leaf items only (items with no children), with `P` rounded to the nearest integer.

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
