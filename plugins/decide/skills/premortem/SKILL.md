---
name: premortem
description: Assume the plan already failed, then explain why. Klein's prospective hindsight - causes ranked by likelihood and detectability, each carrying a leading indicator.
argument-hint: [the plan, change, or approach about to be committed to]
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit
---

Run a premortem on: $ARGUMENTS

The premortem is Gary Klein's technique, published in *Harvard Business Review* in 2007. It rests on a finding from Mitchell, Russo, and Pennington: people generate roughly thirty percent more reasons for an outcome when they are told it already happened than when they are asked to predict it.

The grammar is the whole trick. "What could go wrong" invites a defence of the plan, and produces a short list of risks already mitigated. "It is six months later and this failed completely, explain why" invites an explanation, and an explanation is a different cognitive task. It reaches the causes that a risk assessment is structurally unable to surface, because a risk assessment is written by someone who still believes the plan works.

Applied to a plan an agent just produced, it does something narrower and more useful: it forces the plan's own author to stop advocating for it.

## Resolve what is being premortemed

- **An argument.** Premortem that.
- **Nothing.** Take the plan on the table: the approach just proposed, the migration about to run, the design just agreed. Restate it in one line before starting, including the parts you are treating as fixed.
- **Nothing on the table.** Say there is no plan to premortem and stop. A premortem on an idea nobody has committed to produces generic risks.

## Check before you speculate

A premortem is for outcomes you cannot observe yet. It is not a substitute for looking.

Where a failure mode is checkable now, check it and report a fact instead. Whether the index exists, whether the column is nullable, whether the endpoint is rate limited, whether that dependency is actually pinned. A premortem full of guesses about things sitting in the repository is worse than no premortem, because the confirmed and the imagined arrive looking alike.

Speculate about what is genuinely unobservable: behaviour under load you cannot generate, how people will use it, what the third party will do, what the code will look like after six months of other hands.

## 1. Fix the failure

Write the failure as an accomplished fact, with a date and a specific form. Vagueness here produces vagueness everywhere downstream.

- Weak: "the migration went badly".
- Strong: "It is three weeks after the migration. The table has been locked twice in business hours, we have rolled back once, and two teams have stopped trusting the new column."

Pick the horizon deliberately. A week surfaces operational failure, a quarter surfaces design failure, a year surfaces maintenance failure. Where the plan carries all three, run the exercise at more than one horizon and say which is which.

Two failures are worth fixing separately, because they have almost disjoint causes:

- **It broke.** The thing did not work.
- **It worked and it was still the wrong thing.** It shipped, it was correct, and it was not worth having, or it made the next change harder. This branch is the one an implementation plan never covers, and it is where most regret actually lives.

## 2. Explain it

Now write the causes. You are explaining a fact, not assessing a probability. Stay in that grammar: "the reason it failed was", not "it might fail if".

Aim for eight to twelve before filtering. The last few are where the value concentrates, because the first three were already in the plan's risks section.

Cover the categories a plan's author reliably misses:

- **What the plan assumed without saying.** Every plan rests on load, shape, volume, latency, ordering, or uniqueness that nobody stated. Name the assumption, then say what breaks when it is false.
- **The seam.** Failures cluster where the change meets code, teams, or systems the plan does not own.
- **The state that already exists.** Rows that predate the constraint, records in a status the new code does not model, clients on an old version.
- **Partial completion.** The plan ran halfway and stopped. What is the system like now, and can it be moved in either direction from there?
- **Success as the cause.** It worked, and the thing that worked made something else worse: a load pattern, a cost line, an abstraction others then built on.
- **The human failures.** Nobody understood it, the person who wrote it left, it was correct and unusable, the rollback existed and nobody dared run it.
- **Nothing broke and it did not matter.** The thing shipped and moved no number anyone cares about.

## 3. Rank

Two axes, and the second is the one people forget.

- **Likelihood.** How readily this happens. Coarse bands only, high, medium, and low, unless you have a real base rate.
- **Detectability.** Whether you would find out early, late, or only from a user. A moderately likely failure you would catch in an hour outranks nothing. A less likely one nobody notices for a quarter outranks almost everything.

Rank on the pair. The dangerous row is quiet, not loud. Say explicitly which failures are silent, because those are the ones that need instrumentation rather than mitigation.

## 4. Attach a leading indicator

This is the output that survives the meeting. For every cause worth keeping, name the earliest observable sign that it is starting.

An indicator has to be something someone could actually see: a metric with a direction, a log line, a query, a review comment, a number in a dashboard, a question a user asks. "We would notice it degrading" is not an indicator. "P99 write latency on that table crosses 200ms" is.

Where a cause has no possible leading indicator, say so and treat it as a reason to change the plan rather than to monitor it. An undetectable failure is a design problem.

## 5. Change something

A premortem that ends in a list has not paid for itself. Close with what changes.

Name each change against the cause it addresses, and be honest about the shape:

- **Prevent.** The plan changes so the cause cannot occur.
- **Detect.** The cause can still occur, and the indicator goes in now, not later.
- **Limit.** The cause can occur and its blast radius is bounded: a flag, a batch size, a canary, a reversible step.
- **Accept.** Named, understood, and consciously carried. This is a legitimate answer and it must be written down as one, because an accepted risk that was never stated is indistinguishable afterwards from a missed one.

Where the premortem found something that should stop the plan rather than adjust it, say that plainly and first.

## Output

- **The failure**, stated as a fact, with its horizon.
- **The causes**, ranked, each with likelihood, detectability, and its leading indicator. A table earns its place here once there are more than four.
- **The changes**, each tagged prevent, detect, limit, or accept, and each pointing at the cause it answers.
- **The verdict** in one line: proceed, proceed with the changes, or stop.

Do not soften the exercise back into an endorsement at the end. The plan may well be good. It is being stress tested, and the report is the stress test, not a summary of it.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/hypotheses`.** Different times. That explains a failure that happened. This explains one that has not.
- **`/redteam`.** Different targets. This attacks the plan's outcome. That attacks the plan's reasoning, including the reasoning in this premortem.
- **`/reversible`.** Sequential and cheap. Classify the decision first. A two-way door rarely justifies a full premortem, and a one-way door always does.
- **`/quit`.** Reinforcing, and the leading indicators are the raw material. An indicator with a threshold and a decision attached is a kill criterion.
- **`/hub`.** Run this on the decomposition before the gate. The seam failures it surfaces are exactly the ones spoke briefs are least likely to catch.

## Before you send

- Is the failure written as an accomplished fact with a date and a specific form?
- Was the second failure covered: it worked and was still wrong?
- Are there at least eight causes before filtering?
- Is anything in the list checkable in this repository right now, and was it checked?
- Does the list contain an unstated assumption of the plan, a seam, and existing state?
- Is every cause ranked on detectability as well as likelihood?
- Are the silent failures called out as silent?
- Does every kept cause carry an observable leading indicator?
- Does every change name the cause it answers and its shape?
- Is every accepted risk written down as accepted?
