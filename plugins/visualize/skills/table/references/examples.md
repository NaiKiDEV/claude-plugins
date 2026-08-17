# table examples

Each pair below is real: the JSON was piped through `scripts/render.js` and the output block is the script's actual stdout, unedited.

## Example 1: title, alignment default, totals footer

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

## Example 2: empty rows, right-aligned column

Input:

```json
{
  "columns": ["Metric", "Value"],
  "align": ["left", "right"],
  "rows": []
}
```

Output:

```
┌────────┬───────┐
│ Metric │ Value │
├────────┼───────┤
└────────┴───────┘
```

## Example 3: a long cell value driving column width

Input:

```json
{
  "columns": ["Field", "Value"],
  "align": ["left", "left"],
  "rows": [
    ["Description", "This is a deliberately long cell value to check column width derivation"],
    ["Owner", "alice"]
  ]
}
```

Output:

```
┌─────────────┬─────────────────────────────────────────────────────────────────────────┐
│ Field       │ Value                                                                   │
├─────────────┼─────────────────────────────────────────────────────────────────────────┤
│ Description │ This is a deliberately long cell value to check column width derivation │
│ Owner       │ alice                                                                   │
└─────────────┴─────────────────────────────────────────────────────────────────────────┘
```
