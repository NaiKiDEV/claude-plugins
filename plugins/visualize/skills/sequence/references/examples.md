# sequence examples

Each pair below is real: the JSON was piped through `scripts/render.js` and the output block is the script's actual stdout, unedited.

## Example 1: a request-reply round trip across three participants

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

## Example 2: a message spanning the first and last of four columns, both directions

Input:

```json
{
  "participants": ["Browser", "Gateway", "Auth", "Backend"],
  "messages": [
    {"from": "Browser", "to": "Backend", "label": "trace request through all hops"},
    {"from": "Backend", "to": "Browser", "label": "final response"}
  ]
}
```

Output:

```
Browser      Gateway      Auth      Backend
   │            │           │          │
   │  trace request through all hops   │
   ────────────────────────────────────→
   │          final response│          │
   ←────────────────────────────────────
```

## Example 3: a minimal two-participant ping-pong

Input:

```json
{
  "participants": ["User", "Server"],
  "messages": [
    {"from": "User", "to": "Server", "label": "ping"},
    {"from": "Server", "to": "User", "label": "pong"}
  ]
}
```

Output:

```
User        Server
  │            │
  │    ping    │
  ─────────────→
  │    pong    │
  ←─────────────
```
