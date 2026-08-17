# flowchart examples

Each pair below is real: the JSON was piped through `scripts/render.js` and the output block is the script's actual stdout, unedited.

## Example 1: linear steps plus a two-way decision

Input:

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

Output:

```
╭───────╮
│ Begin │
╰───────╯
    │
    ▼
┌────────────────┐
│ Validate input │
└────────────────┘
         │
         ▼
⟨ Valid? ⟩
  ── yes ──→ Process request
  ── no ──→ Reject
```

## Example 2: a decision with three branches

Input:

```json
{
  "steps": [
    {"id": "1", "type": "start", "label": "Ticket filed"},
    {"id": "2", "type": "decision", "label": "Severity?", "branches": [
      {"label": "low", "to": "3"},
      {"label": "medium", "to": "4"},
      {"label": "high", "to": "5"}
    ]},
    {"id": "3", "type": "end", "label": "Backlog"},
    {"id": "4", "type": "end", "label": "Next sprint"},
    {"id": "5", "type": "end", "label": "Page on-call"}
  ]
}
```

Output:

```
╭──────────────╮
│ Ticket filed │
╰──────────────╯
        │
        ▼
⟨ Severity? ⟩
  ── low ──→ Backlog
  ── medium ──→ Next sprint
  ── high ──→ Page on-call
```

## Example 3: a linear flow with no decision

Input:

```json
{
  "steps": [
    {"id": "1", "type": "start", "label": "Begin"},
    {"id": "2", "type": "process", "label": "Fetch record"},
    {"id": "3", "type": "process", "label": "Log result"},
    {"id": "4", "type": "end", "label": "Done"}
  ]
}
```

Output:

```
╭───────╮
│ Begin │
╰───────╯
    │
    ▼
┌──────────────┐
│ Fetch record │
└──────────────┘
        │
        ▼
┌────────────┐
│ Log result │
└────────────┘
       │
       ▼
╭──────╮
│ Done │
╰──────╯
```
