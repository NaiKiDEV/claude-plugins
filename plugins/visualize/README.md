# visualize

Manual-only visualizations. Fourteen skills that render tables, lists, trees, diagrams, and charts, none of which write to the project.

| Skill | Purpose |
| --- | --- |
| [`/table`](#table) | A bordered grid with optional per-column alignment and a totals footer. |
| [`/table-grouped`](#table-grouped) | A bordered grid split into labeled row groups, with optional per-group subtotals and a grand total. |
| [`/list`](#list) | A nested bullet list, for outlining points or breaking a topic into parts. |
| [`/checklist`](#checklist) | A checklist with done, pending, blocked, and in-progress states, and an optional progress summary. |
| [`/file-tree`](#file-tree) | A directory listing or file structure as a tree, walking a real project path where one is named. |
| [`/tree`](#tree) | Any single-rooted hierarchy: an org chart, a taxonomy, a decision tree, a category breakdown. |
| [`/box-diagram`](#box-diagram) | Components and the relationships between them as left-to-right boxes joined by labeled arrows. |
| [`/state-machine`](#state-machine) | States and transitions as left-to-right boxes with start and accept markers, plus a full transition table. |
| [`/flowchart`](#flowchart) | A process or decision sequence as a top-to-bottom flow of start, process, decision, and end steps. |
| [`/sequence`](#sequence) | An exchange between two or more parties as lifelines with directional message arrows. |
| [`/timeline`](#timeline) | A dated sequence of events as a vertical timeline. |
| [`/kanban`](#kanban) | Tasks grouped by status as a side-by-side board. |
| [`/bar-chart`](#bar-chart) | Labeled non-negative values as a horizontal bar chart. |
| [`/matrix`](#matrix) | A row-by-column comparison as a bordered grid, for feature comparisons or lightweight heatmaps. |

## Conventions

These hold across every skill in the plugin.

**Manual only.** Every skill sets `disable-model-invocation: true`. Claude never invokes one on its own. They run when typed, and their descriptions stay out of context until then.

**Bare names resolve.** Autocomplete resolves `/table`, `/list`, `/tree`, and the rest directly. Use the `visualize:` prefix when another installed plugin already claims one of those names, which is plausible for names this short and generic.

**Alignment is computed, not typed.** Each skill builds a JSON payload from the resolved content and pipes it through that skill's own `scripts/render.js`, a bundled zero-dependency Node script. The script computes column widths, box sizes, and connector positions and prints the result. The skill relays stdout verbatim rather than retyping or adjusting it, which is what guarantees a column or a connector never drifts by a character, a guarantee hand-typed ASCII art cannot make. On a non-zero exit, stderr names the exact problem; the skill fixes the JSON once and retries, or reports the failure rather than hand-drawing a fallback.

**Unicode by default.** Most skills draw with single-line Unicode box-drawing characters and symbols, the specific set depending on the skill's shape (borders, arrows, blocks, brackets), computed by the same `scripts/render.js` covered above. This is the default because modern terminals and fonts render these characters correctly, and they read more clearly than an ASCII approximation would. `list` and `checklist` are the deliberate exception: a Unicode pass was tried for both, using single-character glyph markers for bullets and checkbox states, and reverted because a single decorator glyph proved too subtle to read at a glance. Both skills render with plain ASCII markers instead (`-`/`*`/`+` bullets, `[x]`/`[ ]`/`[~]`/`[!]` checkboxes), and stay that way by design, not as a leftover.

**Two entry points, plus a default.** An argument that is content itself (pasted data, a typed description, a described structure) is used directly. An argument that names something else (a file, a decision, a topic) is located first the way `/where` or `/how` would, using `Read`, `Grep`, or `Glob`. With no argument, the target is the last substantive assistant message in the conversation, not the invocation itself.

**Never invents data.** Every skill's schema has to be filled from what the source actually contains. If the source has fewer or more columns, rows, states, or events than the shape wants, the skill uses what is actually there and says what was inferred. If the source does not map cleanly onto the requested shape at all, the skill says the fit is poor and points at a better-suited visualize skill instead of forcing it.

**Nothing writes.** Every skill sets `disallowed-tools: Edit Write NotebookEdit`, so a rendering pass cannot mutate the project. Each skill also pre-approves the read-only tools it needs: `Bash(node *)` to run its own render script, plus `Read`, `Grep`, and `Glob` for locating and reading source content.

## `/table`

```
/table
/table the pricing tiers
```

Input:

```json
{
  "title": "Release checklist",
  "columns": ["Name", "Status", "Owner"],
  "rows": [
    ["Apples", "done", "alice"],
    ["Blueberries", "in progress", "bob"],
    ["Cantaloupe", "blocked", "carol"]
  ],
  "totals": ["", "3 items", ""]
}
```

Output:

```
Release checklist
┌─────────────┬─────────────┬───────┐
│ Name        │ Status      │ Owner │
├─────────────┼─────────────┼───────┤
│ Apples      │ done        │ alice │
│ Blueberries │ in progress │ bob   │
│ Cantaloupe  │ blocked     │ carol │
├─────────────┼─────────────┼───────┤
│             │ 3 items     │       │
└─────────────┴─────────────┴───────┘
```

## `/table-grouped`

```
/table-grouped
/table-grouped the pricing tiers by region
```

Input:

```json
{
  "title": "Grocery order",
  "columns": ["Item", "Qty", "Price"],
  "groups": [
    {"label": "Produce", "rows": [["Apples", "10", "$5"], ["Bananas", "6", "$3"]], "subtotal": ["", "", "$8"]},
    {"label": "Dairy", "rows": [["Milk", "4", "$12"]], "subtotal": ["", "", "$12"]}
  ],
  "grandTotal": ["", "", "$20"]
}
```

Output:

```
Grocery order
┌─────────┬─────┬───────┐
│ Item    │ Qty │ Price │
├─────────┼─────┼───────┤
│ Produce               │
├─────────┼─────┼───────┤
│ Apples  │ 10  │ $5    │
│ Bananas │ 6   │ $3    │
├─────────┼─────┼───────┤
│ ~       │     │ $8    │
├─────────┼─────┼───────┤
│ Dairy                 │
├─────────┼─────┼───────┤
│ Milk    │ 4   │ $12   │
├─────────┼─────┼───────┤
│ ~       │     │ $12   │
├─────────┼─────┼───────┤
│         │     │ $20   │
└─────────┴─────┴───────┘
```

## `/list`

```
/list
/list the launch tasks
```

Input:

```json
{
  "title": "Launch tasks",
  "items": [
    {"text": "Write docs", "children": []},
    {"text": "Ship release", "children": [{"text": "Tag version", "children": []}, {"text": "Publish notes", "children": []}]}
  ]
}
```

Output:

```
Launch tasks
============
- Write docs
- Ship release
  * Tag version
  * Publish notes
```

## `/checklist`

```
/checklist
/checklist the launch tasks
```

Input:

```json
{
  "title": "Release plan",
  "items": [
    {"text": "Write docs", "state": "done", "children": []},
    {"text": "Ship release", "state": "in-progress", "children": [
      {"text": "Tag version", "state": "done", "children": []},
      {"text": "Publish notes", "state": "pending", "children": []}
    ]},
    {"text": "Notify customers", "state": "blocked", "children": []}
  ],
  "showProgress": true
}
```

Output:

```
Release plan
============
[x] Write docs
[~] Ship release
  [x] Tag version
  [ ] Publish notes
[!] Notify customers

2/4 done (50%)
```

## `/file-tree`

```
/file-tree
/file-tree the module structure
```

Input:

```json
{
  "root": "project/",
  "entries": [
    {"name": "src/", "children": [{"name": "index.js", "children": []}, {"name": "utils.js", "children": []}]},
    {"name": "README.md", "children": []}
  ]
}
```

Output:

```
project/
├── src/
│   ├── index.js
│   └── utils.js
└── README.md
```

## `/tree`

```
/tree
/tree the team org chart
```

Input:

```json
{
  "root": {"label": "CEO", "children": [{"label": "VP Eng", "children": []}, {"label": "VP Sales", "children": []}]}
}
```

Output:

```
CEO
├── VP Eng
└── VP Sales
```

## `/box-diagram`

```
/box-diagram
/box-diagram the deployment pipeline
```

An edge only draws as an arrow when its `from` and `to` are that exact adjacent pair, in that order. Every other edge is listed as plain text beneath the diagram instead, such as the `A → C` cross-link below.

Input:

```json
{
  "nodes": [
    {"id": "A", "label": "API Gateway"},
    {"id": "B", "label": "Auth Service"},
    {"id": "C", "label": "Database"}
  ],
  "edges": [
    {"from": "A", "to": "B", "label": "validates token"},
    {"from": "B", "to": "C", "label": "reads user"},
    {"from": "A", "to": "C", "label": "cache fallback"}
  ]
}
```

Output:

```
┌─────────────┐  validates token  ┌──────────────┐  reads user  ┌──────────┐
│ API Gateway │ ────────────────→ │ Auth Service │ ───────────→ │ Database │
└─────────────┘                   └──────────────┘              └──────────┘

A → C: cache fallback
```

## `/state-machine`

```
/state-machine
/state-machine the order lifecycle
```

A start state gets a `(start) →` marker; an accept state's box uses a double-line border instead of single-line. A full transition table always prints below the boxes, since a back-edge or a cycle cannot be drawn spatially.

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

## `/flowchart`

```
/flowchart
/flowchart the login flow
```

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

## `/sequence`

```
/sequence
/sequence the checkout process
```

Input:

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

Output:

```
Client               API               DB
   │                  │                 │
   │    POST /login   │                 │
   ───────────────────→                 │
   │                  │   SELECT user   │
   │                  ──────────────────→
   │                  │       row       │
   │                  ←──────────────────
   │      200 OK      │                 │
   ←───────────────────                 │
```

## `/timeline`

```
/timeline
/timeline the release history
```

Events take an optional `time` field (`HH:MM`, 24-hour). Consecutive events sharing the same `date` are grouped under one date heading: the date prints once per run, and later same-day rows get a blank, padded date column instead.

Input:

```json
{
  "events": [
    {"date": "2026-01-10", "time": "09:00", "label": "Kickoff"},
    {"date": "2026-01-10", "time": "14:30", "label": "Design review"},
    {"date": "2026-01-10", "time": "18:00", "label": "Retro"},
    {"date": "2026-02-01", "label": "Beta launch"}
  ]
}
```

Output:

```
2026-01-10  ●-- 09:00  Kickoff
            │
            ●-- 14:30  Design review
            │
            ●-- 18:00  Retro
            │
2026-02-01  ●-- Beta launch
```

## `/kanban`

```
/kanban
/kanban the sprint board
```

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

## `/bar-chart`

```
/bar-chart
/bar-chart the benchmark results
```

Input:

```json
{"title": "Response time by endpoint", "bars": [{"label": "GET /users", "value": 42}, {"label": "POST /orders", "value": 78}, {"label": "DELETE /cache", "value": 12}], "unit": "ms"}
```

Output:

```
Response time by endpoint
GET /users    ██████████████████████ 42ms
POST /orders  ████████████████████████████████████████ 78ms
DELETE /cache ██████ 12ms
```

## `/matrix`

```
/matrix
/matrix the feature comparison
```

Input:

```json
{"rowLabels": ["SSO", "Audit log", "API access"], "colLabels": ["Basic", "Pro", "Enterprise"], "cells": [["no", "no", "yes"], ["no", "yes", "yes"], ["limited", "yes", "yes"]]}
```

Output:

```
┌────────────┬─────────┬─────┬────────────┐
│            │ Basic   │ Pro │ Enterprise │
├────────────┼─────────┼─────┼────────────┤
│ SSO        │ no      │ no  │ yes        │
│ Audit log  │ no      │ yes │ yes        │
│ API access │ limited │ yes │ yes        │
└────────────┴─────────┴─────┴────────────┘
```

## Install

```
/plugin marketplace add naikidev/claude-plugins
/plugin install visualize@naikidev
```
