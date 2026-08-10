# claude-plugins

Claude Code plugin marketplace by [naikidev](https://github.com/naikidev).

## Installation

```
/plugin marketplace add naikidev/claude-plugins
```

To work from a local checkout, point at the folder directly:

```
/plugin marketplace add /path/to/claude-plugins
```

## Usage

Once the marketplace is added, browse and install plugins with:

```
/plugin
```

Or install one directly:

```
/plugin install <plugin-name>@naikidev
```

## Plugins

### [`questions`](./plugins/questions)

Six manual-only interrogatives for work in progress. None is auto-invoked, and none of them write.

| Skill | Purpose |
| --- | --- |
| `/why [what to explain]` | The reasoning behind a decision, recommendation, or claim, including where the real reason was a default or a habit rather than a deliberate choice. |
| `/where [what to locate]` | Every reference to a symbol, config key, string, or concept, as a quickfix-style hit list with tagged rows and a summary. |
| `/what [scope]` | What changed, grouped by intent rather than by file, with the scope stated explicitly and unfinished changes flagged. |
| `/how [what to explain]` | How something actually works, traced step by step with every step anchored, including where the code diverges from what its names and documentation claim. |
| `/who [file or area]` | Who to ask, drawn from `CODEOWNERS` and substantive history rather than raw blame counts, with the strength of the signal stated. |
| `/when [what to date]` | When something landed, separating authored, committed, merged, and released, and treating "when did this break" as a bisect question. |

Claims carry an inline provenance tag (`[session]`, a `file:line` citation, or `[inferred]`) rather than a confidence score, so they can be checked instead of trusted.

```
/plugin install questions@naikidev
```

### [`dialect`](./plugins/dialect)

Controlled-language modes. Each skill constrains the vocabulary, sentence shape, or order of what Claude writes to a published rule set, either on a single target or for the rest of the session. Manual-only, like the interrogatives above.

| Skill | Purpose |
| --- | --- |
| `/ste [target]` | ASD-STE100 Simplified Technical English: one meaning for each word, 20-word instructions, three-word noun clusters, simple tenses, active voice, and warnings before the step they apply to. |
| `/ubiquitous [domain or target]` | Domain-driven design's ubiquitous language: the terms the business actually uses, scoped to one bounded context, established from the project first and the user second, with drift between the code and the business reported rather than smoothed over. |
| `/bluf [target]` | Bottom line up front, the US military standard: the answer in the first sentence, support in descending order of importance, no preamble, with explicit handling for the answers that resist the format. |

Dialects stack. `/bluf` orders the sentences while `/ste` and `/ubiquitous` shape and populate them, and each skill states what it composes with.

A dialect governs prose only. It never rewrites code, quotations, or identifiers, and never renames anything to satisfy a vocabulary rule.

```
/plugin install dialect@naikidev
```

## Naming

Skill names resolve bare: `/why`, `/ste`, and so on. Prefix with the plugin name, as in `/questions:why` or `/dialect:ste`, when another installed plugin already claims the same name.

## License

[MIT](./LICENSE)
