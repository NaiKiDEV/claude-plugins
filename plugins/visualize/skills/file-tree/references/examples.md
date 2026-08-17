# file-tree examples

Each pair below is a real JSON payload piped into `scripts/render.js`, followed by the script's actual stdout.

## Small tree

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

## Flat listing, many siblings

Input:

```json
{
  "root": "assets/",
  "entries": [
    {"name": "a.png", "children": []},
    {"name": "b.png", "children": []},
    {"name": "c.png", "children": []},
    {"name": "d.png", "children": []},
    {"name": "e.png", "children": []}
  ]
}
```

Output:

```
assets/
├── a.png
├── b.png
├── c.png
├── d.png
└── e.png
```

## Deep nesting with a mixed sibling set

Input:

```json
{
  "root": "app/",
  "entries": [
    {"name": "a.txt", "children": []},
    {"name": "b.txt", "children": []},
    {"name": "c.txt", "children": []},
    {"name": "lib/", "children": [
      {"name": "core/", "children": [
        {"name": "deep/", "children": [
          {"name": "leaf.js", "children": []},
          {"name": "final/", "children": [
            {"name": "bottom.txt", "children": []}
          ]}
        ]}
      ]}
    ]},
    {"name": "z.txt", "children": []}
  ]
}
```

Output:

```
app/
├── a.txt
├── b.txt
├── c.txt
├── lib/
│   └── core/
│       └── deep/
│           ├── leaf.js
│           └── final/
│               └── bottom.txt
└── z.txt
```
