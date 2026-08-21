---
name: reversible
description: Classify a decision by what it costs to undo before spending anything on making it. Bezos's one-way and two-way doors, with the exit cost stated and the deliberation matched to it.
argument-hint: [the decision being weighed]
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit
---

Classify this decision: $ARGUMENTS

Amazon's 1997 and 2015 shareholder letters split decisions in two. Type 2 decisions are two-way doors: walk through, and if it is wrong, walk back. Type 1 decisions are one-way doors, or close enough that the return trip is expensive. The argument is that organisations apply Type 1 deliberation to Type 2 decisions, which is slow, and Type 2 speed to Type 1 decisions, which is worse.

This is the cheapest skill here and it belongs before the others. It takes a minute and it tells you whether to spend an hour. Running a weighted matrix and a premortem on a choice you could reverse in ten minutes is not rigour, it is cost with the appearance of rigour. Skipping both on a choice that writes a schema nobody can migrate off is the failure that matters.

It is also the correction for a specific agent failure mode: an agent deliberates at a uniform depth set by the phrasing of the request rather than by the stakes, so a trivial choice gets a full analysis and a schema change gets a paragraph.

## Resolve what is being classified

- **An argument.** Classify that.
- **Nothing.** Take the decision on the table and state it in one line.
- **Several decisions bundled together.** Separate them first. Bundles are usually one irreversible decision travelling with several reversible ones, and separating them is most of the value. Classify each.

## Check before you classify

Reversibility is a fact about the system, not a judgment about it. Most of it is checkable.

Look before deciding: does a migration have a down step, is the flag still wired up, is there a backup and has a restore been tested, is the old code path still there, is the package pinned, is the data still recoverable, is the API already published. Answer from the repository, not from what is usually true.

## 1. State the exit

Do not classify by feel. Answer four questions, concretely.

- **What is the undo?** The actual operation. "Revert the commit." "Run the down migration." "Flip the flag." "Email four hundred customers." If you cannot name the operation, it is not reversible, whatever it feels like.
- **What does it cost?** Time, money, downtime, data, and credibility, in whatever units apply.
- **How long is the window?** Many decisions are reversible for a while and then are not. Before the release, before a client integrates, before the data is written, before the index is dropped. Name the moment the door closes, because that is usually the actionable output.
- **Who has to agree?** A decision you can undo alone is more reversible than one requiring a third party, another team, or a customer.

## 2. Classify

| Class | Test | Deliberation |
| --- | --- | --- |
| **Two-way** | Undone by you, in under an hour, with no external effect | Decide now. State the choice and move. |
| **Stiff** | Undoable, at real cost: hours of work, a coordinated deploy, a backfill | Widen the options and pick. Do not run a full analysis. |
| **One-way** | Not undoable, or only at a cost nobody will pay: published interfaces, destroyed data, external commitments, dependencies others build on | Slow down. This is what the rest of the plugin is for. |

Two facts about the classification:

- **Cheap to reverse is not the same as easy to notice.** A change reversible in a minute is still effectively one-way if it will be six months before anyone sees it is wrong. Detectability is part of reversibility, and a silent two-way door is a one-way door with a delay.
- **Reversible components can compose into an irreversible whole.** Each step being revertable does not make the sequence revertable, once later steps depend on earlier ones or data has been written in the new shape.

## 3. Convert the door where you can

The most valuable move is often not deciding better. It is changing the door.

Before accepting a one-way classification, ask what would make it two-way, and what that costs:

- **A flag** turns a deploy into a toggle.
- **Additive first.** Add the new column, write to both, migrate readers, drop the old one later. Each step is reversible where the single cutover was not.
- **An adapter or a facade** keeps the choice local, so replacing it later touches one file rather than forty.
- **A subset.** Ship to one customer, one region, or one percent. A decision that only applies to a small population is cheaper to unmake.
- **A copy.** Retain the data instead of dropping it. Almost every destructive operation has a version that defers the destruction.
- **Delay the closing.** Do not publish the interface, do not announce it, do not let the client integrate yet. Keeping the door open costs less than deliberating harder about walking through it.

Where conversion is available and cheap, recommend that rather than more analysis. This is the highest-value output the skill produces.

## 4. Recommend the depth

Close by saying what to do next, and specifically what not to do.

- **Two-way.** "Decide now. Do not analyse this." Say which way, in one line, and move.
- **Stiff.** Name the one or two things worth resolving first, and say what is not worth resolving.
- **One-way.** Say which further work is warranted and why: widen the options, compare them formally, premortem the choice, or record it. Also name the moment the door closes, because that sets the deadline for all of it.

Refusing to deliberate is a real recommendation here and it should be given plainly when it applies. It is the half of the argument that gets dropped.

## Output

Short. Four to eight lines for a single decision. A skill that costs more than the choice it triages has defeated itself.

- The decision, in one line.
- The undo, its cost, its window, and who must agree.
- The class, with the reason.
- The conversion, if one is available and cheap.
- The recommended depth, including what not to spend time on.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/options`, `/tradeoff`, `/premortem`.** Sequential, and this gates all three. Its output is the answer to whether running them is worth it.
- **`/quit`.** Different questions about the same axis. This asks what it costs to walk back. That asks whether to walk back now.
- **`/adr`.** Reinforcing, and this is the trigger. A one-way door is exactly the decision that deserves a record.
- **`/hub`.** Reinforcing. Run this on the decomposition: the one-way pieces are the ones that need verification before the reversible work is built on them.

## Before you send

- Is the undo named as an actual operation rather than an impression?
- Is the closing window named, where the door closes over time?
- Was the repository checked for the down migration, the flag, the backup, the old path?
- Was a bundle separated into its parts before classifying?
- Was detectability considered, not just cost?
- Was the sequence checked, not only the individual steps?
- Was a conversion to a two-way door looked for before accepting one-way?
- Does the recommendation say what not to spend time on?
- Is the whole output shorter than the decision deserves to be?
