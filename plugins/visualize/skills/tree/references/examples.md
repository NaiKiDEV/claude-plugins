# tree examples

Each pair below is a real JSON payload piped into `scripts/render.js`, followed by the script's actual stdout.

## Small org chart

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

## Single-branch taxonomy

Input:

```json
{
  "root": {"label": "Animal", "children": [
    {"label": "Vertebrate", "children": [
      {"label": "Mammal", "children": [
        {"label": "Cat", "children": []},
        {"label": "Dog", "children": []}
      ]}
    ]}
  ]}
}
```

Output:

```
Animal
└── Vertebrate
    └── Mammal
        ├── Cat
        └── Dog
```

## Deep hierarchy with a mixed sibling set

Input:

```json
{
  "root": {"label": "Root", "children": [
    {"label": "A", "children": []},
    {"label": "B", "children": []},
    {"label": "C", "children": []},
    {"label": "D", "children": [
      {"label": "D1", "children": [
        {"label": "D1a", "children": [
          {"label": "D1a-i", "children": []},
          {"label": "D1a-ii", "children": [
            {"label": "deepest", "children": []}
          ]}
        ]}
      ]}
    ]},
    {"label": "E", "children": []}
  ]}
}
```

Output:

```
Root
├── A
├── B
├── C
├── D
│   └── D1
│       └── D1a
│           ├── D1a-i
│           └── D1a-ii
│               └── deepest
└── E
```
