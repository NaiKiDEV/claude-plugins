# decide

Decision procedures for Claude Code. Each skill runs one published protocol against a judgment already on the table: an explanation to choose between, a plan about to be committed to, an estimate nobody believes, or work that is going badly and might be worth stopping.

| Skill | Protocol | Question it answers |
| --- | --- | --- |
| [`/reversible`](#reversible) | Type 1 and Type 2 decisions, from Amazon's shareholder letters | How much is this decision worth thinking about? |
| [`/options`](#options) | Widening, from Heath and Heath's WRAP | What else could we do? |
| [`/tradeoff`](#tradeoff) | Kepner-Tregoe Decision Analysis and the Pugh matrix | Which of these is best, on criteria fixed in advance? |
| [`/hypotheses`](#hypotheses) | Heuer's Analysis of Competing Hypotheses | What is actually causing this? |
| [`/premortem`](#premortem) | Klein's prospective hindsight | How will this fail? |
| [`/redteam`](#redteam) | Adversarial review | What is wrong with this? |
| [`/fermi`](#fermi) | Fermi estimation | How big, how long, how much? |
| [`/base-rate`](#base-rate) | Reference class forecasting | What happened the last several times? |
| [`/quit`](#quit) | Kill criteria, from Duke's work on quitting | Keep going, or stop? |
| [`/adr`](#adr) | Nygard's Architecture Decision Record | Why did we do it that way? |

## What these do

They structure a judgment. They do not make it, and they do not act on it.

The failure they address is not that Claude reasons badly. It is that Claude reasons at a depth set by the phrasing of the request rather than by the stakes, in a direction set by whatever arrived first, and with a fluency that makes the result read as a conclusion regardless of what produced it. A plan comes back complete, articulate, and with the reasoning already attached, which is exactly the shape that discourages examination. Meanwhile a trivial choice gets three paragraphs and a schema change gets a sentence.

A protocol fixes the order of operations so that the outcome cannot be reverse-engineered to a preference. Hypotheses are listed before evidence is scored. Options are generated before any is evaluated. Criteria and weights are printed before any option is scored. Failure is assumed before causes are written. That ordering is the entire mechanism, and it is why these are skills rather than instructions to think harder.

Nine of the ten produce a recommendation the user can reject and none of them decides anything. The tenth writes one file.

## Conventions

**Manual only.** Every skill sets `disable-model-invocation: true`. Claude never invokes a decision procedure on its own, and the descriptions stay out of context until a skill is called.

**Read-only, with one exception.** Nine skills hold `disallowed-tools: Edit Write NotebookEdit`. They read the repository, run commands, and report. `/adr` is the exception: it writes exactly one file, into the directory the project already keeps decision records in.

**Check before you deliberate.** Every skill opens with the same rule, because it is the one that keeps the rest from becoming ceremony. A protocol applied to a question one command would settle costs more than the answer and lends a decided look to something that was never in doubt. Each skill states what belongs to it and what should have been a `grep`: `/fermi` counts before it estimates, `/hypotheses` is for symptoms with no local repro, `/reversible` reads the migration rather than assuming it has a down step.

Where the check is itself a procedure rather than one command, the [`verify`](../verify) plugin runs it: `/repro` reduces the failure, `/bisect` finds the change that caused it, and `/differential` settles whether a rewrite altered anything. Deliberating is what you do when no observation is available, so a decision procedure should hand off to one whenever it is.

**Nothing invented to fill a shape.** A protocol that needs options, evidence, a base rate, or a number does not get them fabricated when they do not exist. An unknown cell stays unknown, a thin reference class is reported as thin in the first line, and a red team that found nothing says so.

**Two entry points.** With an argument, a skill runs against that target. With none, it takes the open decision in the conversation and restates it in one line before starting, so a wrong reading is caught before the work rather than after. With nothing on the table, it says so and stops.

**Sequenced, with declared precedence.** Each skill carries a `Composes with` section covering the others. `/reversible` gates the expensive ones and is worth running first. `/options` precedes `/tradeoff`, since scoring a set of one is the failure both exist to prevent. Two pairs genuinely conflict and each states which side wins: `/fermi` and `/base-rate` are the inside and outside views of the same estimate, and the base rate wins by default; `/premortem` and `/redteam` attack the same plan from different ends, one at its outcome and one at its reasoning.

**Hyphens only.** The skills instruct Claude to write the ASCII hyphen and never the em dash or en dash, and to restructure with a full stop, comma, colon, or parentheses where a dash would otherwise appear.

## `/reversible`

```
/reversible
/reversible switching the job queue to Postgres advisory locks
/reversible dropping the legacy column in this migration
```

Amazon's 1997 and 2015 shareholder letters split decisions into two-way doors, which can be walked back, and one-way doors, which cannot. The argument is that organisations apply one-way deliberation to two-way decisions, which is slow, and two-way speed to one-way decisions, which is worse.

This is the cheapest skill here and it belongs before the others. It answers whether running them is worth it.

- **The exit is stated, not felt.** Four concrete questions: what the undo operation actually is, what it costs, how long the window stays open, and who has to agree. A decision whose undo cannot be named as an operation is not reversible whatever it feels like.
- **Three classes.** Two-way, decided now with no analysis. Stiff, undoable at real cost, worth widening but not worth a full study. One-way, where the rest of the plugin applies.
- **Detectability counts as reversibility.** A change revertable in a minute is effectively one-way if it will be six months before anyone notices it was wrong.
- **Convert the door.** Before accepting a one-way classification, the skill looks for what would make it two-way: a flag, an additive migration, an adapter, a subset rollout, retaining the data instead of dropping it, or simply not publishing the interface yet. Where conversion is cheap, that beats deliberating harder.
- **Refusing to deliberate is an output.** "Decide now, do not analyse this" is a real recommendation, given plainly.

## `/options`

```
/options
/options how to get the config to the worker processes
/options we are going to add Redis for this
```

Chip and Dan Heath's *Decisive* opens with Paul Nutt's finding that most organisational decisions were "whether or not" decisions, a single option weighed against doing nothing, and that those failed far more often than decisions comparing real alternatives. Widening the frame is the first step of their WRAP process and the cheapest of the four.

- **Generation is sealed off from evaluation.** Nothing is judged until the list is closed. The moment a comparison enters, generation stops and the remaining options are produced to lose.
- **The vanishing options test.** Option A is now impossible. What do you do instead? This is the highest-yield probe because it removes the anchor rather than asking you to ignore it.
- **Probes rather than staring.** Opposite constraints, do nothing, buy it, solve a different problem, both rather than either, and steal it from a named system.
- **Decoys are cut.** Would you defend this option to the person who proposed it? Anything that fails is padding, and two real options honestly compared beats five where three exist to lose.
- **Opportunity cost is named per option**, as a specific thing foreclosed rather than a generic downside.
- **It stops before choosing.** Scoring belongs to `/tradeoff`. Doing it informally here recreates the narrow frame with more steps.

## `/tradeoff`

```
/tradeoff
/tradeoff Kysely against Drizzle for this service
/tradeoff the three caching approaches above
```

Two methods used together. Kepner-Tregoe's Decision Analysis splits criteria into musts, which are binary and screen options out, and wants, which are weighted and rank what survives. Stuart Pugh's controlled convergence scores every option against a baseline, because relative judgments are more reliable than absolute ones.

Both address the reverse-engineered matrix: criteria chosen after the options are known, weights set after the scores are felt, and the winner being the option the author already preferred, now wearing a table.

- **Ordering is the method.** Criteria and weights are fixed and printed before any option is scored, and a weight that moves afterwards is declared wrong and the matrix rerun, not nudged.
- **Criteria have to differ, be observable, and be independent.** "Performance" is a topic. "P99 latency on the current workload" is a criterion. Anything all options satisfy equally is cut and said to be cut.
- **Musts are binary and absolute.** An option failing one is out regardless of the rest of its scores.
- **Unknowns stay unknown.** A `?` on a heavily weighted criterion is the most important cell in the matrix, and converting it to a middling score to complete the table destroys the one useful piece of information.
- **The total is distrusted.** Three tests before it is accepted: does it surprise you, how thin is the margin, and what single change flips it. The last of those is the most useful line in the output.
- **The result is checked against the gut.** If the winner is what you would have picked anyway, the skill goes looking for the weight that made it come out that way.

## `/hypotheses`

```
/hypotheses
/hypotheses the checkout timeouts that only happen on Tuesdays
/hypotheses why the cache hit rate dropped after the deploy
```

Richards Heuer's Analysis of Competing Hypotheses, from *Psychology of Intelligence Analysis*, written for analysts who kept failing the same way: forming a view early, then reading everything afterwards as support for it.

The inversion is that hypotheses are listed first and evidence is applied to all of them at once. The question asked of each item is not which hypothesis it supports but which it rules out. Nothing is selected. One is left standing.

- **Hypotheses before evidence**, three to six, including the one you arrived with stated plainly, at least one you think unlikely, the boring causes, and "the symptom is not what is actually happening" whenever a person rather than an instrument reported it.
- **Mechanisms, not categories.** "Race condition" is a category. "Two workers claim the same job because the claim is not atomic" makes predictions.
- **Consistency is capped.** Marks run `--` to `+`, with no `++`, because supporting evidence is weak evidence. Ten `+` marks do not establish a hypothesis and one `--` can kill it.
- **Diagnosticity decides.** Evidence consistent with every hypothesis is crossed out and kept visible as discounted. Only the items that separate hypotheses carry weight.
- **Elimination, not accumulation.** A hypothesis rescued by three explained-away inconsistencies is reported as rescued.
- **Ties stay tied**, named rather than broken by preference, and the output closes with the cheapest observation that would separate them.

## `/premortem`

```
/premortem
/premortem the plan to move sessions into Redis
/premortem this migration
```

Gary Klein's technique, published in *Harvard Business Review* in 2007, resting on the finding by Mitchell, Russo, and Pennington that people generate around thirty percent more reasons for an outcome when told it already happened than when asked to predict it.

The grammar is the trick. "What could go wrong" invites a defence of the plan. "It is six months later and this failed, explain why" invites an explanation, which reaches causes a risk assessment structurally cannot, because a risk assessment is written by someone who still believes the plan works.

- **The failure is fixed as an accomplished fact**, with a date and a specific form, at a horizon chosen deliberately. A week surfaces operational failure, a quarter design failure, a year maintenance failure.
- **Two failures, not one.** It broke, and separately: it worked and was still the wrong thing. The second branch is where most regret lives and no implementation plan covers it.
- **Eight to twelve causes before filtering**, covering the categories a plan's author reliably misses: unstated assumptions, seams, state that already exists, partial completion, success as the cause, and the human failures.
- **Ranked on detectability as well as likelihood.** The dangerous failure is quiet, not loud, and the silent ones are called out as silent.
- **Every kept cause carries a leading indicator**, something someone could actually see. A cause with no possible indicator is a reason to change the plan rather than to monitor it.
- **It ends in changes**, each tagged prevent, detect, limit, or accept. An accepted risk is written down as accepted, because otherwise it is indistinguishable later from one nobody saw.

## `/redteam`

```
/redteam
/redteam the claim that this migration runs online without locking
/redteam the architecture you just proposed
```

Red teaming assigns someone to attack a plan their own side produced. Applied to an agent the conflict of interest is total: you are attacking work you produced, in a conversation whose entire gradient runs toward agreeing with it.

So the skill carries one rule above the rest. You are trying to break it, not to review it. A review concluding the plan is sound has said nothing, because that was already the default.

- **Checkable beats arguable.** The strongest red team finding is almost always a file that contradicts the plan, not an argument against it, so the skill looks before it argues.
- **The load-bearing assumption first.** Most plans fail at one point. The skill finds the single premise that would make the approach wrong rather than merely worse, and checks it if it is checkable.
- **The objection is steelmanned**, written as its best advocate would write it, using the plan's own criteria. An objection that only works by changing the requirements is not an objection.
- **Seven fixed attack positions**, worked through deliberately: the adversary, the maintainer, the operator, the scale shift, the predecessor, the requirement, and the cost of the plan itself. The predecessor position sends it into the git history, where Chesterton's fence usually is.
- **Findings are sorted** fatal, structural, contingent, noted, with noted capped at two, because a long list of small objections buries the one that counts.
- **An empty red team is reported as empty.** No padding to justify having been called.

## `/fermi`

```
/fermi
/fermi how long the auth rewrite takes
/fermi what this query costs at ten times the traffic
```

Fermi estimation decomposes a quantity nobody has data for into factors that can each be bounded. It works because errors in independent factors partly cancel: a product of six estimates each within a factor of two beats one guess at the answer.

It addresses the refusal to estimate. "It depends" is true, unfalsifiable, and useless to anyone planning. A single confident number is worse, because it cannot be checked, corrected, or partly reused when one input turns out wrong.

- **Counting beats estimating.** The skill counts the files, times the query, and reads the pricing page first, and hybrid estimates are normal: measure what is measurable, estimate only the rest, and mark which is which.
- **Three to six factors.** Below three is a guess with extra steps. Above six, error bars widen faster than cancellation helps.
- **For durations, the dropped factors dominate**: the number of distinct places to change, review latency, environments to pass through, and the fraction of time actually spent on this rather than other work.
- **Every factor gets a low, a high, and a source tag** naming whether it was counted, measured, documented, drawn from a similar case, or guessed. That tag is what lets someone replace one weak factor without redoing the rest.
- **Bounds are widened after they first feel right**, and results are rounded to at most two significant figures. "23.4 days" claims precision the method cannot produce.
- **The dominant factor is the output.** Which factor the answer is hostage to, what resolving it would do to the range, and what it costs, which is usually less than the deliberation it replaces.

## `/base-rate`

```
/base-rate
/base-rate your estimate that this refactor takes two days
/base-rate how likely this dependency upgrade is to break something
```

Reference class forecasting comes from Kahneman and Tversky's work on the planning fallacy and was made into a working method by Bent Flyvbjerg, whose version is required by the UK Treasury's Green Book. The finding is stable and uncomfortable: forecasts built from the specifics of a case are reliably optimistic, and forecasts built from how similar cases turned out are reliably better, even when the forecaster knows far less about the specific case.

For an agent the pull toward the inside view is close to total, because the specifics are in the context window and the history is not. This skill goes and gets the history.

- **The class is defined structurally**, by what drives outcomes rather than by subject matter, then its members are looked up rather than recalled: `git log` for changes of this kind, reverted commits and hotfixes for the failure rate, closed pull requests for review latency, and the repository itself for the previous attempt.
- **Five to ten members is usable.** Three is thin and is reported as thin in the first line. One is an anecdote and is labelled one.
- **The spread is the information**, along with the tail and the failure rate, with counts. "Four of the last six took two to five weeks, one took eleven, one was abandoned" beats an average and takes the same space.
- **Adjustments need a structural reason** that would not be true of a typical class member. "This one is simpler" is not one, since every case felt simpler to the person planning it. Adjustment is capped at about thirty percent, except toward the tail, which is free.
- **The base rate wins by default.** Overruling it requires naming the difference and putting it on the record.

## `/quit`

```
/quit
/quit this refactor, three days in
/quit before I start the parser rewrite
```

Annie Duke's *Quit* argues that the skill of stopping is undertrained relative to the skill of persisting, for structural rather than moral reasons: effort already spent is vivid and the alternative use of remaining effort is abstract, so persistence always has the better advocate.

This is the only skill here that runs in the middle of the work. It has a second, cheaper mode that runs before it: called on work about to start, it sets the kill criteria while judgment is still uncommitted, which is worth more than the best judgment made at hour twelve.

- **A criterion has three parts**: an observable signal, a specific threshold, and a decision attached. Without the third it is a metric, and a metric gets watched and then rationalised. The budget rule is written with its extension rule, since budgets get extended rather than honoured.
- **The sunk cost is named once and set aside**, which works better than trying not to think about it. Both errors are rejected: "too far in to stop", and its inversion, "so long spent that the approach must be wrong". Neither is evidence.
- **The rate is evidence, though.** Three days on what was estimated at one says nothing about whether to stop, and a great deal about the remaining estimate being wrong by the same factor.
- **The comparison runs forward only**, against a named alternative. An unnamed alternative always loses.
- **The middle options are the point.** Reduce scope, change approach and keep the goal, pause recoverably, timebox one more attempt, or hand it to a fresh context. Binary framing is what makes stopping feel drastic.
- **The salvage is named**: what was learned, what code is reusable, and what the failed attempt eliminated. A ruled-out approach is a real asset.
- **Either way, a new criterion is set.** Continuing without a new threshold is a decision to have this conversation again later with more spent.

## `/adr`

```
/adr
/adr using advisory locks instead of a queue table
/adr why we kept the duplicated validation in both services
```

Michael Nygard proposed the Architecture Decision Record in 2011: a short document in the repository, next to the code, capturing one decision and the forces that produced it. The format is deliberately small, because a format that is expensive to write does not get written.

Six months later the code shows what was decided and nothing shows why. The next person either preserves a constraint that no longer exists or removes a safeguard whose reason was never written down.

- **Not every decision earns one.** The skill applies a test first, and says why it is not writing a record rather than writing a thin one. Reversals and narrowings of earlier decisions are always recorded, because the earlier decision is what the next reader will find.
- **The project's convention wins.** It checks `docs/adr`, `docs/decisions`, `doc/arch`, `adr`, and `.adr-dir` and follows what it finds exactly. Inventing a second convention is worse than not writing the record.
- **Records are immutable once accepted.** A changed decision gets a new record and the old one's status becomes `Superseded by NNNN`. The status line is the only line that may ever be edited.
- **Context carries the weight**, written in the present tense as it was then: the constraint, what was already true, the tension between two things that could not both be satisfied, and what was not known at the time.
- **Alternatives get one line each on why they lost**, which is what stops the decision being re-litigated.
- **Consequences state what becomes harder**, specifically. A consequences section with no costs is advertising and readers discount the whole record on sight.
- **The condition for revisiting is written down.** It is the most useful line in the record and the one most often left out.

## Installation

```
/plugin install decide@naikidev
```
