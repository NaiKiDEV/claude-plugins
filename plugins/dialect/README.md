# dialect

Controlled-language modes for Claude Code. Each skill constrains the vocabulary, sentence shape, evidence, or order of what Claude writes to a published rule set, either on a single target or for the rest of the session.

| Skill | Rule set | Layer |
| --- | --- | --- |
| [`/ste`](#ste) | ASD-STE100 Simplified Technical English | Words and sentences |
| [`/plain`](#plain) | ISO 24495-1 and the Federal Plain Language Guidelines | Words, sentences, structure |
| [`/ubiquitous`](#ubiquitous) | Domain-driven design's ubiquitous language | Vocabulary, taken from the project |
| [`/calibrated`](#calibrated) | ICD 203 analytic tradecraft standards | Evidence and certainty |
| [`/normative`](#normative) | RFC 2119 and RFC 8174 keywords | Obligation |
| [`/bluf`](#bluf) | Bottom line up front, the US military writing standard | Order |
| [`/pyramid`](#pyramid) | Minto's Pyramid Principle | Argument structure |
| [`/sbar`](#sbar) | SBAR, the clinical handoff form | Fixed form |
| [`/comments`](#comments) | Conventional Comments | Fixed form |
| [`/diataxis`](#diataxis) | Diataxis's four documentation modes | Inclusion |

## What a dialect is

Not a natural language, and not a programming language. A dialect here is a constraint on the words and sentences Claude produces: which words are allowed, what each one may mean, how long a sentence may run, which voice and tense it may take, what a claim has to carry before it can be stated, and what order the parts arrive in.

The problem it addresses is the default register of a coding assistant. Left alone, that register favours the long Latinate word over the short one, stacks four nouns into a phrase, hedges into the passive, varies its terminology across a paragraph to avoid repetition, states a guess in the grammar of a finding, and includes material that is true and well written and irrelevant to what the reader is doing. None of this is incorrect English. All of it costs the reader, and it costs a reader who does not speak English natively the most.

A dialect is a rule set that can be pointed at, which makes it checkable. "Write more clearly" is a preference, and adherence to it decays within a few turns. "No sentence over 20 words, no noun cluster over three words, active voice, one word for each meaning" is a specification, and a departure from it is visible in the text.

The rule sets constrain different layers, which is why they combine. `/ste` and `/plain` shape sentences. `/ubiquitous` populates them with the project's own words. `/calibrated` decides what a sentence is allowed to assert. `/normative` fixes how strongly an obligation binds. `/bluf` and `/pyramid` order the sentences, `/sbar` and `/comments` put them in a fixed form, and `/diataxis` decides which of them belong in the document at all.

## Conventions

**Manual only.** Every skill sets `disable-model-invocation: true`. Claude never selects a dialect on its own, and the descriptions stay out of context until a skill is invoked.

**Two entry points.** With an argument, a skill rewrites that target and leaves the session unchanged. With no argument, it switches the session into the dialect until told to stop. Passing `off` leaves the mode, and so does saying so in plain words.

**Session scope.** Nothing is written to settings, and no state persists across sessions.

**Read-only, with three exceptions that can run commands.** Seven skills hold `Read Grep Glob`. `/calibrated`, `/comments`, and `/sbar` add `Bash`, because each is defined partly by going and checking: the first refuses to estimate what a command would settle, the second needs the diff it is formatting, and the third gathers the state it is handing off. None of them writes.

**Prose only.** A dialect governs explanations, documentation, comments, commit messages, error strings, and interface copy. It never alters identifiers, API names, commands, paths, or quoted log output, and it never renames anything in a codebase to satisfy a vocabulary rule. Rewriting a quotation would change the fact being reported, so quotations pass through intact.

**Composable, with declared precedence.** Each skill carries a `Composes with` section covering the others. Most pairs sit on different layers and combine without argument. Four pairs do not, and each states which side wins: `/pyramid` supersedes `/bluf` for documents and defers to it in conversation, `/sbar` overrides both inside its four slots, `/plain` and `/ste` are alternatives rather than a stack, and `/normative` and `/calibrated` both override STE's replacement table where it would rewrite `must`, `should`, or `may`.

**Content survives the rule set.** Every skill that rewards short, confident sentences carries an explicit instruction not to buy them with accuracy. A true qualification is kept and the sentence divided instead. A confident sentence that is wrong is worse than the wordy one it replaced.

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

**Content is preserved.** A rule set rewarding short, definite sentences creates pressure to state uncertain things flatly and to drop qualifications that make sentences long. The skill requires that a true qualification be kept and the sentence divided instead.

## `/plain`

```
/plain
/plain off
/plain rewrite docs/setup.md
/plain this error message
/plain explain why the deploy failed
```

Plain language is a published standard rather than a preference. ISO 24495-1:2023 sets out the governing principles, and the [Federal Plain Language Guidelines](https://www.plainlanguage.gov/guidelines/) give the working rules that US agencies write to under the Plain Writing Act of 2010. The definition both use is a test with an outcome: a communication is in plain language if the people it is for can find what they need, understand it, and use it, the first time they read it.

The four principles are relevance, findability, understandability, and usability. The rules that follow from them:

- **Name the reader first.** Plain for whom is the whole question, and an operator at 3am and a compliance reviewer produce different documents. The skill settles who reads it, what they have to do, and what they already know before rewriting anything, and asks in one line where that is not inferable.
- **Dig out the hidden verb.** The single largest gain in most technical prose. `make a decision about` becomes `decide`, `provide protection for` becomes `protect`, `has a requirement for` becomes `requires`. The tell is a noun ending in `-tion`, `-ment`, or `-ance` sitting next to `make`, `give`, `take`, `perform`, or `provide`.
- **Active voice, present tense, and `you` for the reader.** Addressing the reader directly makes the passive voice hard to hide in, because someone has to be named.
- **Condition before action**, one idea per sentence, three words maximum in a noun stack.
- **Structure serves findability.** Headings written as the question the reader is asking, tables where the content is conditions and outcomes, exceptions placed with the rule they modify.
- **Relevance is a rule, not a preference.** Cut what the reader does not need to do the thing, measured against the named reader rather than in the abstract.

### Behaviour notes

**Chosen against `/ste`, not stacked with it.** The two overlap enough that running both is incoherent, so each names the other as an alternative and says when to pick it. STE is stricter: a fixed rule count, hard numeric limits, an approved dictionary, and a design target of a procedure read under pressure by a non-native speaker. Plain language covers any subject, permits nuance that a 20-word ceiling cannot carry, and adds the structure and findability layer that STE does not address. Procedures, warnings, and interface copy go to STE. Explanations, decisions, and reports go here.

**Simplification does not reach the content.** The same guard as STE, stated against the failures specific to this rule set: no rounding a number, loosening a threshold, generalising a condition, or dropping a data-loss warning because the plain version reads better.

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

## `/calibrated`

```
/calibrated
/calibrated off
/calibrated recalibrate this comment
/calibrated will this migration lock the table
```

[ICD 203](https://www.dni.gov/files/documents/ICD/ICD-203-Analytic-Standards.pdf) is the US intelligence community's directive on analytic tradecraft. Two of its nine standards do most of the work: distinguish underlying information from assumptions and judgments, and express uncertainty in a fixed vocabulary that means the same thing to every reader.

The problem is a sentence like "this should work". It reads as a finding, it was produced as a guess, and nothing in the grammar tells the reader which. A reader who cannot tell the difference cannot decide what to check.

**Three kinds of statement**, each recognisable without asking. Evidence was read, run, or observed, and it carries an anchor rather than a hedge. An assumption is named as one and paired with what happens to the conclusion if it is false. A judgment goes beyond the evidence and carries a probability word and a confidence level.

**One ladder, seven terms**, taken from the directive's own table, with no synonyms permitted because a synonym reads as a different band:

| Term | Band |
| --- | --- |
| almost no chance | 1 to 5 percent |
| very unlikely | 5 to 20 percent |
| unlikely | 20 to 45 percent |
| roughly even chance | 45 to 55 percent |
| likely | 55 to 80 percent |
| very likely | 80 to 95 percent |
| almost certain | 95 to 99 percent |

**Confidence is a second, independent axis**, stated as high, moderate, or low against the quality and quantity of what was actually looked at. "Likely, low confidence" is a legitimate statement, and it says something "likely" alone does not: this is my best read, and it rests on very little.

Before:

> This should be fine, the connection pooling looks like it's probably configured correctly, though there might be an issue under load.

After:

> The pool is configured for 20 connections (`db/pool.ts:14`), and the web tier runs 8 workers (evidence). Assuming each worker holds at most two connections, the pool is very likely adequate at current traffic, moderate confidence. Above roughly 12 workers it is unlikely to hold. `SHOW PROCESSLIST` during the next peak settles it.

### Behaviour notes

**Verification outranks calibration.** The skill's first rule is that a probability word on a claim one command would settle is a failure of the standard rather than a use of it. Reading the file, running the test, and grepping for the caller are all cheaper than a well-hedged guess, so only genuinely open questions get estimated: future behaviour, load that cannot be generated, code that cannot be seen, the user's intent.

**Two banned word classes.** `possible`, `could`, `may`, and `cannot be ruled out` are banned as estimates, because everything is possible and the words state only that a hypothesis exists while sounding like an assessment. `should work`, `probably fine`, `I believe`, and `it seems` are banned as hedges, because each is a probability claim with the band removed.

**Every judgment names its discriminating test**, which is the part the reader can act on, and competing explanations are given with their own probabilities rather than the leading one being presented alone. A judgment that changes during a session is flagged, along with what changed it, since one that quietly moves between turns teaches the reader that none of them were real.

## `/normative`

```
/normative
/normative off
/normative restate these findings
/normative what does this endpoint need before launch
```

[RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) defines eleven keywords that fix the strength of a requirement, and [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174) adds the rule that only the upper case forms carry that meaning. Together they are why an internet specification can distinguish the mandatory from the preferred without a paragraph of explanation each time.

The problem is a list where "you must add an index", "you should probably rename this", and "consider adding a test" are typographically identical. The reader cannot tell what blocks release from what is taste, so they either do everything or nothing.

| Keyword | Means |
| --- | --- |
| `MUST`, `REQUIRED`, `SHALL` | Absolute requirement |
| `SHOULD`, `RECOMMENDED` | Valid reasons may exist to do otherwise, but the implications must be understood and weighed first |
| `MAY`, `OPTIONAL` | Truly optional, and interoperable either way |

Requirement quality rules follow the INCOSE guidance and ISO/IEC/IEEE 29148: one requirement per statement, a named subject in the active voice, conditions in a leading `while` and `when` slot, a verifiable criterion with a number and a unit, and rationale on its own line rather than inside the requirement.

### Behaviour notes

**Unverifiable words are enumerated and banned.** Vague qualities (`robust`, `scalable`, `user-friendly`), vague quantities (`sufficient`, `appropriate`, `as many as possible`), open-ended lists (`etc.`, `including but not limited to`), escape hatches (`if practical`, `where feasible`), `and/or`, and vague verbs (`support`, `handle`, `process`) each make a requirement something nobody can ever declare met.

**Level inflation is the failure mode, in both directions.** The skill states that `MUST` is reserved for correctness, security, data loss, and broken contracts, and that raising a preference to `SHOULD` to make it more likely to be actioned empties the level for everyone who reads the next review. Softening a real blocker to `SHOULD` to avoid an argument is named as the mirror failure: a security hole marked `SHOULD` is a security hole you agreed to ship.

**Obligation is not probability.** `MUST` says a thing is required, not that it is certain, and "this SHOULD work" is the exact ambiguity RFC 2119 exists to remove. Likelihood belongs to `/calibrated`, and the two skills each say so.

**Somebody else's keywords are quoted, not corrected.** When reading an existing specification, a `SHOULD` is reported as a `SHOULD` even where the skill would have written `MUST`, with the disagreement stated separately.

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

**Certainty is not manufactured.** A format rewarding a crisp opening creates pressure to sound more certain than the evidence supports, and under this format the first sentence is the only one some readers will read. A stated uncertainty is precise enough to lead; vagueness is not. Caveats are never dropped for the shape of a sentence, and partial results are never rounded up: "tests pass except the flaky one in `auth.spec.ts`", not "tests pass". `/calibrated` supplies the ladder this rule otherwise leaves implicit.

**Labels are for documents, not conversation.** Military documents print `BLUF:` at the top, which suits a scanned document such as a long PR description, an incident report, or an RFC, where a bold **Bottom line** lead is useful. In a chat reply it is noise, and the first sentence simply is the bottom line. A label never substitutes for leading.

**Sequence-critical writing is exempt.** Tutorials, runbooks, migration guides, and numbered steps keep their order, since reordering instructions to put the outcome first breaks them. They receive a lead stating what the reader will end up with, after which the steps are unchanged. Incident timelines keep the chronology but carry impact, status, and cause above it.

## `/pyramid`

```
/pyramid
/pyramid off
/pyramid restructure this design document
/pyramid why is the deploy pipeline slow
```

Barbara Minto's Pyramid Principle came out of McKinsey and is the standard structure for consulting and analytic documents. It goes further than putting the answer first: it fixes what the supporting material must look like underneath.

**Three rules, applied at every level.** A statement summarises the ideas grouped below it rather than labelling them. Ideas in a group are the same kind of idea. Ideas in a group are in one logical order, chosen from time, structure, or degree.

**MECE.** Every group is mutually exclusive and collectively exhaustive. An overlap makes the reader check whether they are reading the same thing twice. A gap is worse, because they find it, and once they find one they stop trusting the rest. Two to five items per group, on the grounds that a longer list means a layer is missing.

**The vertical question** is the mechanism that makes a pyramid readable. Each statement raises exactly one question in the reader's mind, and the level beneath answers that question and nothing else. It is the test that finds the paragraph everyone likes and nobody needs.

**The introduction is SCQA:** situation, complication, question, answer. The situation is a place to stand rather than news, the complication is what makes the question live, and the answer is the governing thought. In conversation the first two are dropped, since the reader just asked the question.

Before:

> There are three issues with the current caching strategy.

After:

> The cache never serves a hit under production traffic, because all three of its layers key on a value that changes for every request.

### Behaviour notes

**The intellectually blank assertion is named and refused.** Minto's own term for "the system has three problems", "there are several factors", and "we identified four opportunities". Each announces that content is coming without delivering any. The skill requires the top line to be a complete, arguable thought with a verb.

**Precedence against `/bluf` is stated on both sides.** This is the larger of the two and keeps everything BLUF does, so they are not stacked. Documents get the pyramid, conversation gets BLUF, and the SCQA introduction is treated as overhead a chat reader did not ask for.

**Structure never costs a finding.** Where the material does not support a single governing thought, the skill says so rather than inventing an umbrella, and a finding that will not fit a group produces a new group rather than a deletion.

## `/sbar`

```
/sbar
/sbar off
/sbar the nightly ETL is failing
/sbar hand this session off
```

SBAR came out of the US Navy's nuclear submarine service and reached healthcare through Kaiser Permanente, where it is now standard for a nurse escalating to a physician. Four slots, always the same four, always in the same order: Situation, Background, Assessment, Recommendation.

The failure it exists to prevent is specific. Someone with the facts presents them to someone with the authority and stops short of saying what they think and what they want. The receiver then has to reconstruct the judgment from the data, under time pressure, with less context than the sender had.

- **Situation.** What is happening now, in one or two sentences, with the bad news in the first.
- **Background.** Only the context needed to evaluate the assessment and act on the recommendation. What changed, what was tried, what happened, anchored where the facts came from code or logs.
- **Assessment.** What you think is going on. Mandatory, and the point of the form. An unknown cause is stated as unknown along with what has been ruled out, never left empty.
- **Recommendation.** The action, the actor, and the timeframe. "Please advise" is explicitly refused.

### Behaviour notes

**A form, not a style.** The skill states when it does not apply, which is most of the time: answering a question, explaining how something works, and reporting finished work that needs nothing from anyone all want `/bluf` or `/pyramid` instead. It applies to escalation, handoff, live incidents, decisions the assistant cannot make, and being stuck.

**Labels earn their place here.** The opposite of the BLUF rule, and for a reason: the receiver of an escalation scans for `R` when they are busy and for `A` when they are deciding whether to get involved, so the four labels are printed rather than implied.

**It overrides the ordering dialects inside its slots.** BLUF would lead with the Recommendation and a pyramid would restructure the four. The order is fixed and the receiver expects it, so both are applied inside each slot instead of over the whole message.

**Handoff has its own test.** Whether somebody cold could act on it without asking a question. Anything they would have to ask belongs in Background.

## `/comments`

```
/comments
/comments off
/comments review this diff
/comments relabel this review
```

[Conventional Comments](https://conventionalcomments.org/) is a published convention for review remarks. Every comment opens with a label saying what kind of remark it is, and optionally a decoration saying whether it blocks.

```
issue (blocking): the token refresh drops the error

`client.ts:88` catches the timeout and returns null. Callers do not
check for null, so a failed refresh looks like a successful one.
```

Labels are `issue`, `suggestion`, `nitpick`, `question`, `thought`, `todo`, `praise`, `chore`, and `note`. Decorations are `(blocking)`, `(non-blocking)`, and `(if-minor)`.

The problem is a review of thirty remarks in which a security hole and a preference about variable naming are typographically identical. The author reads them in order, spends their attention evenly, and negotiates the ones that were never worth arguing about. Labels let them triage before they read.

### Behaviour notes

**`(non-blocking)` is the most useful decoration in the set**, because it tells the author they may disagree and merge anyway, which is what most review comments actually mean and almost none of them say. The skill defaults to non-blocking, on the grounds that a reviewer who blocks by default has no way left to say something matters.

**Mislabelling is called out in both directions.** A blocking defect labelled `thought` wastes everyone's time. A preference labelled `issue` costs the reviewer their credibility on the next one. `question` used to make a criticism sound softer is named as passive aggression in a costume, since the author has to answer it before they can fix anything.

**Volume is capped.** Ordering by severity, three nitpicks at most, nothing a formatter or linter already owns, one comment for a finding that recurs rather than one at each occurrence, and no review of code the change did not touch. A clean review is stated plainly rather than padded with manufactured findings.

**It formats, and does not post.** The skill shapes review output. Submitting a review is a separate action nobody asked for.

## `/diataxis`

```
/diataxis
/diataxis how-to
/diataxis reference the config options
/diataxis rewrite docs/setup.md
/diataxis audit docs/
```

[Diataxis](https://diataxis.fr/) is a documentation framework by Daniele Procida. It holds that there are four kinds of documentation, that they serve four different needs, and that mixing them damages all four.

| Mode | Serves | Oriented to | The reader is |
| --- | --- | --- | --- |
| Tutorial | Learning | Action | Studying, and does not yet know what they need |
| How-to | A goal | Action | Working, competent, and blocked |
| Reference | Information | Cognition | Working, and will leave once they have the fact |
| Explanation | Understanding | Cognition | Studying, and wants to know why |

This is the one dialect that deletes rather than rewrites. The others make a bad paragraph shorter or clearer. This one asks whether the paragraph belongs in this document at all, and the answer is often no however well it is written. A tutorial that stops to explain a design decision has lost the learner. A reference page carrying an opinion cannot be trusted as a description.

Each mode carries an explicit forbidden list, and the contamination table names the leaks in order of how often they occur, the most common by a distance being explanation into how-to.

### Behaviour notes

**It applies to answers, not only to documents.** A question is a request for one of the four things, so the session mode classifies each request and answers in that mode alone. "How do I" gets steps with no design rationale. "Why does" gets reasoning with no steps. "What is the default for" gets the fact in one line. Where the reader plainly needs a second mode, it is offered in one line rather than appended uninvited.

**The remedy is to move, not to delete.** Content in the wrong mode goes to the document that owns it and is linked. Outright deletion is correct only where the content exists nowhere and nobody needs it.

**Audits report gaps as well as contamination.** Four modes are four needs, so a project with four how-to guides and nothing else has three unmet needs. `/diataxis audit <path>` names which of the four is missing and what the reader is left to work out alone, and it reads documents rather than judging them by their titles.

**Purity does not reach warnings or prerequisites.** A data-loss warning is part of the how-to, and the consequence of a step belongs with the step. The skill states this explicitly, because both look like explanation and neither is.

## Install

```
/plugin marketplace add naikidev/claude-plugins
/plugin install dialect@naikidev
```
