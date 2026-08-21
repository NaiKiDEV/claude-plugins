---
name: hypotheses
description: Test every explanation at once instead of confirming the first one. Heuer's Analysis of Competing Hypotheses - a matrix scored by diagnosticity, where evidence refutes rather than supports.
argument-hint: [the symptom, failure, or question with more than one explanation]
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit
---

Run competing hypotheses on: $ARGUMENTS

Analysis of Competing Hypotheses is Richards Heuer's method from *Psychology of Intelligence Analysis*, written for analysts who kept being wrong in the same way: they formed a view early, then read everything afterwards as support for it.

The failure it addresses is satisficing. You see a symptom, the first plausible cause arrives within seconds, and every subsequent file you open is read as confirmation. The alternative you never articulated cannot be eliminated, so it stays alive and unexamined until it turns out to be the answer three hours later.

ACH inverts the operation. Hypotheses are listed first and evidence is applied to all of them simultaneously. The question asked of each piece of evidence is not "which hypothesis does this support" but "which hypotheses does this rule out". A hypothesis is not selected. It is the last one standing.

## Resolve what is being analysed

- **An argument.** Analyse that.
- **Nothing.** Take the open question in the conversation: the failure being debugged, the behaviour nobody can explain, the claim just made. Name it in one line before starting, so a wrong reading is caught now rather than after the matrix.
- **Nothing open.** Say there is nothing to analyse and stop. Do not manufacture a question.

## Check before you analyse

A matrix built for a question one command would settle is ceremony. It costs more than the answer and it lends a decided look to something that was never in doubt.

Before building anything, ask whether the question is checkable here, now, at low cost. Read the file, run the test, grep for the caller, check the log. If it is checkable, check it and report the fact.

Use this skill when the checks are expensive, slow, destructive, or unavailable: an intermittent failure you cannot reproduce on demand, a production symptom with no local repro, a design question whose answer only shows up under load, an incident whose evidence is already fixed and cannot be added to.

## 1. List the hypotheses

Generate the full set before touching any evidence. Aim for three to six.

- Include the one you already believe, stated plainly rather than favourably.
- Include at least one you consider unlikely. The method's value is concentrated there.
- Include "the reported symptom is not what is actually happening" whenever the symptom comes from a person rather than an instrument. Misreported symptoms are common and invisible to a matrix that omits them.
- Include the boring causes. Configuration, environment, version drift, clock skew, a stale cache, the change nobody mentioned.
- Make them mutually exclusive where you can. Where two can both be true, say so, because evidence against one will not count against the other.

State each as a specific mechanism, not a category. "Race condition" is a category. "Two workers pick up the same job because the claim is not atomic" is a mechanism, and a mechanism makes predictions a category cannot.

## 2. List the evidence

Collect every relevant observation before scoring. Include what you know as well as what you looked up.

Each item carries an anchor: a `file:line`, a command and its output, a log line, a timestamp, a metric. An item you cannot anchor is an assumption, and it goes in the list marked as one.

Include absences explicitly. "No error appears in the log at the time of the failure" is evidence, often the strongest kind, and a list that only holds positive observations will not contain it.

## 3. Score the matrix

For each hypothesis, ask of each item: **if this hypothesis were true, would I expect to see this?**

| Mark | Meaning |
| --- | --- |
| `--` | Strongly inconsistent. The hypothesis predicts this could not happen. |
| `-` | Inconsistent. Unexpected under this hypothesis, though not impossible. |
| `o` | Neutral. The hypothesis makes no prediction either way. |
| `+` | Consistent. Expected under this hypothesis. |

There is no `++`. Consistency is deliberately capped, because the whole point is that supporting evidence is weak evidence. Ten `+` marks do not establish a hypothesis. One `--` can kill it.

Score each item against every hypothesis before moving to the next item. Working across the rows keeps a single hypothesis from setting the frame for how each new item is read.

## 4. Weigh by diagnosticity

An item consistent with every hypothesis has told you nothing, however dramatic it looks. Diagnosticity is the discriminating power of an item, and it is the only property that matters.

- Cross out items scored `o` or `+` across the whole row. They are consistent with everything and they carry no weight. Keep them visible so it is clear they were considered and discounted.
- The items that separate hypotheses are the ones with a spread of marks. These are the ones to trust, to double-check, and to report.
- Where the strongest item is also the least reliable, say so. Diagnostic and confirmed are different properties.

## 5. Eliminate

Work by refutation. The surviving hypothesis is the one with the fewest and weakest inconsistencies, not the one with the most support.

- Discard hypotheses carrying an unexplained `--`.
- Where a `--` can be explained away, write down the explanation as an assumption. Each one is load the hypothesis now carries. A hypothesis that needs three of these has been rescued rather than supported.
- Where the evidence does not separate two hypotheses, they stay tied. Do not break a tie with a preference. Name the observation that would break it instead.

## 6. Name the discriminating test

The output most worth having is not the conclusion. It is the cheapest next observation that would change it.

For the leading hypothesis, state the one check that would refute it, and what it costs. For any hypothesis still tied with it, state the check that separates them. Prefer a check that can run now.

## Output

State the question, then:

- **The matrix.** Hypotheses as columns, evidence as rows, marks in the cells. Cross out the rows with no diagnostic value. Use `/matrix` or `/table` if that plugin is installed, otherwise a plain markdown table.
- **The finding.** The surviving hypothesis, what killed each of the others, and any assumption a survivor needed to stay alive.
- **The ties.** Every hypothesis the evidence did not separate, named rather than dropped.
- **The next check.** One line: the test, what each outcome means, what it costs.

Keep the prose under the matrix short. The matrix carries the argument.

## Do not

- Do not invent evidence to fill a cell. `o` for unknown is honest and a fabricated `+` is not.
- Do not drop a hypothesis because it is embarrassing, out of scope, or someone else's area.
- Do not present the leading hypothesis alone. A reader who hears one explanation stops looking, which is exactly the failure this skill exists to prevent.
- Do not carry the matrix forward as settled once the discriminating test has run. Rescore and say what moved.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/premortem`.** Different times. This explains something that already happened. That anticipates something that has not.
- **`/calibrated`.** Reinforcing, if the `dialect` plugin is installed. The surviving hypothesis is a judgment, so state it with a probability word and a confidence level, and give the runners-up their own.
- **`/redteam`.** Sequential. Run this first, then point that at the surviving hypothesis to find the reading of the evidence you settled into.
- **`/base-rate`.** Reinforcing. Where two hypotheses tie on evidence, how often each has been the cause historically is a legitimate tiebreak, and it is stated as one rather than smuggled in as judgment.
- **`/repro`.** Sequential, in both directions, if the `verify` plugin is installed. Where the failure can be reduced, reduce it instead of scoring evidence, since this skill is for symptoms with no local repro. Where it cannot be reduced yet, reduction is frequently the cheapest observation this closes on, and everything it removes eliminates hypotheses wholesale.
- **`/bisect`.** Sequential, if the `verify` plugin is installed, and it is the discriminating observation whenever history is available. Bisection separates surviving hypotheses outright, which is cheaper than finding more evidence to score against them.
- **`/hub`.** If the `hub` plugin is installed, the discriminating test is a well-formed spoke brief: one claim, one check, a cold-start reader.

## Before you send

- Did the hypotheses get listed before the evidence was scored?
- Is the hypothesis you arrived with in the list, stated plainly?
- Is there at least one hypothesis you think is unlikely?
- Is every hypothesis a mechanism rather than a category?
- Is every evidence item anchored, or marked as an assumption?
- Are absences in the list, not just observations?
- Was every item scored against every hypothesis?
- Are the non-diagnostic rows crossed out rather than counted?
- Does the conclusion rest on refutation rather than on accumulated `+` marks?
- Is every surviving tie named?
- Is there one concrete next check with a cost attached?
