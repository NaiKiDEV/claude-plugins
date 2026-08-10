# Plugins

| Plugin | What it adds |
| --- | --- |
| [`questions`](./questions) | Six read-only interrogatives: `/why` `/where` `/what` `/how` `/who` `/when`. |
| [`dialect`](./dialect) | Controlled-language modes constraining the vocabulary, sentence shape, and order of what Claude writes: `/ste` `/ubiquitous` `/bluf`. |

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
