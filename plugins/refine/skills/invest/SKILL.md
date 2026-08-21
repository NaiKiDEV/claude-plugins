---
name: invest
description: Grade each item on whether it can actually be picked up and finished, and repair what fails. Wake's INVEST, with the items that pass emitted in brief shape so an orchestrator can dispatch them without a translation step.
argument-hint: [the items to grade, or nothing to use the ones on the table]
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit
---

Grade these items: $ARGUMENTS

Bill Wake published INVEST in 2003 as a six-letter checklist for a unit of work: Independent, Negotiable, Valuable, Estimable, Small, Testable. Its value is not that the six properties are surprising. It is that each letter fails in a recognisable way and each failure has a known repair, so "this item is not ready" becomes a specific defect with a specific fix instead of an impression.

The failure it addresses is the item that reads fine and cannot be executed. It survives planning because planning means reading it, and every letter that fails is invisible to reading. The defect only surfaces when somebody tries to start, at which point they either ask a question, which costs a day, or guess, which costs more and costs it later.

For dispatched work the stakes change. **A spoke that starts cold cannot ask.** It reads the brief, forms a reading, and implements it fluently. Every failing letter becomes a silent guess at dispatch time, and the guess arrives back looking like completed work. This skill is the gate before that, and its output is shaped to be handed straight across.

## Resolve what is being graded

- **An argument.** Grade those.
- **Nothing.** Take the items on the table, list them in one line each, and confirm the list before grading.
- **One large item that has not been broken down.** Say so. Grading a whole project against a per-item rubric returns six failures and no information. Send it to `/wbs`, or to `/split` if it is one item that is merely too big.
- **Nothing on the table.** Say so and stop.

## Check before you grade

Read enough to grade honestly. Several letters are claims about the repository, not about the wording, and they cannot be settled from the text.

- **Independence** is a claim about files and interfaces. Check what each item would touch. Two items that both edit one module are not independent whatever their descriptions suggest.
- **Estimable** is a claim about what is known. Where an item's size depends on how many call sites exist, count them. A `grep` settles in seconds what an argument will not settle at all.
- **Testable** is a claim about the project. Find the command that would decide it. Where none exists, that is the finding.

Grade what the item says, not what you assume it means. Where you find yourself supplying the missing intent in order to pass a letter, the letter has failed and you have just demonstrated how.

## The rubric

Grade each item on all six. For each letter: pass, or fail with the specific defect and the named repair.

### I - Independent

Can it be done without waiting on another item in this set, and without two owners in the same file at the same time?

Ordering dependencies are normal and are not failures. A cycle is a failure, and so is a hidden dependency that is not written down.

- **Fails when** two items must be integrated before either is verifiable, when a cycle exists, or when two items write the same file and both are meant to run at once.
- **Repair.** Sequence them and state the order, naming what the predecessor must return. Merge them where the seam costs more than the parallelism buys. Or re-cut the set on a different seam with `/split`, which is the right answer when the dependency exists because the split was horizontal.

### N - Negotiable

Is this a statement of what is needed, or a specification of how to build it?

An item that fixes the implementation removes the judgment of whoever does the work, which is usually the person best placed to have it. It also hides the actual requirement, so when the prescribed approach turns out not to work, nobody knows what was really being asked for.

- **Fails when** the item names the mechanism, the library, the file layout, or the algorithm, with no statement of the need behind it.
- **Repair.** Strip the implementation and restate the need, then reattach anything genuinely fixed as a **constraint**, labelled as one, with its reason. "Must use the existing retry helper, because a second retry policy in this service is what we are trying to remove" is a legitimate constraint. The same sentence without the reason is a decision somebody will silently overturn.
- **Not a failure** where the implementation is the point: a specific refactor, a named migration, a change requested exactly as described.

### V - Valuable

Is it worth finishing on its own, to somebody who is not the implementer?

- **Fails when** the value is internal to the work: scaffolding, a layer, a preparatory refactor, a slice nobody would ship alone.
- **Repair.** Roll it up into the item it serves. A necessary preparatory step is part of a work package, not a peer of one, and promoting it to a peer is how a set of vertical slices quietly becomes a horizontal split.
- **Note.** For agent work the value test is weaker than for a product backlog, and pretending otherwise produces ceremony. The version that keeps its teeth: **could this be dispatched and verified on its own, and would the result be worth keeping if the rest of the set were cancelled?** If not, it is part of something else.

### E - Estimable

Can somebody put a range on it without doing part of it first?

- **Fails when** the unknown is inside the item. Not "this is hard to estimate" but "nobody knows how many call sites there are", "nobody knows whether the upstream API supports this", "nobody knows what the data looks like".
- **Repair.** Name the unknown, then either resolve it now if it is cheap, which it usually is, or break it out as a timeboxed spike whose deliverable is the answer and whose output is a better version of this item. Where the unknown is genuinely irreducible and the `decide` plugin is installed, `/fermi` produces a range with the dominant factor named, which is a real answer and better than an unestimated item.
- **The tell.** If your estimate would change by more than about a factor of three depending on one fact, that fact is the item.

### S - Small

Does it finish in one pass, without a checkpoint in the middle?

- **Fails when** it needs to be re-briefed partway through, when it spans several subsystems, or when its completion test only runs at the end of several days of work.
- **Repair.** `/split`, on a named seam. Do not cut it arbitrarily to satisfy the letter, which trades a size failure for an independence failure and a testability failure at once.
- **Also fails when it is too small.** An item whose brief is longer than the change is overhead. Merge it upward and say so.

### T - Testable

Is there a check that passes when it is done and would have failed before?

This is the letter that matters most and the one most often waved through, because every item can be given a sentence that sounds like acceptance criteria.

- **Fails when** the criterion is a judgment: "works correctly", "is clean", "handles errors properly", "improves performance". Also fails when a criterion exists but nothing in the project could run it.
- **Repair.** Get to a command. A test file and the command that runs it, a build that must pass, a query returning a specific result, an exit status. Where the criterion is genuinely observational, write the exact observation and the values involved.
- **Where the rule is understood but the cases are not, `/examples` is the repair.** Concrete examples with real values are the definition of testable, and a rule with no example under it is a testability failure that has not been recognised yet.
- **The check has to be able to fail.** A criterion satisfied by the current tree tests nothing. State what it returns now.

## Report the failures

For each item, the letters that failed, the defect in one line each, and the repair. Do not report the passes individually. A six-line table of ticks per item buries the two letters that actually failed.

Then, across the set:

- **Which letter fails most often.** It is rarely a coincidence, and it usually points at the split rather than at the items. Widespread **I** failures mean a horizontal cut. Widespread **T** failures mean the acceptance criteria were never derived from anything. Widespread **E** failures mean the work is genuinely unknown and the first item should be a spike.
- **Whether the set is ready as a set**, not just item by item.

## Emit the ready items

Items passing all six are emitted in brief shape. This is the handoff, and the shape is what makes it one.

For each ready item:

- **Objective.** One paragraph. What done looks like, stated so somebody who has never seen this conversation can tell whether they got there.
- **Context.** What was established here that this item needs and would otherwise be rediscovered: the convention in play, the shape of the surrounding code, the decision already taken and not up for revisiting, the predecessor's result where this is a later stage. Written for a reader who cannot see this conversation and cannot ask.
- **Scope.** The exact paths it may read, and where it writes, the exact paths it may write. Nothing outside the list.
- **Boundaries.** What not to do. Name the adjacent work belonging to another item, so it does not get helpfully absorbed.
- **Check.** The command that decides it, and what that command returns now.

Two rules on the context field, because it is where this fails in practice:

- **No deixis.** "The file we looked at", "as discussed above", "the approach we agreed" all resolve to nothing for the reader. Name the file. State the approach.
- **Constraints carry their reasons.** A constraint with no reason gets overturned by anyone who thinks of something better, and they will be right to, because nothing told them otherwise.

## Hold back the rest

Items failing a letter do not get emitted, and the failure is not softened into a note in the context field.

Say plainly what is not ready, what would make it ready, and who has to do that. Where a failure is a question only the user can answer, that question is the output, and nothing downstream should start on the item until it is answered.

Where holding an item back blocks others, say which. Where it does not, say that too, so the ready ones can proceed.

## Output

- **The failures**, per item, letters and defects and repairs. Nothing for the letters that passed.
- **The set-level finding**: the letter that failed most, and what that says about the decomposition.
- **The ready items**, in brief shape, one block each.
- **The held items**, with what would make each one ready.
- **The blocking questions**, listed separately, in the order they should be answered.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/split`.** Sequential, and it is the repair for **S**, and often for **I**. Every slice it returns comes back through this rubric, because a slice that is small and untestable has traded one failure for another.
- **`/examples`.** Sequential, and it is the repair for **T**. Concrete examples with real values are what testable means, and the check in the brief is written against them.
- **`/wbs`.** Sequential, and it comes first. That produces the structure and the work packages. This grades whether each one can actually be executed and emits the ones that can.
- **`/smells`.** Complementary, and it comes first where a written specification exists. That grades how the requirements are written. This grades whether the items are executable. A specification can pass every wording check and still contain items nobody can start.
- **`/hub`.** Sequential, if the `hub` plugin is installed, and this is the reason for the output shape. The five fields are the brief's fields, so ready items go to the gate without being rewritten. The hub still writes the return shape, since that belongs to dispatch rather than to the item.
- **`/fermi`.** Reinforcing, if the `decide` plugin is installed. It is the repair for **E** where the unknown cannot be resolved cheaply.
- **`/boundary`.** Reinforcing, if the `verify` plugin is installed. Where **T** fails because the input space was never partitioned, that derives the cases systematically rather than by inspection.

## Before you send

- Was the repository checked for the letters that are claims about it, rather than all six being graded from the text?
- Did any item pass a letter because you supplied the missing intent yourself?
- For **I**, was file overlap actually checked, not inferred from the descriptions?
- For **N**, does every retained implementation constraint carry its reason?
- For **E**, is the named unknown a specific fact, rather than a feeling that it is hard?
- For **S**, was any item cut arbitrarily to pass, at the cost of another letter?
- For **T**, is every check a command or a stated observation, and is it said what it returns now?
- Are the passes left unreported, so the failures are visible?
- Was the most common failing letter identified and read as a statement about the decomposition?
- Does every emitted brief stand alone, with no reference to this conversation?
- Are the held items listed with what would make each ready, rather than emitted with a caveat?
- Are the blocking questions separated out and ordered?
