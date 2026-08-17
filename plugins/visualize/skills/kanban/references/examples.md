# kanban examples

Each pair below is real: the JSON was piped into `scripts/render.js` and the fenced block after it is the script's actual stdout, unedited.

## 1. Three columns, one empty

Input:

```json
{
  "columns": [
    {"name": "To Do", "cards": ["Task A", "Task B"]},
    {"name": "In Progress", "cards": ["Task C"]},
    {"name": "Done", "cards": []}
  ]
}
```

Output:

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ To Do       │ │ In Progress │ │ Done        │
├─────────────┤ ├─────────────┤ ├─────────────┤
│ Task A      │ │ Task C      │ │ (empty)     │
│ Task B      │ │             │ │             │
└─────────────┘ └─────────────┘ └─────────────┘
```

`Done` has no cards, so it prints the `(empty)` placeholder, then pads with one blank bordered row to match the two-row height of `To Do`.

## 2. Empty column alongside columns with different card counts

Input:

```json
{
  "columns": [
    {"name": "Backlog", "cards": ["Investigate flaky checkout test", "Draft onboarding revamp spec", "Spike"]},
    {"name": "Blocked", "cards": []},
    {"name": "Done", "cards": ["Ship v2 API", "Retire legacy webhook"]}
  ]
}
```

Output:

```
┌─────────────────────────────────┐ ┌─────────────────────────────────┐ ┌─────────────────────────────────┐
│ Backlog                         │ │ Blocked                         │ │ Done                            │
├─────────────────────────────────┤ ├─────────────────────────────────┤ ├─────────────────────────────────┤
│ Investigate flaky checkout test │ │ (empty)                         │ │ Ship v2 API                     │
│ Draft onboarding revamp spec    │ │                                 │ │ Retire legacy webhook           │
│ Spike                           │ │                                 │ │                                 │
└─────────────────────────────────┘ └─────────────────────────────────┘ └─────────────────────────────────┘
```

All three boxes share one width, set by the longest card (`Investigate flaky checkout test`), and one height, set by the tallest column (`Backlog`, three rows). `Blocked` and `Done` both pad with blank bordered rows down to that height.

## 3. Two columns, neither empty

Input:

```json
{
  "columns": [
    {"name": "Open", "cards": ["Fix login redirect"]},
    {"name": "Closed", "cards": ["Update favicon", "Patch CSP header"]}
  ]
}
```

Output:

```
┌────────────────────┐ ┌────────────────────┐
│ Open               │ │ Closed             │
├────────────────────┤ ├────────────────────┤
│ Fix login redirect │ │ Update favicon     │
│                    │ │ Patch CSP header   │
└────────────────────┘ └────────────────────┘
```
