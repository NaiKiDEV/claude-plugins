---
name: state-machine
description: Render a set of states and the transitions between them as left-to-right boxes with start and accept markers, plus a full transition table, drawn with Unicode box-drawing characters.
argument-hint: [content to visualize, or nothing to use the last output]
disable-model-invocation: true
allowed-tools: Bash(node *) Read Grep Glob
disallowed-tools: Edit Write NotebookEdit
---

Render $ARGUMENTS as a state machine.

## Resolve what was asked

- No argument: the target is the last substantive assistant message in the conversation, not this invocation. Pull whatever states and transitions fit out of it.
- The argument is the content itself: a description of states and how they transition, a typed list, or pasted state-machine notes. Use it directly.
- The argument names something else, such as a file, "the order lifecycle", or "the auth flow": locate it first with Read, Grep, or Glob, the way `/where` or `/how` would, then extract the states and transitions from what you find.
- Never invent states or transitions to fill the shape. If the source does not map cleanly onto states and transitions, say what was inferred, or say the fit is poor and suggest `box-diagram`, `tree`, or another visualize skill instead of forcing it.

## Schema

```json
{
  "states": [
    {"id": "idle", "label": "Idle", "start": true},
    {"id": "running", "label": "Running"},
    {"id": "done", "label": "Done", "accept": true}
  ],
  "transitions": [
    {"from": "idle", "to": "running", "label": "start()"},
    {"from": "running", "to": "done", "label": "complete()"}
  ]
}
```

- `states`: required, non-empty array. Each entry needs a unique `id` (string) and a `label` (string). `start` and `accept` are optional booleans.
- `transitions`: optional array. Each entry needs `from` and `to` (existing state ids) and an optional `label` (string).

## Layout

This is not a general graph layout, and it does not attempt one. States are drawn strictly left to right in the order given, each a bordered box sized to its label. A transition becomes a drawn arrow only when its `from` and `to` are that exact adjacent pair, in that direction, so a back-edge or a cycle can never be drawn spatially. A start state gets a `(start) →` marker before its box. Below the box layout, the script always prints a full transition table listing every `from → to : label`, in order, regardless of whether it was drawable. That table is the source of truth: for a machine with cycles or back-edges, expect the picture to under-represent it and point the reader at the table.

**Output charset.** Ordinary state boxes use single-line Unicode box-drawing characters: `┌ ─ ┐ │ └ ┘`. An accept state's box uses the double-line set instead: `╔ ═ ╗ ║ ╚ ╝`. A connector between adjacent boxes is a `─` run ending in `→`, with its label centered on the line above; the transition table and the start marker use that same `→`. There is no ASCII fallback mode; every character above is a single UTF-16 code unit, so nothing here needs width math beyond ordinary string length.

**Why mixing border weights is safe here, and only here.** Every box in this layout, including an accept state's, is a fully self-contained rectangle: it never shares a border edge with a neighboring box. Connectors are drawn as separate line segments in the gap between two boxes, not as a shared wall. That is what makes it safe to give an accept state a double-line border while its neighbors stay single-line: there is no junction where a single-line and a double-line edge would need to meet and no box-drawing character for that mixed junction exists. Do not carry this trick into a layout where boxes actually touch or share an edge; there it would produce a mismatched, incorrect corner.

## Render

Build the JSON from the resolved content, then pipe it through the script, resolved relative to this skill's own base directory:

```
node scripts/render.js <<'JSON'
{ ... }
JSON
```

Relay stdout verbatim. Never hand-retype it or adjust its spacing. On a non-zero exit, stderr names the exact problem: fix the JSON once and retry. If it still fails, say so rather than hand-drawing a fallback diagram.

## Output

The rendered block, including the transition table beneath it, followed by one line naming the source used (the argument, the last assistant message, or the located file) and anything that was inferred to fit the shape.
