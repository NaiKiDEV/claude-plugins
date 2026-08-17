# checklist examples

## Mixed states with progress

Progress counts leaf items only (items with no children). "Ship release" has children, so it is not counted; its two children are.

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

## Flat, no title, no progress line

`children` may be omitted entirely; it defaults to empty. `showProgress` defaults to falsy, so no summary line is appended.

Input:

```json
{
  "items": [
    {"text": "Draft proposal", "state": "done"},
    {"text": "Get sign-off", "state": "pending"}
  ]
}
```

Output:

```
[x] Draft proposal
[ ] Get sign-off
```
