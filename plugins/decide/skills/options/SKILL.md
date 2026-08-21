---
name: options
description: Generate genuinely different approaches before evaluating any of them. Widening from Heath and Heath's WRAP, with the vanishing options test and a forced opportunity cost.
argument-hint: [the decision, or the single approach currently on the table]
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit
---

Widen the options for: $ARGUMENTS

Chip and Dan Heath open *Decisive* with a finding from Paul Nutt's study of organisational decisions: most of them were "whether or not" decisions, a single option evaluated against doing nothing. Those decisions failed far more often than ones where two or more real alternatives were compared. Widening the frame is the first step of their WRAP process, and it is the cheapest of the four.

The failure is narrow framing. An option arrives, attention moves immediately to evaluating it, and evaluation feels like rigour. It is not: careful analysis of one option is careful analysis of a frame nobody examined. This is amplified when the option arrives from an agent, because it arrives fluent, complete, and with the reasoning already attached, which makes it read as a conclusion rather than as the first thing that came to mind.

This skill deliberately separates generation from evaluation. Nothing is judged until the list is closed.

## Resolve what is being widened

- **An argument.** Widen that.
- **Nothing.** Take the approach on the table: the design just proposed, the library about to be added, the fix about to be applied. State it in one line as **Option A**, fairly, in its strongest form.
- **Nothing on the table.** Say there is no decision to widen and stop.

## Check before you generate

Widening is for decisions. It is not for questions with an answer.

Where the project has already decided this, the option set is not open and inventing one wastes the user's time. Look first: an existing pattern in the codebase, a convention in `CLAUDE.md`, a documented decision, a dependency already carrying this responsibility. Report what you find, and only widen what remains genuinely open.

Where the decision is small and reversible, say so and give two options rather than five. Effort belongs where the choice is expensive to unmake.

## 1. Generate without judging

Suspend evaluation completely. Not "briefly", completely. The moment a comparison enters, generation stops and the remaining options are produced to lose.

Aim for four to six, then close the list. Do not write pros or cons yet.

These probes reach different regions of the space, and using them beats staring at the problem:

- **Vanishing options.** Option A is now impossible. It is forbidden, the library is unmaintained, the team refuses. What do you do instead? This is the single highest-yield probe, because it removes the anchor rather than asking you to ignore it.
- **The opposite constraint.** You have one hour. You have a month. It must ship today. It must last ten years. Each generates a genuinely different design.
- **Do nothing.** State what happens if nobody acts, specifically. Sometimes it is fine, and it is always the baseline every other option is measured against.
- **Buy it, or already have it.** A dependency, a managed service, or something already in this repository doing most of the job. Look before asserting nothing fits.
- **Solve a different problem.** Change the requirement instead of meeting it. The most valuable option is often the one that makes the work unnecessary.
- **Both, not either.** Where two options look exclusive, ask whether they are. Run them in parallel, ship one behind a flag, or stage one after the other.
- **Steal it.** How does an established system in this space do it? Name the system.

## 2. Kill the decoys

A list padded with obviously bad options is worse than a short list, because it produces the feeling of having chosen while delivering the original answer intact.

Test every option: **would you defend this if the person who proposed it were in the room?** Anything that fails is a decoy. Cut it and say the list is shorter.

Two real options honestly compared beats five where three exist to lose.

## 3. State the opportunity cost

For each option, name what it forecloses. Not a generic downside, a specific thing you give up by choosing it: a capability, a future change made harder, time that then cannot go somewhere named.

This is where "whether or not" framing does its damage. Doing this instead of that is a comparison. Doing this or not is not.

Where the real currency is your time or the user's, say what the same effort buys elsewhere. Naming the alternative use is the point.

## 4. Report

Print the options with what distinguishes them, and stop before choosing.

- Each option in one or two lines, in its strongest form.
- Its opportunity cost.
- What is genuinely unknown about it, if anything, and what it would cost to find out.
- The one question whose answer decides between them. Often this is a single fact, and often it is cheap to obtain, in which case getting it beats deliberating.

Give a recommendation at the end, in one line, clearly marked as yours and clearly separable from the list. The user is choosing. The list is the deliverable, and it must stay usable by someone who disagrees with the recommendation.

Do not score the options here. Scoring against declared criteria is `/tradeoff`, and doing it informally in this skill quietly recreates the narrow frame with more steps.

## Do not

- Do not present variations of one approach as separate options. Three flavours of the same design is one option.
- Do not manufacture an option to reach a number. Say the space is genuinely narrow.
- Do not omit an option because it is outside your remit. Name it and say who owns it.
- Do not drop the do-nothing baseline because it looks like a non-answer.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/tradeoff`.** Sequential, and this comes first. That scores options against declared criteria and needs a set to score. Running it on a set of one is the failure both skills exist to prevent.
- **`/reversible`.** Sequential and cheap. Classify first, because a two-way door does not deserve six options.
- **`/premortem`.** Sequential. Widen, choose, then premortem the choice.
- **`/redteam`.** Different targets. This asks what else there is. That attacks what you picked.
- **`/adr`.** Reinforcing. The rejected options and their opportunity costs are most of an ADR's Context section, and the part reconstructed worst six months later.

## Before you send

- Was every option generated before any was evaluated?
- Is the option you arrived with stated in its strongest form?
- Was the vanishing options test actually run?
- Is doing nothing in the list, with its consequence stated?
- Is there an option that changes the requirement rather than meeting it?
- Would you defend every remaining option to its author?
- Are these genuinely different approaches, or variations of one?
- Does every option name a specific thing it forecloses?
- Is there one question that would decide it, and is it cheap?
- Is the recommendation separable from the list?
