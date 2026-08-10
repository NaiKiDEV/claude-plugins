# dialect

Controlled-language modes for Claude Code. Each skill constrains the vocabulary, sentence shape, or order of what Claude writes to a published rule set, either on a single target or for the rest of the session.

| Skill | Rule set |
| --- | --- |
| [`/ste`](#ste) | ASD-STE100 Simplified Technical English |
| [`/ubiquitous`](#ubiquitous) | Domain-driven design's ubiquitous language |
| [`/bluf`](#bluf) | Bottom line up front, the US military writing standard |

## What a dialect is

Not a natural language, and not a programming language. A dialect here is a constraint on the words and sentences Claude produces: which words are allowed, what each one may mean, how long a sentence may run, which voice and tense it may take, and what order the parts arrive in.

The problem it addresses is the default register of a coding assistant. Left alone, that register favours the long Latinate word over the short one, stacks four nouns into a phrase, hedges into the passive, and varies its terminology across a paragraph to avoid repetition. None of this is incorrect English. All of it costs the reader, and it costs a reader who does not speak English natively the most.

A dialect is a rule set that can be pointed at, which makes it checkable. "Write more clearly" is a preference, and adherence to it decays within a few turns. "No sentence over 20 words, no noun cluster over three words, active voice, one word for each meaning" is a specification, and a departure from it is visible in the text.

The three rule sets constrain different layers. `/ste` is closed and complete on arrival, and applies to any subject. `/ubiquitous` fixes the rules but takes its vocabulary from the project and the user, so it establishes that vocabulary before it speaks. `/bluf` barely touches vocabulary at all and constrains order, which is why it stacks cleanly on either of the others.

## Conventions

**Manual only.** Every skill sets `disable-model-invocation: true`. Claude never selects a dialect on its own, and the descriptions stay out of context until a skill is invoked.

**Two entry points.** With an argument, a skill rewrites that target and leaves the session unchanged. With no argument, it switches the session into the dialect until told to stop. Passing `off` leaves the mode, and so does saying so in plain words.

**Session scope.** Nothing is written to settings, and no state persists across sessions.

**Prose only.** A dialect governs explanations, documentation, comments, commit messages, error strings, and interface copy. It never alters identifiers, API names, commands, paths, or quoted log output, and it never renames anything in a codebase to satisfy a vocabulary rule. Rewriting a quotation would change the fact being reported, so quotations pass through intact.

**Composable.** Each skill carries a `Composes with` section stating how it interacts with the others. `/bluf` orders sentences while `/ste` and `/ubiquitous` shape and populate them, so all three combine without conflict.

**Hyphens only.** The skills instruct Claude to write the ASCII hyphen and never the em dash or en dash, and to restructure with a full stop, comma, colon, or parentheses where a dash would otherwise appear.

## `/ste`

```
/ste
/ste off
/ste rewrite the README
/ste this error message
/ste explain the retry wrapper
```

ASD-STE100 is a controlled language developed for aircraft maintenance documentation in 1983 and now used well beyond aerospace. It has two parts: a set of writing rules, and a dictionary of about 900 approved words, each approved for one part of speech and one meaning. Issue 9, released in January 2025, contains 53 rules. The specification is free, and ASD distributes it on request through the [ASD-STE100 site](https://www.asd-europe.org/standards-specifications/simplified-technical-english/).

The rules with the largest effect on assistant prose:

- **One word, one meaning, one part of speech.** A single term for each concept, used every time. Elegant variation is a defect, because a reader takes a second word to mean a second thing.
- **20 words maximum in an instruction, 25 in a description.** Long sentences are divided rather than compressed. Deleting an article, a subject, or a verb to reach the limit is explicitly forbidden.
- **Three words maximum in a multi-word noun.** `authentication token refresh failure handler` has to be broken apart.
- **Simple tenses only.** Infinitive, imperative, simple present, simple past, simple future, and the past participle as an adjective. No stacked auxiliaries, and no `-ing` outside a technical noun.
- **Active voice.** Passive is permitted in descriptive text only, and only where the agent is genuinely unknown.
- **One instruction per sentence, one topic per paragraph, six sentences maximum.**
- **Warnings before the step they apply to**, stating the consequence.

Before:

> It should be noted that in the event that the authentication token refresh mechanism fails, the request will have been retried up to three times by the client prior to the error being surfaced to the user.

After:

> The client tries to refresh the authentication token. If the refresh fails, the client retries the request three times. Then it shows the error to the user.

### Behaviour notes

**Sentence case, not capitals.** The specification prints approved words in upper case throughout its dictionary and sets its examples in full capitals, which is why STE text encountered in the wild often appears to shout. That convention is typesetting for a lookup table and carries no meaning in running text, so the skill writes ordinary sentence case. Capitals are excluded for emphasis and for warnings, since a warning takes its weight from being placed before the step. Cases that carry meaning are preserved: identifiers, environment variable names, HTTP methods, acronyms, and quotations.

**Rules applied, dictionary not claimed.** The 900-word dictionary is not available to Claude at runtime, so the skill does not assert compliance with it. It applies the 53 writing rules exactly, since those are complete in the skill and checkable against the text, and it applies the vocabulary rule through the one-word-one-meaning principle plus a replacement table covering the substitutions that recur in software writing: `use` for `utilize`, `make sure that` for `ensure`, `before` for `prior to`, and about twenty-five more. Output is described as written to the STE rules rather than as ASD-STE100 compliant, because certified compliance requires the specification and a checker.

**Content is preserved.** A rule set rewarding short, definite sentences creates pressure to state uncertain things flatly and to drop qualifications that make sentences long. The skill requires that a true qualification be kept and the sentence divided instead, on the grounds that a confident sentence that is wrong is worse than the wordy one it replaced.

## `/ubiquitous`

```
/ubiquitous
/ubiquitous freight forwarding
/ubiquitous the billing context
/ubiquitous rewrite this PR description
/ubiquitous audit the billing module
```

Domain-driven design's ubiquitous language is the single vocabulary shared by domain experts and the people building the software: the same words in conversation, in documentation, and in the code, with no translation layer between them. Where the code and the business have drifted apart, the drift is the defect.

The rule set arrives empty. The vocabulary belongs to the project, so the skill establishes it before speaking.

**Inference precedes questions.** The skill reads the argument, then the project, covering committed glossaries, architecture decision records, domain documentation, product copy, event and migration names, and the nouns in the core model. Only then does it ask, and it asks about specific terms it found rather than about the domain in the abstract, capped at three or four questions in a single turn. A closed or absent codebase yields nothing to infer, so every term is asked about instead. The skill will not proceed on a domain it invented: a web framework and a queue reveal nothing about the business, so where the domain cannot be established it stops and asks.

**Terms carry provenance, ranked by authority:**

| Tag | Meaning | Weight |
| --- | --- | --- |
| `[stated]` | The user said it | Authority. The term a domain expert uses is the term |
| `[src/billing/invoice.ts:30]` | The project records it | Evidence, with a committed glossary outranking a class name |
| `[inferred]` | Read from naming, unconfirmed | A guess, labelled as one |

Where authority and evidence disagree, the disagreement is reported rather than resolved. A codebase using `ShipmentRecord` while the business says "consignment" carries more information than either term alone.

### Behaviour notes

**Architecture vocabulary is excluded.** A codebase of `DataManager`, `ProcessorService`, and `handleUpdate` will otherwise yield a confident glossary of terms no domain expert has used. CRUD verbs, layer suffixes, framework nouns, generic containers, and raw persistence artifacts are refused. The lists are not a blacklist: `Claim` is filler in one codebase and the central noun of insurance in another, and `Settlement` and `Dispute` resemble process nouns while naming things a bank employee says daily. The test applied is whether a domain expert would use the word unprompted to describe their own work, and the instruction where that is unclear is to ask.

**Bounded context is required.** A ubiquitous language belongs to one bounded context rather than to a project, so a single project-wide glossary misrepresents the practice. `Customer` in Billing is a payment method and a dunning state; `Customer` in Support is a contact and a ticket history. Both are recorded against their contexts rather than merged, and a term that has crossed a boundary is flagged as suspect, since it usually indicates a missing translation layer or a leaked model.

**Audits report rather than rename.** `/ubiquitous audit <area>` looks for terms the code uses that the business does not, one concept under several names, one name over several concepts, and boundary crossings. It also reports concepts the business names that the code has no word for, where a missing word often indicates a missing model. Findings are anchored to `file:line`. Nothing is renamed, because a rename is a refactor with real blast radius and falls outside what an audit was asked to do.

**Nothing is written.** An existing glossary in the repository is read as evidence. A new one is saved only when explicitly requested in that turn.

## `/bluf`

```
/bluf
/bluf off
/bluf restructure this PR description
/bluf explain why the build is slow
```

Bottom line up front is the US military writing standard: key information first, supporting material after. It is deductive rather than inductive, placing the conclusion ahead of the argument instead of building toward it. Journalism uses the same shape under the name inverted pyramid, and intelligence analysis has used it for decades for the same reason, which is that the reader is busy and may stop after two sentences.

**The bottom line is the what and the so what.** The test the skill applies is what the reader would do differently after reading only the first sentence; if nothing would change, the bottom line has not been found. A yes or no question gets `yes` or `no` as the first word, an investigation gets the finding rather than the search, a completed task gets the outcome rather than the process, and a consequence the reader must act on goes in the lead: "the migration works, and it locks the table for about 40 seconds", not "the migration works".

**Preamble is enumerated and cut.** Restating the question, narrating the process, announcing the structure, warming up, and placing context above the point are listed explicitly, since each delays the answer without carrying information.

Before:

> Great question. I looked into the build times and reviewed the webpack config, the CI runner setup, and the dependency tree. There are a few things going on here. The node_modules install is cached, which is good. The test suite runs in parallel already. However, I did notice that source maps are being generated in production mode, which is fairly expensive.

After:

> Production source maps are the bottleneck. Turning them off cuts about four minutes from the build. Caching and test parallelism are already configured correctly.

### Behaviour notes

**The hard cases are specified.** Eight answers resist the format, and each has a rule. "It depends" leads with what it depends on, framed as a decision, never with "it depends" alone. An unknown answer leads with the unknown plus the one thing that would resolve it. Bad news leads with the bad news, since preparing the ground first is the failure the format exists to prevent and reads as concealment by the end. Several unrelated findings lead with the count and the most severe rather than a manufactured synthesis. A clean result is stated outright in one line. This follows the standard's own guidance: answer the question asked, do not answer a different question, and where the question cannot be answered, state why.

**Certainty is not manufactured.** A format rewarding a crisp opening creates pressure to sound more certain than the evidence supports, and under this format the first sentence is the only one some readers will read. A stated uncertainty is precise enough to lead; vagueness is not. Caveats are never dropped for the shape of a sentence, and partial results are never rounded up: "tests pass except the flaky one in `auth.spec.ts`", not "tests pass".

**Labels are for documents, not conversation.** Military documents print `BLUF:` at the top, which suits a scanned document such as a long PR description, an incident report, or an RFC, where a bold **Bottom line** lead is useful. In a chat reply it is noise, and the first sentence simply is the bottom line. A label never substitutes for leading.

**Sequence-critical writing is exempt.** Tutorials, runbooks, migration guides, and numbered steps keep their order, since reordering instructions to put the outcome first breaks them. They receive a lead stating what the reader will end up with, after which the steps are unchanged. Incident timelines keep the chronology but carry impact, status, and cause above it.

## Install

```
/plugin marketplace add naikidev/claude-plugins
/plugin install dialect@naikidev
```
