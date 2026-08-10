# Plugins

No plugins yet — this marketplace is scaffolding only.

Each plugin will live in its own folder here:

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
