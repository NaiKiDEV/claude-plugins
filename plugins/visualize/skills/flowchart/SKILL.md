---
name: flowchart
description: Render a process or decision sequence as a top-to-bottom flowchart of start, process, decision, and end steps, drawn with box-drawing characters.
argument-hint: [content to visualize, or nothing to use the last output]
disable-model-invocation: true
allowed-tools: Bash(node *) Read Grep Glob
disallowed-tools: Edit Write NotebookEdit
---

Render $ARGUMENTS as a flowchart.

## Resolve what was asked

- No argument: the target is the last substantive assistant message in the conversation, not this invocation. Pull whatever structure fits out of it.
- Argument is the content itself, such as a described process with steps and decision points: use it directly.
- Argument names something else, such as a file, "the login flow", or "the checkout process": locate it first (Read, Grep, Glob), then extract the structure.
- Never invent steps to fill the shape. If the source does not map cleanly onto start, process, decision, and end steps, say what was inferred, or say the fit is poor and point at `sequence` instead of forcing it: a single flow of steps and decisions belongs here, an exchange of messages between two or more parties does not.

## Schema

```json
{
  "steps": [
    {"id": "1", "type": "start", "label": "Begin"},
    {"id": "2", "type": "process", "label": "Validate input"},
    {"id": "3", "type": "decision", "label": "Valid?", "branches": [{"label": "yes", "to": "4"}, {"label": "no", "to": "5"}]},
    {"id": "4", "type": "process", "label": "Process request"},
    {"id": "5", "type": "end", "label": "Reject"}
  ]
}
```

- `steps`: required, non-empty array, ordered top to bottom.
  - `id`: required string, unique within the array.
  - `type`: required, one of `start` `process` `decision` `end`.
  - `label`: required string.
  - `branches`: required on `decision` steps only, a non-empty array of `{"label": string, "to": string}`. Each `to` must match another step's `id`.

A step reachable only through a decision's `to` renders as that branch's own labeled line, not as a second box further down the page: the vertical spine cannot represent branching, so branch targets leave the spine and hang off their decision instead.

## Characters

The script draws with a fixed set of box-drawing glyphs. No ASCII fallback: this is what every render looks like.

- Start and end steps: a rounded box, corners `╭` `╮` `╰` `╯`, sides `│`, fill `─`.
- Process steps: a square box, corners `┌` `┐` `└` `┘`, sides `│`, fill `─`.
- Decision steps: a single line in mathematical angle brackets, `⟨ label ⟩`.
- The connector between spine steps: `│` then `▼`.
- Branch lines under a decision: `── label ──→ target label`.

## Render

Build the JSON payload from the resolved steps, then pipe it through the script from this skill's own base directory:

```
node scripts/render.js <<'JSON'
{ ... }
JSON
```

Relay stdout verbatim. Do not hand-retype it or adjust its spacing. A non-zero exit means stderr names the problem: fix the JSON once and retry. If it still fails, say so rather than hand-drawing a fallback.

## Output

- The rendered block, exactly as the script printed it.
- One line noting the source used (the argument, the located file, or the last assistant message) and anything inferred while mapping it onto the schema.
