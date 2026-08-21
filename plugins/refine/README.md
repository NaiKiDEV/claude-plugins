# refine

Refinement procedures for Claude Code. Each skill runs one published protocol against work that has been described but not yet defined: a goal with a backlog under it that nobody can cut, a task list nobody can tell is complete, an item too big to start, acceptance criteria everyone agreed to and nobody read the same way.

| Skill | Protocol | Question it answers |
| --- | --- | --- |
| [`/impact`](#impact) | Adzic's impact mapping | Why are we building this, and what would we drop? |
| [`/wbs`](#wbs) | Work breakdown structure and the 100% rule | What is all the work, and what is missing? |
| [`/split`](#split) | Lawrence's splitting patterns and Cohn's SPIDR | This is too big. Where does it cut? |
| [`/examples`](#examples) | Wynne's example mapping | What does this criterion actually mean, concretely? |
| [`/smells`](#smells) | Requirements smells against ISO/IEC/IEEE 29148 | Can this specification be acted on as written? |
| [`/invest`](#invest) | Wake's INVEST | Can someone pick this up and finish it? |

## What these do

They take work that has been described and drive it down until it can be executed. They do not do the work, and they do not decide what the work should be.

The failure they address is specific to how planning is read. An item that cannot be executed and an item that can look identical on the page, because the defect in the first one is an absence: no trigger, no threshold, no owner, no check, no stated failure case. Reading is the operation that cannot detect an absence, and reading is what planning consists of. So the defect survives every review and surfaces when somebody tries to start.

For dispatched work this gets worse rather than better. A person given an ambiguous task asks a question. **An agent given an ambiguous task does not.** It picks a reading, implements it fluently, and returns something that looks finished and quietly encodes a decision nobody made. The cost of an underdefined item is therefore not a delay, it is a plausible wrong answer, and it is paid at the end rather than at the start.

Each protocol works by making an absence visible as a structural failure rather than as a thing to notice. A rule with no example under it. A level whose children do not sum to its parent. A requirement that fits no template. A slice that cannot be verified alone. A letter that fails. None of these require anyone to be perceptive, which is the point, because being perceptive is not a repeatable input.

## Conventions

**Manual only.** Every skill sets `disable-model-invocation: true`. Claude never invokes a refinement procedure on its own, and the descriptions stay out of context until a skill is called.

**Read-only.** All six hold `disallowed-tools: Edit Write NotebookEdit`. They read the repository, run commands, and report. Nothing here writes a plan file, because a plan file that is not maintained is worse than no plan file, and deciding what lands on disk belongs to the user.

**Check before you refine.** Every skill opens by reading the repository, because most of these questions have answers that are already checkable. `/invest` counts the call sites rather than arguing about whether an item is estimable. `/examples` reads the existing tests, since a test is a concrete example somebody already agreed to. `/wbs` reads the module layout, since it is a decomposition somebody already committed to. `/smells` checks requirements against the code, because a requirement contradicted by what exists outranks every wording problem in the document.

**Nothing invented to fill a shape.** A rule with no example does not get an example fabricated for it, it becomes an open question. A requirement missing its trigger does not get one supplied. A level that does not sum to 100% reports the residue rather than widening a sibling to absorb it. This is the convention the whole plugin rests on, because the alternative, an agent quietly completing the specification it was asked to check, produces exactly the plausible wrong answer these exist to prevent.

**Open questions are an output, not an obstacle.** Several skills produce a list of things only a human can answer, and each is written so it can be answered in one line, with what would change depending on the answer. A question whose answers all produce the same work is reported as non-blocking rather than raised.

**Two entry points.** With an argument, a skill runs against that target. With none, it takes the work on the table and restates it in one line before starting. With nothing on the table, it says so and stops.

**Sequenced, with declared precedence.** Each skill carries a `Composes with` section covering the others. The pipeline runs `/impact` to `/wbs` to `/split` to `/examples` to `/invest`, with `/smells` entering wherever a written specification already exists. Two are repairs rather than stages: `/split` is what an item failing **S** goes to, and `/examples` is what an item failing **T** goes to. One overlap is declared and resolved: `/smells` and `dialect`'s `/normative` cover much of the same ground at the sentence level, and the division is that `/normative` writes and this reads, adding the set-level pass that finds conflicts between requirements.

**Hyphens only.** The skills instruct Claude to write the ASCII hyphen and never the em dash or en dash, and to restructure with a full stop, comma, colon, or parentheses where a dash would otherwise appear.

## `/impact`

```
/impact
/impact getting evaluation accounts to a working API call
/impact this quarter's roadmap
```

Gojko Adzic's impact mapping, from 2012. Four levels answering why, who, how, and what: the goal, the actors who can affect it, the changes in their behaviour that would move it, and the deliverables that might produce those changes.

It addresses the backlog nobody can cut. Every item looks equally necessary because none carries a stated purpose, so the only argument for dropping one is that somebody likes it less.

- **A deliverable is a hypothesis, not a promise.** Written as "we believe X will cause Y to Z, and we will know when W". That grammar is what makes it falsifiable, which is what makes it cuttable.
- **The goal must be achievable without building the thing.** If it is not, it is a deliverable wearing a goal's clothes and the real goal is one level up. It carries a metric, a number, and a horizon, and where nothing measures it today the skill says so, which is often the most valuable line in the map.
- **Obstructing actors go on the map**, not just beneficiaries. The person who has to approve it usually decides whether the goal is met.
- **An impact is a behaviour change in the actor**, observable in them rather than in the system, and the impacts you want to **prevent** are included.
- **At least two deliverables per impact.** One means the deliverable was decided first and the impact was written to justify it. The cheap and non-software options are generated deliberately, since they lose to features by default.
- **Things come off the map.** A deliverable with no impact above it is cut and named, not quietly left on.

## `/wbs`

```
/wbs
/wbs moving session storage to Redis
/wbs the API versioning work
```

The work breakdown structure from MIL-STD-881 and the PMI practice standard, governed by Haugan's 100% rule: the children of any node sum to exactly the parent, no more and no less.

It addresses the task list that is a list of things somebody thought of. Every line on it is real work, nothing reveals what is missing, and two lines can silently cover the same ground so the work is done twice or skipped by both owners.

- **Exhaustive and mutually exclusive**, checked in both directions at every level. Sum up for gaps, sum down for strays, and check siblings for overlap.
- **Deliverables, not activities.** Nodes are nouns for things that will exist. "Design, build, test, deploy" is 100% of any project by construction, which is why it can never reveal that nobody planned the rollback.
- **The recurring omissions are checked by name**: migration and backfill, the rollback path, configuration, the clients that must be updated, deprecation, and deleting the old code once the new code is live.
- **A leaf is a work package** only if it passes all four tests: one owner, estimable without doing part of it, one completion test that is a command rather than a judgment, and finishable in one pass without a checkpoint.
- **Gaps are stated, not absorbed.** A level that will not sum reports its residue. A stated gap is a finding; an unstated one becomes somebody's weekend.
- **The parallel front is an output**: which packages have no unmet dependency and disjoint file sets, which is what can start at once.

## `/split`

```
/split
/split the bulk import item
/split this, it's three weeks of work
```

Richard Lawrence's splitting patterns from 2009, with Mike Cohn's SPIDR as the compressed version. A catalogue of known-good cuts, worked in order of yield.

It addresses the improvised cut, which is almost always horizontal: the database piece, the API piece, the interface piece. No piece delivers anything alone, so no piece can be verified alone, and everything has to land before anybody learns whether the idea worked. The work was divided and the risk was not.

- **Every slice is vertical.** Three tests, all required: could it ship alone, is something observably different afterwards, and can it be verified on its own terms.
- **The patterns are worked in order of yield.** Workflow steps, business rule variations, happy path first, data variations, interface variations, operations, effort asymmetry, simple against complex, deferred qualities, and a spike as the last resort.
- **Business rule variations is the highest-yield seam in practice**, because most items that feel large are one behaviour with several conditions attached.
- **The anti-patterns carry named repairs.** "Add the table", "build the endpoint", "write the tests", "refactor first", and "error handling" as one bag each fail a specific test and each has a specific fix.
- **The code is read for seams that already exist** before a seam is invented: a flag, a branch in the handler, a nullable column. Following an existing seam costs a fraction of introducing one.
- **Checking that it needs splitting at all is the first gate.** Three slices of one file is slower than the file.
- **The ranking reason is stated and is never ease.** Easiest-first is how a set of vertical slices becomes a horizontal split in slow motion.

## `/examples`

```
/examples
/examples the rate limiting story
/examples "handles invalid uploads correctly"
```

Matt Wynne's example mapping, from 2015. Four card colours in a twenty-five minute conversation: the item, its rules, a concrete example under each rule, and a red card for every question nobody present can answer.

It addresses agreement on an abstraction. "Handles invalid input correctly" is a sentence everyone approves and nobody reads the same way, and it survives review because reviewing it means reading it.

- **The red cards are the point.** A model asked to implement an ambiguous rule will not stop; it picks a reading and implements it fluently. The skill carries an explicit prohibition on resolving a question by choosing, and on writing "assuming X" and continuing.
- **An example has real values.** Not "an invalid email" but `a@b`. Not "a large payload" but `11 MB` against a `10 MB` limit. A restatement of the rule in different words is the way this step is usually skipped.
- **Every rule with a threshold gets its boundary written**, at the edge and one step past, because that is where the off-by-one disagreement lives.
- **Rule collisions are hunted deliberately.** Two rules that contradict on one specific example is the most valuable thing the session produces.
- **Rules carry a source tag**: stated, found in the code, found in a test, or inferred. An inferred rule is a proposal and is labelled one, so it does not enter the specification with the weight of something somebody asked for.
- **The card counts are the verdict.** More than about six rules means it is too big and goes to `/split`. No questions at all is treated as a sign that nothing was examined rather than that everything was clear.

## `/smells`

```
/smells
/smells docs/spec/webhooks.md
/smells this ticket before I start on it
```

Requirements smells, from Femmer and colleagues, detecting violations of the quality characteristics defined in ISO/IEC/IEEE 29148. Most requirement defects are visible in the text itself, without understanding the domain.

It addresses the specification that reads well and cannot be executed. Every sentence is grammatical and the ambiguity only becomes visible when somebody has to act on it and picks a reading.

- **The set-level pass is the half a careful read cannot do.** Two requirements that each pass every check can still contradict each other, and no amount of scrutiny one sentence at a time will find it. Conflicts, duplication, overlap, gaps, orphans, and inconsistent terminology are checked with requirements grouped by what they constrain.
- **The requirements are checked against the code**, not only against each other. A requirement contradicted by what exists outranks every wording problem in the document.
- **Graded by consequence, not counted.** Blocking, serious, minor, with minor capped and the omitted count stated. A smell count is a number that goes down when somebody deletes adjectives.
- **A blocking finding comes back as a question, not a wording fix.** Sharpening "must be fast" into "must respond within 200 ms at p95" is a decision about a service level, and making it silently while appearing to correct grammar is the worse failure.
- **The standard gaps are checked by name**: error paths where only success is stated, empty and maximum cases, second attempts, migration of existing data, and authorisation where an operation is specified without it.
- **It does not rewrite.** The audit hands off to `/normative` and `/ears`.

## `/invest`

```
/invest
/invest the five items above
/invest before I hand these to /hub
```

Bill Wake's checklist from 2003: Independent, Negotiable, Valuable, Estimable, Small, Testable. Six letters, each failing in a recognisable way, each failure carrying a known repair.

It addresses the item that reads fine and cannot be executed, and it is the gate before dispatch. A person given an ambiguous task asks. A spoke that starts cold cannot, so every failing letter becomes a silent guess that comes back looking like completed work.

- **The output is brief-shaped**, and this is the reason for the skill's position. Ready items are emitted with Objective, Context, Scope, Boundaries, and Check, which are the fields `/hub` writes into a spoke brief, so they cross without being rewritten.
- **Several letters are claims about the repository**, not about the wording, and are checked there. Independence is file overlap. Estimable is often a `grep`. Testable is whether a command exists.
- **Each letter carries its repair.** **I** sequences or re-cuts, **N** strips the implementation and reattaches genuine constraints with their reasons, **V** rolls a subtask up, **E** names the unknown and spikes it, **S** goes to `/split`, **T** goes to `/examples`.
- **Passes are not reported.** A table of ticks buries the two letters that failed.
- **The most common failing letter is read as a statement about the decomposition.** Widespread **I** means the cut was horizontal. Widespread **T** means the criteria were never derived from anything.
- **Items that fail are held back, not softened.** The failure does not become a caveat in the context field, and where the fix is a question only the user can answer, that question is the output.
- **A brief may not refer to this conversation.** No "the file we looked at", no "as discussed", and every retained constraint carries its reason, because a constraint without one gets overturned by the first person with a better idea.

## Handing off to orchestration

The last stage exists because refinement that stops at a document has not finished. `/invest` emits ready items in the five fields a spoke brief is made of:

```
Objective    what done looks like, to someone who has not seen this conversation
Context      the conventions, decisions, and predecessor results the item needs
Scope        exact read paths, and for a writing item, exact write paths
Boundaries   the adjacent work that belongs to another item
Check        the command that decides it, and what it returns now
```

Where the [`hub`](../hub) plugin is installed, these go to `/hub` and arrive at its gate without a translation step. The hub adds the return shape, which belongs to dispatch rather than to the item, and routes each one to a spoke. Where it is not installed, the same five fields are what a person needs to pick the item up cold.

## Installation

```
/plugin install refine@naikidev
```
