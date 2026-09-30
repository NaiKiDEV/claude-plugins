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

Most skills are manual-only: they run when you type them, and their descriptions stay out of context until then. Seven are callable by the model so that `/hub` can run them as steps in a run, since a manual-only skill can be started only by a user typing its name and neither the main session nor a subagent can reach it: `/what`, `/wbs`, `/invest`, `/characterize`, `/differential`, `/mutate`, and `/parallel-change`. Each of the seven opens its description with a narrow trigger, so it is not picked up for work that merely resembles its own.

### [`questions`](./plugins/questions)

Six interrogatives for work in progress, none of which write. All are manual except `/what`, which `/hub` can run over the changes a run made.

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

Eleven controlled-language modes. Each skill constrains the vocabulary, sentence shape, evidence, or order of what Claude writes to a published rule set, either on a single target or for the rest of the session. Manual-only.

| Skill | Purpose |
| --- | --- |
| `/ste [target]` | ASD-STE100 Simplified Technical English: one meaning for each word, 20-word instructions, three-word noun clusters, simple tenses, active voice, and warnings before the step they apply to. |
| `/plain [target]` | Plain language to ISO 24495-1 and the Federal Plain Language Guidelines: the named reader's own words, hidden verbs dug out, active voice, and structure the reader can navigate. |
| `/ubiquitous [domain or target]` | Domain-driven design's ubiquitous language: the terms the business actually uses, scoped to one bounded context, established from the project first and the user second, with drift between the code and the business reported rather than smoothed over. |
| `/calibrated [target]` | ICD 203 analytic tradecraft: evidence, assumption, and judgment kept distinguishable, every judgment carrying a probability word from a seven-term ladder plus a separate confidence level, and anything one command would settle checked rather than estimated. |
| `/normative [target]` | RFC 2119 and RFC 8174 keywords: `MUST`, `SHOULD`, and `MAY` used strictly, so a blocker and a preference cannot be confused, with every requirement single, unambiguous, and verifiable. |
| `/ears [target]` | EARS, from Rolls-Royce: five requirement templates plus a rule for combining them, where the classification is the point, since a requirement whose template cannot be chosen is missing its trigger, its state, or its subject. `WHEN` and `IF` are kept apart, which makes the failure cases countable. |
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

Hub-and-spoke orchestration. The hub is the main session rather than a subagent: `/hub` loads the protocol into the conversation you are already in, and that conversation dispatches the work. Manual-only: `/hub` runs only when you type it.

| Skill | Purpose |
| --- | --- |
| `/hub [what to build, investigate, or change]` | Decomposes a task, routes each piece to a spoke, gates the plan for approval, dispatches cold-start briefs, verifies what comes back, and integrates. |

The hub delegates by default and edits by exception, against a stated test: if the brief describing a change would be longer than the change, the hub makes it and reports it separately. Work that was part of the plan, work needing code the hub has not read, and files a running spoke owns are delegated at any size. Dispatch is gated: the decomposition is printed with each spoke's assigned files, and nothing runs until you approve it.

Spokes route to the agents already installed in your session, preferring the most specific match, and fall back to three generics the plugin ships (`hub-investigator`, `hub-implementer`, `hub-verifier`). A returned report is treated as a claim rather than a result, and the hub re-runs decisive checks itself.

Where other plugins from this marketplace are installed, the hub runs their procedures as steps: `/wbs` or `/invest` when the pieces are not obvious, `/characterize` before an untested change point, `/parallel-change` for an interface change whose callers fall in different write sets, `/differential` for a claim that behaviour is unchanged, `/mutate` on tests a spoke wrote, and `/what` over the run's changes, whose loose ends become seam candidates at integration.

```
/plugin install hub@naikidev
```

### [`visualize`](./plugins/visualize)

Fourteen manual-only skills that render content as tables, lists, trees, diagrams, and charts. Alignment and padding are computed by each skill's bundled `scripts/render.js`, a zero-dependency Node script, rather than hand-typed, so columns and connectors never drift. Most skills draw with Unicode box-drawing characters and symbols; `list` and `checklist` use plain ASCII markers instead, since a single decorator glyph proved too subtle to read reliably. Manual-only and read-only.

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

Ten decision procedures. Each skill runs one published protocol against a judgment already on the table, structuring it without making it. Manual-only, and read-only apart from `/adr`.

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

### [`verify`](./plugins/verify)

Seven verification procedures. Where `decide` structures a judgment, these replace the judgment with an observation wherever one is available: each skill runs one published protocol to produce evidence about code that already exists. All are manual except `/characterize`, `/differential`, and `/mutate`, which `/hub` can run as steps in a run.

| Skill | Purpose |
| --- | --- |
| `/repro [failure]` | Shrink a failure to the smallest case that still triggers it, by delta debugging, with the oracle matched to the specific failure signal and validated before any reduction runs. What the reduction removed is reported as the finding, since every discarded part is something the bug does not depend on. |
| `/bisect [behaviour]` | Find the change that introduced something, by binary search over history. Mostly about the predicate, since a bad one does not fail loudly, it returns a commit confidently and that commit is wrong. Both endpoints are tested rather than assumed, and the result separates the commit that wrote a bug from the one that exposed it. |
| `/boundary [target]` | Derive test cases from the input space rather than from the implementation, by equivalence partitioning and boundary value analysis, with invalid classes enumerated separately. Then check which classes the existing tests actually cover, by reading assertions and running them rather than by reading test names. |
| `/differential [comparison]` | Run two implementations against the same inputs and compare, replacing the oracle with a second implementation. Usually the previous version of your own code, reached through `git worktree`, which makes it the refactor safety net over the behaviour nobody wrote a test for. Accepted differences are declared before the run. |
| `/property [target]` | Find the invariants that must hold over all inputs, by working a catalogue of property patterns rather than inventing assertions, using whichever framework the project already has. Half the findings come from the properties that could not be stated. |
| `/mutate [file]` | Introduce small faults deliberately and check whether the tests notice. Coverage measures which lines executed; this measures which faults are detected. The sharpest tool here for generated suites, whose characteristic failure is high coverage with weak assertions. |
| `/characterize [code to change]` | Pin what code does now, before changing code that no test reaches, by Feathers's characterization testing. The pins are lasting tests named so nobody mistakes them for a specification, and behaviour that looks wrong is pinned and listed as an open question, never fixed. The output ends with the command that runs the pinned tests, which is the check a later change must keep green. |

The shared rule is *check before you verify*, the same discipline `decide` opens with. Each protocol also fixes an order of operations so the observation cannot be corrupted by what you expect to see: the oracle is validated before any reduction, both bisect endpoints are tested, the accepted differences are declared before the differential run, the suite is proved green before a single mutant is introduced, and every characterization test is run against a deliberately wrong value before the observed one is recorded.

Three skills bundle a zero-dependency Node script, for the reason `visualize` does: where an answer has a checkable invariant, it should be computed rather than generated. `ddmin.js` runs the reduction, `predicate.js` collapses a flaky check into git's `0`, `1`, and `125` exit codes, and `mutate.js` owns mutant discovery and the whole apply-run-restore loop.

`/mutate` is the only skill in the marketplace that rewrites a tracked file. It refuses to run on a dirty tree or a red suite, keeps an on-disk backup that survives being killed outright, restores on four signals and in a `finally`, and proves byte-identical restoration before reporting. Two agents ship alongside, `verify-shrinker` and `verify-mutator`, for the loops whose iteration count would otherwise flood the session.

```
/plugin install verify@naikidev
```

### [`refine`](./plugins/refine)

Six refinement procedures. Where `decide` structures a judgment and `verify` produces evidence about code that exists, these take work that has been described but not yet defined and drive it down until it can be executed. Read-only, and manual except `/wbs` and `/invest`, which `/hub` can run as steps when a task's pieces are not obvious.

| Skill | Purpose |
| --- | --- |
| `/impact [goal]` | Adzic's impact mapping: goal, actors, behaviour changes, deliverables, where each deliverable is written as a falsifiable hypothesis about producing an impact rather than as a commitment. The goal has to be achievable without building the thing, or it is a deliverable wearing a goal's clothes. Obstructing actors and impacts you want to prevent are both on the map, and deliverables with no impact above them are cut by name. |
| `/wbs [deliverable]` | Work breakdown under the 100% rule: children sum to exactly the parent, checked in both directions at every level, with the residue named wherever a level will not sum. Nodes are deliverables rather than phases, since "design, build, test, deploy" is 100% of any project by construction and can never reveal the missing rollback. A leaf stops at a work package: one owner, estimable, one completion test that is a command, finishable in one pass. |
| `/split [item]` | Lawrence's splitting patterns with Cohn's SPIDR, worked in order of yield. Every slice is vertical and passes three tests: could it ship alone, is something observably different afterwards, can it be verified on its own terms. The code is read for seams that already exist before one is invented, and the named anti-patterns each carry a repair, including "write the tests" and "error handling" as a single bag. |
| `/examples [item]` | Wynne's example mapping: rules, a concrete example with real values under each, and a red card for every question nobody can answer. Carries an explicit prohibition on resolving a question by choosing a reading, which is the failure mode an agent has by default and the reason the skill exists. The card counts are the readiness verdict, and more than about six rules sends the item to `/split`. |
| `/smells [spec]` | Requirements smells against ISO/IEC/IEEE 29148, over a specification somebody already wrote. The set-level pass is what a careful read cannot do: two requirements that each pass every check can still contradict each other. Requirements are checked against the code, findings are graded by consequence rather than counted, and a blocking finding comes back as a question rather than as a wording fix that quietly makes the decision. |
| `/invest [items]` | Wake's INVEST, used as the gate before dispatch. Letters that are claims about the repository are checked there rather than argued from the text, each failure carries its named repair, and passes go unreported so the failures are visible. Ready items are emitted in the five fields a spoke brief is made of; items that fail are held back rather than softened into a caveat. |

The shared rule is *nothing invented to fill a shape*. A rule with no example becomes an open question rather than acquiring a fabricated one, a requirement missing its trigger is reported rather than supplied with one, and a level that will not sum to 100% names its residue rather than widening a sibling to absorb it. The alternative, an agent quietly completing the specification it was asked to check, produces exactly the plausible wrong answer these exist to prevent.

The pipeline runs `/impact` to `/wbs` to `/split` to `/examples` to `/invest`, with `/smells` entering wherever a written specification already exists. `/split` and `/examples` double as repairs, for items failing **S** and **T** respectively.

`/invest` is shaped to hand off. Ready items come out carrying Objective, Context, Scope, Boundaries, and Check, which are the fields [`hub`](./plugins/hub) writes into a spoke brief, so they reach its gate without a translation step. Where `hub` is not installed, those five fields are what a person needs to pick the item up cold.

```
/plugin install refine@naikidev
```

### [`change`](./plugins/change)

One staged-change procedure. Where `refine` drives described work down into pieces, this plans the one change that will not partition: an interface whose consumers are spread across files, so the callee and its callers fall in different write sets and no writer can go green alone. Read-only, and callable by the model so `/hub` can run it when a piece turns out to be an interface change.

| Skill | Purpose |
| --- | --- |
| `/parallel-change [interface change]` | Sato's Parallel Change: expand, migrate, contract, with every phase leaving the system working. Expand adds the new form beside the old as one piece. Migrate moves the consumers in batches with disjoint write sets and no dependency on each other, which makes them a parallel front. Contract removes the old form behind a gate: a search for the old symbol returning nothing, the suite green, and evidence for each reference a search cannot reach. It counts the references per write set before planning, and declines when the consumers all sit in one write set. |

Each piece comes out with an objective, a write set, a check, and what it depends on, which map onto a [`hub`](./plugins/hub) spoke brief with the ordering its gate needs already stated. Where `refine` is installed, `/invest` can grade the pieces first and emit them in full brief shape.

```
/plugin install change@naikidev
```

## Naming

Skill names resolve bare: `/why`, `/ste`, and so on. Prefix with the plugin name, as in `/questions:why` or `/dialect:ste`, when another installed plugin already claims the same name. This matters most for `visualize`, whose skill names (`table`, `tree`, `list`) are short, common words other plugins are likely to also claim, for `decide`, where `/options`, `/quit`, and `/tradeoff` are the same kind of name, for `verify`, where `/boundary`, `/property`, and `/differential` are, and for `refine`, where `/examples`, `/split`, and `/impact` are.

No skill is named `verify`, so a `/verify` command installed from elsewhere stays reachable alongside the plugin.

## License

[MIT](./LICENSE)
