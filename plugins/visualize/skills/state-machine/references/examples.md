# state-machine examples

Each pair below is a real JSON payload piped into `scripts/render.js`, followed by the script's actual stdout.

## Linear machine with a start and an accept state

`idle` carries the `(start) →` marker and `done` gets the double-line border. Both transitions are adjacent, so both draw as arrows, and both still appear in the table below.

Input:

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

Output:

```
          ┌──────┐  start()  ┌─────────┐  complete()  ╔══════╗
(start) → │ Idle │ ────────→ │ Running │ ───────────→ ║ Done ║
          └──────┘           └─────────┘              ╚══════╝

idle    → running : start()
running → done    : complete()
```

## Same machine plus a back-edge

`running → idle` is a cycle: `idle` comes before `running` in the layout order, so the transition cannot be drawn as an arrow. The diagram looks unchanged, but the transition table below it lists all three transitions, including the back-edge.

Input:

```json
{
  "states": [
    {"id": "idle", "label": "Idle", "start": true},
    {"id": "running", "label": "Running"},
    {"id": "done", "label": "Done", "accept": true}
  ],
  "transitions": [
    {"from": "idle", "to": "running", "label": "start()"},
    {"from": "running", "to": "done", "label": "complete()"},
    {"from": "running", "to": "idle", "label": "reset()"}
  ]
}
```

Output:

```
          ┌──────┐  start()  ┌─────────┐  complete()  ╔══════╗
(start) → │ Idle │ ────────→ │ Running │ ───────────→ ║ Done ║
          └──────┘           └─────────┘              ╚══════╝

idle    → running : start()
running → done    : complete()
running → idle    : reset()
```

## No start or accept markers

`start` and `accept` are both optional. With neither set, boxes use a plain single-line border and no marker is printed.

Input:

```json
{
  "states": [
    {"id": "new", "label": "New"},
    {"id": "shipped", "label": "Shipped"}
  ],
  "transitions": [
    {"from": "new", "to": "shipped", "label": "ship()"}
  ]
}
```

Output:

```
┌─────┐  ship()  ┌─────────┐
│ New │ ───────→ │ Shipped │
└─────┘          └─────────┘

new → shipped : ship()
```
