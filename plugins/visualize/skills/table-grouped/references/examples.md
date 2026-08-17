# table-grouped examples

Each pair below is real: the JSON was piped through `scripts/render.js` and the output block is the script's actual stdout, unedited.

## Example 1: subtotals and a grand total

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

## Example 2: no subtotal or grand total

Input:

```json
{
  "columns": ["Task", "Owner"],
  "groups": [
    {"label": "Frontend", "rows": [["Nav redesign", "dana"], ["Empty states", "dana"]]},
    {"label": "Backend", "rows": [["Rate limiting", "sam"]]}
  ]
}
```

Output:

```
┌───────────────┬───────┐
│ Task          │ Owner │
├───────────────┼───────┤
│ Frontend              │
├───────────────┼───────┤
│ Nav redesign  │ dana  │
│ Empty states  │ dana  │
├───────────────┼───────┤
│ Backend               │
├───────────────┼───────┤
│ Rate limiting │ sam   │
└───────────────┴───────┘
```

## Example 3: empty group and a label longer than the natural table width

Input:

```json
{
  "columns": ["Item", "Qty"],
  "groups": [
    {"label": "Empty section", "rows": []},
    {"label": "A section with a genuinely very long label that exceeds the natural table width", "rows": [["Widget", "2"]]}
  ]
}
```

Output:

```
┌────────┬────────────────────────────────────────────────────────────────────────┐
│ Item   │ Qty                                                                    │
├────────┼────────────────────────────────────────────────────────────────────────┤
│ Empty section                                                                   │
├────────┼────────────────────────────────────────────────────────────────────────┤
├────────┼────────────────────────────────────────────────────────────────────────┤
│ A section with a genuinely very long label that exceeds the natural table width │
├────────┼────────────────────────────────────────────────────────────────────────┤
│ Widget │ 2                                                                      │
└────────┴────────────────────────────────────────────────────────────────────────┘
```
