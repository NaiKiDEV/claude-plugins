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

Ten controlled-language modes. Each skill constrains the vocabulary, sentence shape, evidence, or order of what Claude writes to a published rule set, either on a single target or for the rest of the session. Manual-only, like the interrogatives above.

| Skill | Purpose |
| --- | --- |
| `/ste [target]` | ASD-STE100 Simplified Technical English: one meaning for each word, 20-word instructions, three-word noun clusters, simple tenses, active voice, and warnings before the step they apply to. |
| `/plain [target]` | Plain language to ISO 24495-1 and the Federal Plain Language Guidelines: the named reader's own words, hidden verbs dug out, active voice, and structure the reader can navigate. |
| `/ubiquitous [domain or target]` | Domain-driven design's ubiquitous language: the terms the business actually uses, scoped to one bounded context, established from the project first and the user second, with drift between the code and the business reported rather than smoothed over. |
| `/calibrated [target]` | ICD 203 analytic tradecraft: evidence, assumption, and judgment kept distinguishable, every judgment carrying a probability word from a seven-term ladder plus a separate confidence level, and anything one command would settle checked rather than estimated. |
| `/normative [target]` | RFC 2119 and RFC 8174 keywords: `MUST`, `SHOULD`, and `MAY` used strictly, so a blocker and a preference cannot be confused, with every requirement single, unambiguous, and verifiable. |
| `/bluf [target]` | Bottom line up front, the US military standard: the answer in the first sentence, support in descending order of importance, no preamble, with explicit handling for the answers that resist the format. |
| `/pyramid [target]` | Minto's Pyramid Principle: one governing thought that summarises rather than labels, MECE groups of the same kind of idea, and each level answering the single question the line above raises. |
| `/sbar [target]` | The clinical handoff form: Situation, Background, Assessment, Recommendation, all four slots filled, with a named action, actor, and timeframe in the last one. |
| `/comments [target]` | Conventional Comments: every review remark carries a label and a blocking decoration, so the author can triage before reading, with volume capped and nothing a linter already owns. |
| `/diataxis [mode or target]` | Diataxis's four documentation modes: write in exactly one of tutorial, how-to, reference, or explanation, and move the content that belongs to the other three. |

Dialects stack, because they constrain different layers. `/ste` and `/plain` shape the sentences, `/ubiquitous` populates them with the project's own words, `/calibrated` decides what a sentence may assert, `/normative` fixes how strongly an obligation binds, `/bluf` and `/pyramid` order them, `/sbar` and `/comments` put them in a fixed form, and `/diataxis` decides which of them belong in the document at all. Each skill states what it composes with, and the four pairs that genuinely conflict each declare which side wins.

A dialect governs prose only. It never rewrites code, quotations, or identifiers, and never renames anything to satisfy a vocabulary rule. Every skill that rewards short, confident sentences also carries an explicit instruction not to buy them with accuracy.

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

### [`decide`](./plugins/decide)

Ten decision procedures. Each skill runs one published protocol against a judgment already on the table, structuring it without making it. Manual-only, like the plugins above, and read-only apart from `/adr`.

| Skill | Purpose |
| --- | --- |
| `/reversible [decision]` | Classify the decision by what it costs to undo, before spending anything on making it: the undo named as an operation, the window before the door closes, and a recommendation on how much deliberation it is worth, including when the answer is none. |
| `/options [decision]` | Generate genuinely different approaches before evaluating any, using the vanishing options test and the do-nothing baseline, with decoys cut and each option's opportunity cost named. |
| `/tradeoff [options]` | Score options against criteria and weights fixed and printed before any scoring starts, musts screening separately from weighted wants, with unknowns kept as unknowns and the single change that would flip the result named. |
| `/hypotheses [symptom]` | List every explanation before scoring any evidence, score by what each item rules out rather than what it supports, discount the evidence that fits everything, and close on the cheapest observation that separates the survivors. |
| `/premortem [plan]` | Assume the plan already failed and explain why, covering the second failure as well as the first: it worked and was still the wrong thing. Causes are ranked on detectability as well as likelihood, and each carries a leading indicator. |
| `/redteam [plan or claim]` | Attack it on its own terms: the load-bearing assumption named and checked, the strongest objection steelmanned, seven fixed attack positions worked through, and findings sorted fatal, structural, contingent, noted. |
| `/fermi [quantity]` | Turn "it depends" into a range: three to six factors, each with a low, a high, and a tag saying whether it was counted or guessed, rounded hard, closing on the factor the answer is hostage to and what resolving it costs. |
| `/base-rate [estimate]` | Answer from what happened the last several times instead of from the details of this time, with the class built out of `git log` and the pull requests rather than recalled, and the spread and the tail reported rather than an average. |
| `/quit [work in progress]` | Decide whether to keep going, with the sunk cost named once and set aside, the comparison run forward against a named alternative, the middle options present, and a new criterion set whichever way it goes. Run before the work instead, and it sets the kill criteria. |
| `/adr [decision]` | Write the decision into the repository in the project's own ADR convention: the forces as they were then, the alternatives with one line each on why they lost, the costs stated plainly, and the condition that should reopen it. |

The shared rule is *check before you deliberate*. A protocol applied to a question one command would settle costs more than the answer and lends a decided look to something that was never in doubt, so every skill opens by asking what is checkable here and now, and reports a fact instead. Nothing is invented to fill a shape: an unknown cell stays unknown, a thin reference class is reported as thin, and a red team that found nothing says so.

They sequence. `/reversible` is the cheapest and gates the rest. `/options` precedes `/tradeoff`, since scoring a set of one is the failure both exist to prevent. Two pairs genuinely conflict and each declares which side wins: `/fermi` and `/base-rate` are the inside and outside views of one estimate, and the base rate wins by default, while `/premortem` and `/redteam` attack the same plan at its outcome and at its reasoning.

Nine of the ten produce a recommendation you can reject and none decides anything. `/adr` writes one file, into the directory the project already keeps decision records in.

```
/plugin install decide@naikidev
```

## Naming

Skill names resolve bare: `/why`, `/ste`, and so on. Prefix with the plugin name, as in `/questions:why` or `/dialect:ste`, when another installed plugin already claims the same name. This matters most for `visualize`, whose skill names (`table`, `tree`, `list`) are short, common words other plugins are likely to also claim, and for `decide`, where `/options`, `/quit`, and `/tradeoff` are the same kind of name.

## License

[MIT](./LICENSE)
