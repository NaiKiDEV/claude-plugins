---
name: base-rate
description: Answer from what happened the last several times instead of from the details of this time. Reference class forecasting - build the class, read its distribution, then adjust for this case only where you can justify it.
argument-hint: [the estimate, prediction, or judgment to check against history]
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit
---

Take the outside view on: $ARGUMENTS

Reference class forecasting comes out of Kahneman and Tversky's work on the planning fallacy and was turned into a working method by Bent Flyvbjerg for infrastructure projects, where it is now required by the UK Treasury's Green Book. The finding behind it is stable and uncomfortable: forecasts built from the specifics of a case are reliably optimistic, and forecasts built from the outcomes of similar cases are reliably better, even when the forecaster knows far less about the specific case.

The inside view reasons from this case: its parts, its plan, its particular circumstances. The outside view ignores almost all of that and asks how a class of similar cases turned out. The inside view feels more informed and is usually wrong, because it can only model the work you have thought of, and what actually consumes the time is the work you have not.

For an agent the pull toward the inside view is close to total. Detail is what is available, the specifics are in the context window, and the history is not. This skill goes and gets the history.

## Resolve what is being checked

- **An argument.** Take the outside view on that.
- **Nothing.** Take the open estimate or prediction in the conversation: how long, how risky, how likely to work.
- **Nothing open.** Say there is nothing to check and stop.

State the inside-view answer first, in one line, if one has already been given. It is the thing being tested, and it must be on the record before the base rate arrives so it cannot be quietly adjusted afterwards.

## 1. Build the reference class

This is the whole method, and it is mostly a search rather than a judgment.

Define the class by the **structural** features of the case, not its content. What matters is what makes a case like this one in the way that drives outcomes: its size, its type of change, who does it, what it touches. Not its subject matter.

Then go and find the members. The history is usually right here:

- **`git log`** for changes of this kind. Migrations, dependency bumps, framework upgrades, extractions, new services. Look at how long they actually took between first commit and merge, and at how many follow-up fixes landed after.
- **Reverted commits and hotfixes** following changes of this class. This is the cheapest available failure rate.
- **Closed pull requests** for how long review actually took, and how many rounds.
- **The issue tracker** for what was reopened.
- **The repository itself** for the previous attempts. A directory named `v2`, a file with `old` in the name, and a `TODO` describing this exact plan are all class members.

Five to ten members is a usable class. Three is thin and must be reported as thin. One is an anecdote, and it should be presented as one.

Two errors kill a class, and they pull in opposite directions:

- **Too narrow.** "Migrations of this exact table by this exact person" has one member and no signal. Widen until you have members.
- **Too broad.** "All changes in this repository" is a class whose distribution tells you nothing about this. Narrow until membership is structurally meaningful.

Where the class cannot be built from this repository, say so and use the widest honest source you have: a documented industry rate, published research, or general experience. Label it clearly as external, because an external base rate is much weaker than one drawn from this project's own history.

## 2. Read the distribution

Report what the class actually did, not what it usually does.

- **The spread**, not just the middle. The range and roughly where the middle sits.
- **The tail.** How bad was the worst one, and how often does something like that happen? For durations the tail is the whole story, since the distribution is skewed long and the mean sits well above the median.
- **The failure rate.** What fraction did not finish, got reverted, or shipped and then had to be redone.

Give counts and be honest about how few there are. "Four of the last six took between two and five weeks, one took eleven, one was abandoned" is a far more useful sentence than a single average, and it takes the same space.

## 3. Adjust, and justify every adjustment

Now bring the inside view back in, but subject to a rule: **every adjustment away from the base rate needs a reason that would not be true of a typical class member.**

"This one is simpler" is not a reason. Every case felt simpler than typical to the person planning it, which is exactly why the base rate exists. The reason must be structural and specific:

- The class members all included a data backfill and this one does not.
- Three of the six were blocked on a review that no longer applies.
- This is the fourth time doing this, and the previous two were faster than the first two.

Cap the adjustment. Moving more than about thirty percent off a base rate built from real class members means one of two things is true, and you should say which: the class is wrong, or the inside view has taken over. Rebuild the class or accept the number.

Adjust toward the tail as freely as you like. Optimistic adjustment is the failure mode; pessimistic adjustment almost never is.

## 4. Report the disagreement

Where the base rate and the inside-view estimate disagree, this is the finding, and it must not be smoothed over.

State both, state the gap, and state which you are going with. **The default is the base rate.** Going with the inside view requires naming the specific structural difference that justifies it, and putting it on the record so it can be checked afterwards.

Where the gap is large, say what it implies concretely: the estimate is not slightly wrong, it is wrong by a factor, and plans built on it will not survive.

## Output

Short. This skill is a lookup, not an analysis.

- **The inside-view answer**, one line, on the record.
- **The class**: how it was defined, where the members came from, how many there are.
- **The distribution**: spread, tail, and failure rate, with counts.
- **The adjustments**, each with the structural reason that justifies it.
- **The answer**, and the gap from the inside view where there is one.

Where the class is thin, external, or absent, say so in the first line of the output rather than in a caveat at the end. A base rate presented with more authority than its evidence supports is worse than none.

## Do not

- Do not invent a base rate. If the history is not there, say the history is not there.
- Do not report an average with no spread. The spread is the information.
- Do not let the class be built from cases that succeeded, which is how the failures leave the record.
- Do not adjust for optimism you cannot name a structural reason for.
- Do not quietly revise the inside-view estimate before comparing it.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/fermi`.** The opposing method, and they belong together. That builds up from the parts, which is the inside view. This looks up the class. Where they disagree, **this wins by default**, and that skill's job becomes explaining the gap rather than defending its total.
- **`/hypotheses`.** Reinforcing. Where two explanations tie on evidence, how often each has actually been the cause is a legitimate tiebreak and is stated as one.
- **`/premortem`.** Reinforcing. The class's failures are the causes, already observed rather than imagined, which makes them the strongest entries on the list.
- **`/quit`.** Reinforcing. How long class members ran before being abandoned, and how many were rescued after passing this point, is the evidence that decides.
- **`/calibrated`.** Reinforcing, if the `dialect` plugin is installed. A base rate drawn from real class members supports a higher confidence level than an estimate, and the count is what justifies it.
- **`/who` and `/when`.** Reinforcing, if the `questions` plugin is installed. Both dig into the same history this skill needs.

## Before you send

- Is the inside-view answer stated first and on the record?
- Was the class defined by structural features rather than by subject matter?
- Were the members actually looked up in `git log`, the pull requests, or the tracker, rather than recalled?
- Are there enough members, and is a thin class reported as thin in the first line?
- Is an external base rate labelled as external?
- Is the spread reported rather than just an average?
- Is the tail reported, and the failure rate?
- Does every adjustment name a structural reason that would not apply to a typical member?
- Is the total adjustment within about thirty percent, or is the reason for exceeding it stated?
- Is the gap from the inside view stated plainly, with a reason if the base rate is being overruled?
