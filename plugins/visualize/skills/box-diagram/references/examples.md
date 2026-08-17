# box-diagram examples

Each pair below is a real JSON payload piped into `scripts/render.js`, followed by the script's actual stdout.

## Straight-line pipeline, all edges adjacent

Every edge connects consecutive nodes in order, so every edge is drawn as an arrow. No cross-link text follows.

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
    {"from": "B", "to": "C", "label": "reads user"}
  ]
}
```

Output:

```
┌─────────────┐  validates token  ┌──────────────┐  reads user  ┌──────────┐
│ API Gateway │ ────────────────→ │ Auth Service │ ───────────→ │ Database │
└─────────────┘                   └──────────────┘              └──────────┘
```

## Same pipeline plus a non-adjacent cross-link

`A → C` skips over `B`, so it cannot be drawn as an arrow. It is listed as plain text under the diagram instead.

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

## Edges without labels

An edge's `label` is optional. The arrow still draws; the label row above it is simply blank.

Input:

```json
{
  "nodes": [
    {"id": "A", "label": "Client"},
    {"id": "B", "label": "Load Balancer"},
    {"id": "C", "label": "Worker"}
  ],
  "edges": [
    {"from": "A", "to": "B"},
    {"from": "B", "to": "C"}
  ]
}
```

Output:

```
┌────────┐      ┌───────────────┐      ┌────────┐
│ Client │ ───→ │ Load Balancer │ ───→ │ Worker │
└────────┘      └───────────────┘      └────────┘
```
