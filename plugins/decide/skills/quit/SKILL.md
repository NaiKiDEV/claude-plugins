---
name: quit
description: Decide whether to keep going or stop, without counting what has already been spent. Kill criteria set in advance, the sunk cost removed from the comparison, and the salvage named.
argument-hint: [the work in progress to evaluate, or the work about to start, to set kill criteria for]
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit
---

Decide whether to continue: $ARGUMENTS

Annie Duke's *Quit* makes the case that the skill of stopping is undertrained relative to the skill of persisting, and that the reason is structural rather than moral. Effort already spent is vivid and the alternative use of the remaining effort is abstract, so persistence always has the better advocate. The correction is a decision made against criteria set before the effort was invested, by someone who did not yet have anything to defend.

This is the moment nothing else in this plugin covers. Every other skill runs before the work or after it. This one runs in the middle, when a refactor is three days deep and going sideways, a debugging session has burned an afternoon, or a rewrite is at sixty percent with the hard sixty percent left.

It has a second, cheaper mode, and that one is where the value is. Run before the work starts, it sets the kill criteria while judgment is still uncommitted. A criterion written in advance is worth far more than the best judgment made at hour twelve.

## Resolve which mode

- **Work already underway**, or no argument with work in progress on the table. Run the stop-or-continue decision below.
- **Work about to start**, described in the argument. Run **Set the criteria** only, and skip the rest. Say plainly that this is the cheap mode and that it is being used.
- **Nothing on the table.** Say there is nothing to evaluate and stop.

## Check before you argue

Most stop-or-continue arguments are settled by a fact nobody has gone and got.

Before reasoning about it: run the failing test and see how many still fail, check how much of the plan is actually done rather than how much feels done, look at how long the last comparable effort took, see whether the thing that is blocking you is blocking one path or all of them. Where the state of the work is checkable, check it. An argument about progress conducted without measuring progress is not a decision.

## Set the criteria

The criteria are what the decision is made against. Set them in advance where you can, and where the work is already running, set them now and honestly, before looking at the current state.

Each criterion has three parts, and all three are needed:

- **A signal.** Something observable. The number of failing tests, the count of call sites still to migrate, whether the spike answered its question, whether the third attempt at the same bug worked.
- **A threshold.** A specific value or a specific time. "Still red after two more hours." "More than forty call sites." "The third approach also fails."
- **A decision attached.** What happens when it trips. Stop, escalate, change approach, or reduce scope. A criterion with no decision attached is a metric, and it will be watched and then rationalised.

Two additional properties:

- **A budget**, in time or attempts, is the most useful single criterion and the easiest to set. It is also the one that gets extended rather than honoured, so write the extension rule at the same time: it may be extended once, by a stated amount, and only for a stated reason.
- **A monitoring point.** When the criteria get looked at. Otherwise they are checked when things feel bad, which is the judgment they were written to replace.

Where the work is already underway and no criteria were set, say so. It is the reason the decision is hard now, and setting them for the remainder is still worth doing.

## Take the sunk cost out

Before comparing anything, state what has already been spent, and then set it aside explicitly. Naming it works better than trying not to think about it.

The question is not whether the effort so far was worth it. That effort is gone either way. The question is only this:

> From here, with what remains, is finishing this the best use of the remaining effort?

Two symmetrical errors to name and reject:

- **The sunk cost argument.** "We are too far in to stop." Distance travelled is not evidence about distance remaining.
- **The inverted sunk cost argument.** "We have spent so long that it must be a bad approach." Effort already spent is not evidence against it either. It is not evidence.

The legitimate use of the history is different and it is important: what has happened so far is evidence about the **rate**. Three days spent on what was estimated at one is not a reason to stop, but it is strong evidence that the remaining estimate is also wrong by a similar factor, and that is a real input.

## Compare from here

Estimate two things forward, and only forward.

- **Continue.** What remains, its range, and what is genuinely unknown about it. The remaining work is the part that was never planned, so estimate it with that in mind. `/fermi` or `/base-rate` if it matters.
- **Stop.** The best alternative. Not a vague absence: what specifically gets done instead, or what the simpler approach is, or what the state is if this is abandoned now. An unnamed alternative always loses.

Then find the middle options, because the choice is rarely binary and the binary framing is what makes stopping feel drastic:

- **Reduce scope.** Ship the part that works. Take the eighty percent that is done and cut the requirement that made the last twenty hard.
- **Change approach, keep the goal.** The goal survives, the method is abandoned. This is what most people mean by giving up and it is usually the right answer.
- **Pause.** Park it in a recoverable state and come back with the missing information. Say what makes it recoverable and what would bring you back.
- **Timebox the rest.** One more bounded attempt with a criterion that has teeth this time.
- **Hand it over.** A fresh context sometimes finishes in an hour what a saturated one cannot finish at all. This is especially true in a long session.

## Name the salvage

Stopping is not the same as losing everything, and the salvage is usually the reason stopping is affordable.

Say specifically what is kept: what was learned, what code is reusable, what the failed attempt eliminated, what is now understood about the system that was not before. A ruled-out approach is a real asset and it belongs in the record so the next attempt does not repeat it.

Say also what is lost, plainly. The report has to be usable by someone who decides the other way.

## Recommend

One line, plainly. Continue, continue with a reduced scope, change approach, pause, or stop.

Where a criterion has already tripped, say so and say when it tripped. That is the finding, and it outranks the rest of the analysis.

Then, whichever way it goes, set the next criterion. A decision to continue without a new threshold attached is a decision to have this conversation again later with more spent.

## Output

- **What was spent**, stated once and set aside.
- **The criteria**, either the ones set in advance and whether they tripped, or the ones being set now.
- **Continue**: what remains, with a range.
- **Stop**: the named alternative, and the salvage.
- **The middle options** that apply.
- **The recommendation**, one line, and the next criterion with its threshold.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/premortem`.** Reinforcing, and it supplies the raw material. A leading indicator with a threshold and a decision attached is a kill criterion.
- **`/base-rate`.** Reinforcing. How long comparable efforts ran before being abandoned, and how many were rescued after this point, is the evidence that settles it.
- **`/fermi`.** Reinforcing. The remaining work needs a range, and the rate observed so far is the strongest factor in it.
- **`/reversible`.** Different questions on the same axis. That asks what walking back costs. This asks whether to walk back now.
- **`/options`.** Sequential, where the recommendation is to change approach. Widen before picking the replacement, or you will pick the nearest neighbour of the thing that just failed.

## Before you send

- Was the state of the work measured rather than argued about?
- Are the criteria stated, with a signal, a threshold, and a decision attached to each?
- Was a criterion already tripped, and is that said first?
- Is what has been spent named once and then excluded from the comparison?
- Was the inverted sunk cost argument avoided as well as the ordinary one?
- Was the rate used as evidence about the remaining estimate?
- Is the alternative to continuing named specifically rather than left as an absence?
- Are the middle options present, not just continue or stop?
- Is the salvage named, and the loss stated plainly?
- Does the recommendation come with a next criterion and a threshold?
