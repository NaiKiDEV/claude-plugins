---
name: wbs
description: Decompose work by deliverable until every leaf is a work package one owner can finish and one test can close. The 100% rule, so the children of a node sum to exactly the parent, with nothing missing and nothing counted twice.
argument-hint: [the deliverable or project to decompose, or nothing to use what is on the table]
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit
---

Break this down: $ARGUMENTS

The work breakdown structure comes from US defence programme management, standardised as MIL-STD-881 and later carried into the PMI's *Practice Standard for Work Breakdown Structures*. Its governing constraint is the 100% rule, stated by Gregory Haugan: the structure captures 100% of the work defined by the scope, and the children of any node sum to exactly 100% of that node. No more, and no less.

The failure it addresses is the task list that is a list of things somebody thought of. It looks complete because every line on it is real work. Nothing about it reveals the work that is missing, and nothing prevents two lines from silently covering the same ground, so that work is either done twice or, more often, skipped by both owners on the assumption the other had it.

Two properties matter more than the tree itself:

- **Exhaustive.** Everything in scope appears somewhere.
- **Mutually exclusive.** Nothing appears twice.

A breakdown that has both can be reasoned about. A breakdown that has neither is an ordered list of good intentions.

## Resolve what is being decomposed

- **An argument.** Decompose that.
- **Nothing.** Take the deliverable on the table and state it in one line for confirmation before starting.
- **A goal rather than a deliverable.** Stop, and say so. A goal decomposes into deliverables only after somebody decides which deliverables would achieve it, which is `/impact`, not this. Decomposing straight from a goal produces a plausible tree of work nobody established was needed.
- **Nothing on the table.** Say so and stop.

## Check before you decompose

Read the repository before generating a structure. A breakdown invented from the shape of the request rather than the shape of the code is the expensive failure here, because every downstream estimate and assignment inherits it.

- What already exists. Half the work in most breakdowns is already done, and a node covering it should say so rather than being planned.
- What the project's own structure implies. Package boundaries, module layout, and existing test organisation are a decomposition somebody already committed to, and cutting across them costs more than following them.
- What the project already runs as checks. Every work package needs a completion test, and the cheapest one is a command the project already has.
- Whether a previous attempt exists in the history. A reverted branch or an abandoned directory tells you which node is harder than it looks.

Where a single command settles the size of the whole thing, run it rather than decomposing around the uncertainty.

## 1. Fix the scope boundary

Before splitting anything, write two lists.

- **In scope.** What the 100% refers to. Without this line, the 100% rule has no referent and cannot be applied.
- **Explicitly out of scope.** The adjacent work that will be assumed to be included unless it is named. This list is the one that prevents the argument later, and it is worth more than any single node in the tree.

State both before decomposing. Where the boundary is genuinely undecided, say which reading you are taking and note that the other reading changes the structure.

## 2. Decompose by deliverable, not by activity

Nodes are things that will exist, named as nouns. Not phases, not activities, not verbs.

- "Session storage migrated to Redis" is a deliverable.
- "Implementation" is a phase, and a phase is not a decomposition of anything. It is the same work sorted by when someone will touch it.

The activity-based tree fails in a specific way: it hides omissions. "Design, build, test, deploy" is 100% of any project by construction, so it can never reveal that nobody planned the rollback path.

Two exceptions where the deliverable rule bends, and both must be stated as exceptions:

- **A spike.** Its deliverable is an answer, not an artefact. Name the question it answers and the decision that waits on it.
- **A recurring or level-of-effort node**, such as review or support during a migration. It has no completion test in the usual sense, so give it a boundary in time rather than in output.

## 3. Apply the 100% rule at every level

At each node, check both directions before descending further.

- **Sum up.** Do the children cover the whole parent? Name what is missing rather than widening a sibling to absorb it. The recurring gaps: migration and backfill, the rollback path, the configuration change, the client that has to be updated, documentation someone is contractually owed, the deprecation of the thing being replaced, and the work of deleting the old code once the new code is live.
- **Sum down.** Does anything in the children fall outside the parent? A child doing work the parent does not cover means either the parent is misnamed or the child belongs elsewhere.
- **Check for overlap.** Two siblings touching the same files, the same interface, or the same migration are not mutually exclusive. Either merge them, or move the shared part up into the parent and state where it lives.

Where a level cannot be made to sum, say so explicitly and name the residue. A stated gap is a finding. An unstated one becomes somebody's weekend.

## 4. Stop at the work package

A node stops decomposing when it becomes a work package. Four tests, all of which must pass:

- **One owner.** A single person or a single spoke can hold all of it. Work needing two owners to coordinate mid-flight is not one package.
- **Estimable.** Someone can put a range on it without first doing part of it. Where they cannot, the unknown is the package, and it should be split out as a spike.
- **One completion test.** A command, or an observable condition, that settles whether it is done. Not a judgment, not a review, not "it works".
- **Small enough to finish without a checkpoint.** The classic heuristic is 8 to 80 hours of effort; for agent work the useful version is that it completes in one pass without needing to be re-briefed partway through.

Do not decompose past this point. A work package split into three because three felt tidier produces a seam that costs more to reconcile than the package cost to build.

Where a node fails only the size test, that is `/split`, and splitting it by the wrong seam is what produces packages nobody can verify alone.

## 5. Number and record

Number hierarchically, `1`, `1.1`, `1.1.1`. The number is how a package is referred to afterwards, and it is what makes a gap visible.

For each work package record, in one or two lines each:

- **What exists when it is done.** Stated as a fact about the tree, not as an intention.
- **The owner**, or the kind of owner where none is assigned.
- **The completion test.** The exact command where there is one.
- **The files it owns**, where they are known. Two packages writing the same file is a scheduling constraint and, for parallel dispatch, a hard one.
- **What it depends on**, by number. Dependencies between packages are the sequencing, and packages with none are the parallel front.

Keep the description to what somebody would need to start. Anything longer is the brief, and the brief is written at dispatch.

## Output

- **Scope in and scope out**, before the tree.
- **The numbered tree.** Use `/file-tree` or `/tree` if the `visualize` plugin is installed.
- **The work package table**, one row per leaf: number, deliverable, owner, completion test, dependencies.
- **The 100% findings.** Every level that did not sum, and the residue named.
- **The parallel front.** Which packages have no unmet dependency and disjoint file sets, since that is what can start at once.
- **The riskiest package**, being the one whose estimate you would least defend, with what would resolve it.

## Do not

- Do not produce a tree deeper than three or four levels for ordinary work. Depth is usually decomposition continuing past the work package because the structure felt unfinished.
- Do not invent a node to balance the tree. Uneven branches are normal and a symmetrical breakdown is usually a fabricated one.
- Do not put effort or duration in the tree itself. Estimates belong against work packages, and putting them at every level invites double counting, which the 100% rule exists to prevent.
- Do not write the file. This prints a structure. Where the project keeps plans on disk, the user decides what lands there.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/impact`.** Sequential, and it comes first. That decides which deliverables are worth building. This decomposes one of them.
- **`/split`.** Sequential, and it is the repair. A node that fails only the size test at step 4 goes there, because splitting it by the wrong seam produces packages that cannot be verified independently.
- **`/invest`.** Sequential, and it is the gate after this. This produces the structure. That grades each package on whether it is actually executable and emits the ones that pass in brief shape.
- **`/fermi`.** Reinforcing, if the `decide` plugin is installed. A package that fails the estimable test gets decomposed into bounded factors rather than guessed at.
- **`/premortem`.** Reinforcing, if the `decide` plugin is installed. Run against the tree rather than the plan, since the causes it generates are usually missing nodes, and a missing node is a 100% rule failure that was invisible from inside the structure.
- **`/hub`.** Sequential, if the `hub` plugin is installed. The parallel front and the file ownership in the package table are exactly what the hub's decomposition and gate need, and handing it a breakdown replaces the phase where it is weakest.

## Before you send

- Is the scope boundary written, including what is explicitly out?
- Are the nodes deliverables named as nouns, rather than phases or activities?
- At every level, do the children cover the whole parent, and was the residue named where they do not?
- Do any two siblings overlap on files, interfaces, or migrations?
- Were the recurring omissions checked: migration, rollback, configuration, clients, documentation, deprecation, and deleting the old code?
- Does every leaf pass all four work package tests?
- Does every work package carry a completion test that is a command or an observable condition rather than a judgment?
- Is the tree numbered, and are dependencies stated by number?
- Is the parallel front identified, with disjoint file sets?
- Is the riskiest package named, with what would resolve it?
