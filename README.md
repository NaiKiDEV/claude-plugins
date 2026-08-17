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

### [`hub`](./plugins/hub)

Hub-and-spoke orchestration. The hub is the main session rather than a subagent: `/hub` loads the protocol into the conversation you are already in, and that conversation dispatches the work. Manual-only, like the plugins above.

| Skill | Purpose |
| --- | --- |
| `/hub [what to build, investigate, or change]` | Decomposes a task, routes each piece to a spoke, gates the plan for approval, dispatches cold-start briefs, verifies what comes back, and integrates. |

The hub delegates by default and edits by exception, against a stated test: if the brief describing a change would be longer than the change, the hub makes it and reports it separately. Work that was part of the plan, work needing code the hub has not read, and files a running spoke owns are delegated at any size. Dispatch is gated: the decomposition is printed with each spoke's assigned files, and nothing runs until you approve it.

Spokes route to the agents already installed in your session, preferring the most specific match, and fall back to three generics the plugin ships (`hub-investigator`, `hub-implementer`, `hub-verifier`). A returned report is treated as a claim rather than a result, and the hub re-runs decisive checks itself.

```
/plugin install hub@naikidev
```

### [`visualize`](./plugins/visualize)

Fourteen manual-only skills that render content as tables, lists, trees, diagrams, and charts. Alignment and padding are computed by each skill's bundled `scripts/render.js`, a zero-dependency Node script, rather than hand-typed, so columns and connectors never drift. Most skills draw with Unicode box-drawing characters and symbols; `list` and `checklist` use plain ASCII markers instead, since a single decorator glyph proved too subtle to read reliably. Manual-only and read-only, like the plugins above.

| Skill | Purpose |
| --- | --- |
| `/table [content]` | A bordered grid with optional per-column alignment and a totals footer. |
| `/table-grouped [content]` | A bordered grid split into labeled row groups, with optional per-group subtotals and a grand total. |
| `/list [content]` | A nested bullet list, for outlining points or breaking a topic into parts. |
| `/checklist [content]` | A checklist with done, pending, blocked, and in-progress states, and an optional progress summary. |
| `/file-tree [content]` | A directory listing or file structure as a tree, walking a real project path where one is named. |
| `/tree [content]` | Any single-rooted hierarchy: an org chart, a taxonomy, a decision tree, a category breakdown. |
| `/box-diagram [content]` | Components and the relationships between them as left-to-right boxes joined by labeled arrows. |
| `/state-machine [content]` | States and transitions as left-to-right boxes with start and accept markers, plus a full transition table. |
| `/flowchart [content]` | A process or decision sequence as a top-to-bottom flow of start, process, decision, and end steps. |
| `/sequence [content]` | An exchange between two or more parties as lifelines with directional message arrows. |
| `/timeline [content]` | A dated sequence of events as a vertical timeline. |
| `/kanban [content]` | Tasks grouped by status as a side-by-side board. |
| `/bar-chart [content]` | Labeled non-negative values as a horizontal bar chart. |
| `/matrix [content]` | A row-by-column comparison as a bordered grid, for feature comparisons or lightweight heatmaps. |

Each skill takes explicit content, a file or topic to locate first, or nothing, in which case it renders the last substantive thing said in the conversation. None of them invent data to fill a shape that does not fit.

```
/plugin install visualize@naikidev
```

## Naming

Skill names resolve bare: `/why`, `/ste`, and so on. Prefix with the plugin name, as in `/questions:why` or `/dialect:ste`, when another installed plugin already claims the same name. This matters most for `visualize`, whose skill names (`table`, `tree`, `list`) are short, common words other plugins are likely to also claim.

## License

[MIT](./LICENSE)
