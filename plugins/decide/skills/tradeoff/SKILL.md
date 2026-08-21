---
name: tradeoff
description: Score options against criteria fixed before the scoring starts. Kepner-Tregoe musts and wants, scored on a Pugh matrix against a baseline, with the result stress tested before it is accepted.
argument-hint: [the options to compare, or nothing to use the ones on the table]
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit
---

Compare these options: $ARGUMENTS

Two methods, used together. Kepner-Tregoe's Decision Analysis splits criteria into musts, which are binary and screen options out, and wants, which are weighted and rank what survives. Stuart Pugh's controlled convergence scores every option against a baseline rather than in the abstract, because relative judgments are far more reliable than absolute ones.

The failure both address is the reverse-engineered matrix. Criteria are chosen after the options are known, weights are set after the scores are felt, and the winner is the option the author already preferred, now wearing a table. The output looks like analysis and contains none, and it is worse than an honest opinion because it cannot be argued with.

The defence is ordering. Criteria and weights are fixed and printed before any option is scored, and they do not move afterwards.

## Resolve what is being compared

- **An argument.** Compare those.
- **Nothing.** Take the options on the table and list them before starting.
- **One option.** Stop. There is nothing to compare, and scoring a single option against criteria you just wrote is the failure this skill exists to prevent. Say so and offer `/options` instead.
- **Nothing on the table.** Say there is nothing to compare and stop.

## Check before you score

A matrix is for genuine tradeoffs. Where one option is simply better, say that in a sentence.

Look first for the facts that make the comparison unnecessary. One option is incompatible with the runtime in use. One is already in the dependency tree. The project has a documented convention. A benchmark exists. Check what is checkable, and report facts as facts rather than converting them into scores, which only blurs them.

Where the options differ on something you can measure in minutes, measure it. A number beats a `4` out of `5`.

## 1. Fix the criteria

Write the criteria before looking at any option, and print them before scoring. This ordering is the method.

Split them:

- **Musts.** Binary, and non-negotiable. Runs on the supported runtime. Licence is compatible. Meets the deadline. Handles the actual data volume. Each must be stated so an option can be tested against it without judgment.
- **Wants.** Everything else, weighted.

Keep wants to five or fewer. Beyond that, weights become noise and the total tells you nothing.

Every criterion must be:

- **Something that differs between the options.** A criterion they all satisfy equally cannot affect the outcome. Cut it and say so.
- **Observable.** "Performance" is a topic. "P99 latency on the current workload" is a criterion. "Maintainability" is a topic. "Number of people on the team who have used it" is a criterion.
- **Independent.** Two criteria measuring the same property double the weight of that property silently.

Include the criteria that get quietly dropped: what the team already knows, what happens when the author of this loses interest, the cost of getting out again, and how it fails.

## 2. Fix the weights

Assign weights now, before scores. Print them.

Use a small scale, `1` to `5` or `1` to `3`. Precision here is false, and the appearance of precision is the risk.

State the reasoning for the top-weighted criterion in one line. A weight without a reason is where the preferred answer usually enters.

Do not adjust a weight after seeing a score. If a weight turns out wrong, say explicitly that it was wrong, why, and rerun the whole matrix. Silently nudging it is the failure with an extra step.

## 3. Screen on musts

Apply the musts. An option that fails one is out, and it is out regardless of how well it scores on everything else. That is what makes a must a must.

Where every option fails a must, the must is wrong or the option set is too narrow. Say which, and stop rather than downgrading it to a want to keep the exercise moving.

Where an option fails a must in a way that could be fixed, name the fix and its cost, and score the option as it is rather than as it could be.

## 4. Score against a baseline

Pick a baseline: the current approach, the incumbent, or the most conventional option. Everything is scored relative to it.

| Mark | Meaning |
| --- | --- |
| `+` | Better than the baseline on this criterion |
| `0` | About the same |
| `-` | Worse |
| `?` | Not known |

Use `?` freely and honestly. A `?` on a heavily weighted criterion is the most important cell in the matrix, because it says the comparison is not ready and names what would finish it. Converting it to a middling score to complete the table destroys the one piece of information worth having.

Score criterion by criterion across all options, not option by option. Working down a column lets one option's overall impression colour every cell in it.

## 5. Total, then distrust the total

Sum the weighted scores. Then treat the number as a prompt rather than a verdict.

Three tests before accepting it:

- **Does it surprise you?** If it does, that is the method working. Find which cell moved it, and check that cell rather than the conclusion.
- **How thin is the margin?** Where the top two are within a weight of each other, the matrix has not separated them. Say so. Do not present a rounding difference as a finding.
- **What single change flips it?** Name the one weight or score that reverses the result. Where a plausible correction to one cell changes the winner, the decision rests on that cell and belongs there, not in the total.

Run the last test always. It is the most useful line in the output.

## 6. Sanity check against the gut

Ask directly: is the winner the option you would have picked anyway?

- **Yes.** Look hard for the criterion or weight that made it come out that way, and say whether you would defend it to someone who preferred another option.
- **No.** Say so explicitly. This is where the method earns its cost. Present the result and name what your instinct is objecting to, since instinct sometimes encodes a criterion nobody wrote down. If that is what happened, name the missing criterion, add it, and rerun openly.

## Output

- **Criteria and weights**, printed before the matrix, musts separated from wants.
- **The screen.** Which options fell out on which must.
- **The matrix.** Criteria as rows, options as columns, baseline marked. Use `/matrix` or `/table` if that plugin is installed.
- **The totals**, followed by the flip test and the margin.
- **The recommendation** in one line, with the one thing it depends on.
- **What is unresolved.** Every `?` on a weighted criterion, and what it would cost to resolve.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/options`.** Sequential, and that comes first. This ranks a set. It cannot widen one.
- **`/reversible`.** Sequential and cheap. A two-way door does not deserve a weighted matrix.
- **`/base-rate`.** Reinforcing. Where a criterion is "how often does this go wrong", a reference class beats a `+` or a `-`.
- **`/redteam`.** Sequential. Point it at the criteria and the weights rather than at the winner, since that is where the answer was actually decided.
- **`/adr`.** Reinforcing. The criteria, the weights, and the rejected options are the ADR's Context and Consequences.
- **`/calibrated`.** Reinforcing. A `?` cell is an open question, and where it must be estimated it takes a probability word rather than a number that looks measured.

## Before you send

- Were the criteria written before the options were examined?
- Are musts separated from wants, and is every must genuinely binary?
- Are there five or fewer wants?
- Does every criterion actually differ between the options?
- Is every criterion observable rather than a topic?
- Were weights fixed and printed before any scoring?
- Did any weight move after a score was seen?
- Is the baseline named, and was scoring done across rows rather than down columns?
- Is every unknown a `?` rather than a middling score?
- Is the margin between the top two stated?
- Is the single change that would flip the result named?
- Was the result checked against your prior preference, and was the answer said out loud?
