---
name: redteam
description: Attack a plan or a claim on its own terms. Steelman the strongest objection, name the assumption the whole thing rests on, and report only what would actually change the decision.
argument-hint: [the plan, claim, design, or conclusion to attack]
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit
---

Red team this: $ARGUMENTS

Red teaming is the practice of assigning someone to attack a plan their own side produced. The UK Ministry of Defence's *Red Teaming Handbook* frames it as a corrective to groupthink and to the momentum a proposal picks up simply by being the proposal. Sandia's *Ten Commandments of Red Teaming* adds the discipline that matters most here: the red team does not decide anything. It informs the person who does.

Applied to an agent, the target is narrower and the conflict of interest is total. You are attacking work you produced, in a conversation whose whole gradient runs toward agreeing with it. Every turn since the plan appeared has been spent elaborating it. The plan is now the frame, and its assumptions have stopped looking like assumptions.

So this skill has one rule above the others: **you are trying to break it, not to review it.** A review that concludes the plan is sound has said nothing, because that was the default. Bring back the strongest objection that exists, stated as well as its best advocate would state it, and then say honestly whether it holds.

## Resolve what is being attacked

- **An argument.** Attack that.
- **Nothing.** Take the most load-bearing thing in the conversation: the plan just agreed, the conclusion just reached, the design about to be built. Name it in one line, in its strongest form, before attacking it.
- **Nothing on the table.** Say there is nothing to attack and stop.

Fix the target precisely. "The plan" is too broad to attack usefully. "The claim that this migration can run online without locking" is a target with an answer.

## Check before you argue

An objection you can settle is not an objection. It is a fact, and it outranks every argument in the report.

Before writing anything, look. Read the code the plan assumes, run the test it claims passes, check the version it depends on, grep for the caller it says does not exist. The strongest red team finding is almost always a file that contradicts the plan, not an argument against it.

Argue only about what cannot be checked here: future behaviour, scale, other people, tradeoffs, and judgment.

## 1. Find the load-bearing assumption

Most plans fail at one point, not many. Find it before enumerating anything.

Ask what single thing, if false, would make the whole approach wrong rather than merely worse. Not a risk to a step. The premise the approach is built on.

It is usually one of these:

- **A property of the data** nobody verified: volume, shape, cardinality, uniqueness, ordering, nullability, how much of it already violates the new rule.
- **A behaviour of a dependency** taken from its documentation, its name, or its reputation rather than from its source or a test.
- **A property of the environment**: the runtime, the version, the configuration in production as opposed to locally.
- **A claim about people**: they will migrate, they will read it, they will not do the thing you are not preventing.
- **A framing** inherited from how the problem was first described, and never revisited.

Name it, state whether it is checkable, and check it if it is. If the plan has no single load-bearing assumption, say so, because that is genuinely good news and it is rare.

## 2. Steelman the objection

Write the strongest case against, as its best advocate would write it. Not the version that is easy to answer.

This means: grant everything the plan gets right, attack it at its strongest point rather than its weakest, and use the plan's own criteria rather than importing new ones. An objection that only works by changing the requirements is not an objection to the plan.

Where you cannot construct a strong objection, say that, and say what you tried. That is a real result and it is worth more than a manufactured one.

## 3. Attack from fixed positions

Work through these deliberately. Each finds a different class of failure, and skipping to whichever feels productive reproduces the original blind spot.

- **The adversary.** Someone wants this to fail. Where do they push? Not only a security attacker: a user on a bad connection, a client retrying aggressively, a colleague using the API in a way it was not designed for.
- **The maintainer.** Six months on, nobody here wrote this. What is now impossible to change, and what will be worked around instead of understood?
- **The operator.** It is failing at 03:00. What does the person on call see, and can they act on it?
- **The scale shift.** Ten times the data, ten times the traffic, one tenth the latency budget. Which part breaks first, and is that failure loud or quiet?
- **The predecessor.** Someone already tried something like this here. Look for it in the repository and the history. Why is the old way the way it is? Chesterton's fence is a real finding, and the fence is usually still in the git log.
- **The requirement.** Does this solve the problem that was actually stated, or the problem it was convenient to solve?
- **The cost of the plan itself.** The alternative to a complicated correct plan is often a simple sufficient one. Say if the plan costs more than the problem.

## 4. Rate what you found

Not everything you found matters. Sort it, and be strict, because a long list of small objections buries the one that counts and trains the reader to skim.

- **Fatal.** The approach is wrong. Not "risky", wrong. Say what to do instead.
- **Structural.** The approach survives, and something in it has to change before it ships.
- **Contingent.** Only bites if something specific is true. State the something, and whether it is checkable.
- **Noted.** Real, small, and not worth acting on now. Cap this at two items and cut the rest.

If nothing is fatal or structural, say that in the first line. Do not pad the report to justify having been called.

## 5. Say what would settle it

For each fatal and structural finding, name the observation that would resolve it either way, and its cost. This is what converts an argument into a next step.

Where a finding cannot be settled before committing, say so. That is the definition of a risk you are choosing to carry, and it belongs in the record as one.

## Output

- **The target**, in one line, stated fairly.
- **The load-bearing assumption**, and its status: verified, refuted, or open.
- **The strongest objection**, steelmanned, followed by your honest assessment of whether it holds.
- **The findings**, sorted fatal, structural, contingent, noted.
- **The resolving checks**, one line each.
- **The verdict** in one line. This is a recommendation to the person deciding, not a decision.

Attack the work, not its author. The author is you.

## Do not

- Do not conclude "the plan is sound" as a finding. That was the prior.
- Do not invent an objection to appear rigorous. An empty red team honestly reported is a useful result.
- Do not import criteria the plan never claimed to meet.
- Do not rewrite the plan here. Report what is wrong; changing it is a separate act with the user in the loop.
- Do not soften a fatal finding because the work is already done.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/premortem`.** Different targets. That attacks the outcome by assuming failure. This attacks the reasoning that produced the plan.
- **`/hypotheses`.** Sequential. Run that first on a diagnosis, then point this at the surviving explanation.
- **`/tradeoff`.** Sequential. Point this at the criteria and the weights, not the winner. The answer was decided there.
- **`/options`.** Different questions. That asks what else exists. This asks what is wrong with the chosen one.
- **`/differential`.** Reinforcing, if the `verify` plugin is installed, and it should pre-empt this. Where the claim under attack is that a change alters nothing, that settles it with evidence, and a settled question does not need attacking.
- **`/mutate`.** The same stance, different object, if the `verify` plugin is installed. This attacks an argument. That attacks a test suite, by introducing faults and finding out whether anything objects.
- **`/hub`.** Reinforcing, if the `hub` plugin is installed, and this is a natural spoke. `hub-verifier` runs one claim adversarially, which is this skill scoped to a single target with a fresh context, and a fresh context is genuinely better at it than a session that produced the plan.
- **`/calibrated`.** Reinforcing, if the `dialect` plugin is installed. A steelmanned objection you judge does not hold is a judgment, so it takes a probability word and a confidence level.

## Before you send

- Was the target stated fairly, in its strongest form, before it was attacked?
- Is the load-bearing assumption named, and checked if it was checkable?
- Was anything checkable actually checked rather than argued about?
- Is the strongest objection steelmanned, or is it a version that was easy to answer?
- Were all seven attack positions worked through?
- Was the repository history searched for a predecessor?
- Is every finding sorted, and are the noted items capped at two?
- Does every fatal and structural finding carry a resolving check with a cost?
- Does the report avoid concluding that the plan is fine as though that were a finding?
- Is the verdict a recommendation rather than a decision?
