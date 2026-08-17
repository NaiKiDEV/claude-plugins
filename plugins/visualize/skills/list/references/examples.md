# list examples

## Flat with one nested group

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

## Deep nesting (4 levels)

Marker cycles `-` `*` `+` and repeats once depth exceeds three levels.

Input:

```json
{
  "title": "Deep outline",
  "items": [
    {"text": "Top", "children": [
      {"text": "Second", "children": [
        {"text": "Third", "children": [
          {"text": "Fourth", "children": []}
        ]}
      ]}
    ]}
  ]
}
```

Output:

```
Deep outline
============
- Top
  * Second
    + Third
      - Fourth
```

## Custom marker start, no title

`marker` sets where the `-` `*` `+` cycle begins at depth 0.

Input:

```json
{
  "items": [
    {"text": "Alpha", "children": [{"text": "Beta", "children": []}]},
    {"text": "Gamma", "children": []}
  ],
  "marker": "*"
}
```

Output:

```
* Alpha
  + Beta
* Gamma
```
