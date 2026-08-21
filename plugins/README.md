# Plugins

| Plugin | What it adds |
| --- | --- |
| [`questions`](./questions) | Six read-only interrogatives: `/why` `/where` `/what` `/how` `/who` `/when`. |
| [`dialect`](./dialect) | Ten controlled-language modes constraining the vocabulary, sentence shape, evidence, and order of what Claude writes: `/ste` `/plain` `/ubiquitous` `/calibrated` `/normative` `/bluf` `/pyramid` `/sbar` `/comments` `/diataxis`. |
| [`hub`](./hub) | Hub-and-spoke orchestration: `/hub` decomposes a task, gates the plan, dispatches spokes, and verifies what comes back. |
| [`visualize`](./visualize) | Fourteen renderers, Unicode box-drawing by default with a plain-ASCII exception for list/checklist: `/table` `/table-grouped` `/list` `/checklist` `/file-tree` `/tree` `/box-diagram` `/state-machine` `/flowchart` `/sequence` `/timeline` `/kanban` `/bar-chart` `/matrix`. |
| [`decide`](./decide) | Ten decision procedures, each running one published protocol against a judgment already on the table: `/reversible` `/options` `/tradeoff` `/hypotheses` `/premortem` `/redteam` `/fermi` `/base-rate` `/quit` `/adr`. |

Each plugin lives in its own folder:

```
plugins/<plugin-name>/
├── .claude-plugin/
│   └── plugin.json      # required: name, description, author, version
├── agents/               # optional
├── commands/             # optional
├── skills/               # optional
└── README.md
```

After adding a plugin folder, register it in [`../.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json):

```json
{
  "name": "<plugin-name>",
  "description": "...",
  "source": "./plugins/<plugin-name>"
}
```

## Authoring conventions

- **Hyphens only.** Use the ASCII hyphen `-` in documentation and skill bodies. Do not use the em dash or en dash. Where a dash would join two clauses, restructure with a full stop, comma, colon, or parentheses.
- **Documentation, not commentary.** READMEs describe what a plugin does and how it behaves. They do not narrate how it was designed or which alternatives were rejected.
- **Version at release.** The `version` field in `plugin.json` and `marketplace.json` changes once per released commit, not once per edit.
