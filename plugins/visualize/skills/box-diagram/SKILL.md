---
name: box-diagram
description: Render a set of components and the relationships between them as left-to-right boxes connected by labeled arrows, drawn with Unicode box-drawing characters.
argument-hint: [content to visualize, or nothing to use the last output]
disable-model-invocation: true
allowed-tools: Bash(node *) Read Grep Glob
disallowed-tools: Edit Write NotebookEdit
---

Render $ARGUMENTS as a box diagram.

## Resolve what was asked

- No argument: the target is the last substantive assistant message in the conversation, not this invocation. Pull whatever components and relationships fit out of it.
- The argument is the content itself: a description of components and how they relate, a typed list of parts, or pasted architecture notes. Use it directly.
- The argument names something else, such as a file, "the auth flow", or "the deployment pipeline": locate it first with Read, Grep, or Glob, the way `/where` or `/how` would, then extract the nodes and edges from what you find.
- Never invent nodes or edges to fill the shape. If the source does not map cleanly onto components and relationships, say what was inferred, or say the fit is poor and suggest `state-machine`, `tree`, or another visualize skill instead of forcing it.

## Schema

```json
{
  "nodes": [{"id": "A", "label": "API Gateway"}, {"id": "B", "label": "Auth Service"}],
  "edges": [{"from": "A", "to": "B", "label": "validates token"}]
}
```

- `nodes`: required, non-empty array. Each entry needs a unique `id` (string) and a `label` (string).
- `edges`: optional array. Each entry needs `from` and `to` (existing node ids) and an optional `label` (string).

## Layout

This is not a general graph layout, and it does not attempt one. Nodes are drawn strictly left to right in the order given, each a bordered box sized to its label. An edge becomes a drawn arrow only when its `from` and `to` are that exact adjacent pair, in that direction. Every other edge, reversed, skipping a node, or a second edge between a pair already drawn, cannot be shown spatially, so it is listed as plain text beneath the diagram instead: `A → C: label`. This guarantees every edge is represented somewhere. For a diagram with many cross-links, expect most edges to land in that text list rather than as arrows, and say so before rendering.

**Output charset.** Boxes use single-line Unicode box-drawing characters: `┌ ─ ┐ │ └ ┘`. A connector between adjacent boxes is a `─` run ending in `→`, with its label centered on the line above. The non-adjacent fallback text also uses `→` in place of an ASCII arrow, for example `A → C: label`. There is no ASCII fallback mode; every character above is a single UTF-16 code unit, so nothing here needs width math beyond ordinary string length.

## Render

Build the JSON from the resolved content, then pipe it through the script, resolved relative to this skill's own base directory:

```
node scripts/render.js <<'JSON'
{ ... }
JSON
```

Relay stdout verbatim. Never hand-retype it or adjust its spacing. On a non-zero exit, stderr names the exact problem: fix the JSON once and retry. If it still fails, say so rather than hand-drawing a fallback diagram.

## Output

The rendered block, including any cross-link edges listed as text beneath it, followed by one line naming the source used (the argument, the last assistant message, or the located file) and anything that was inferred to fit the shape.
