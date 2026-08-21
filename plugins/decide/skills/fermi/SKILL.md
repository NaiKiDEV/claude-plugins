---
name: fermi
description: Turn "it depends" into a number with a stated range. Fermi estimation - decompose into factors, bound each one, multiply, and name the factor the answer actually rests on.
argument-hint: [the quantity or duration to estimate]
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit
---

Estimate: $ARGUMENTS

Fermi estimation is the practice named after Enrico Fermi, who was known for producing order-of-magnitude answers to questions nobody had the data for by decomposing them into factors that could each be bounded. The method works because errors in independent factors partly cancel: a product of six estimates each within a factor of two is usually far better than one guess at the answer.

The failure it addresses is the refusal to estimate. Asked how long something will take, how much a query will cost, or whether an approach will hold at scale, the safe answer is "it depends", which is true, unfalsifiable, and useless to anyone who has to plan. The second failure is worse: a single confident number with no decomposition, which cannot be checked, corrected, or partially reused when one input turns out wrong.

An estimate here is a structure, not a number. The structure is what makes it improvable.

## Resolve what is being estimated

- **An argument.** Estimate that.
- **Nothing.** Take the open quantity in the conversation: the duration, the cost, the volume, the load.
- **An ambiguous quantity.** Fix the units and the scope in one line before starting, and be specific. "How long will this take" is three different questions depending on whether it means implementation, elapsed calendar time, or time until it is running in production. Pick one and say which.

## Check before you estimate

An estimate for a quantity you can measure is a wrong answer chosen over a right one.

Count the rows. Time the query. Run the loop. Read the pricing page. Check the metric. `wc -l` the thing. These take a minute and produce a fact, and a fact outranks the best-structured estimate here.

Estimate only what is genuinely unmeasurable now: future volume, work not yet started, load you cannot generate, a system you do not have access to, a cost that depends on how people will behave.

Where part of the quantity is measurable and part is not, measure the measurable part and estimate only the rest. A hybrid is normal and better than either pure form, and the report should make clear which factors were counted and which were guessed.

## 1. Decompose

Break the quantity into factors you multiply or terms you add. Keep going until each factor is something you have a real basis for.

Good decompositions land on factors that are:

- **Countable now.** Number of files, endpoints, tables, call sites. Count them.
- **Bounded by physics or contract.** Network round trips, page size, rate limits, a documented quota.
- **Anchored in something you have seen.** How long the last three changes of this kind took, in this repository.

Three to six factors. Below three, you have not decomposed, you have guessed with extra steps. Above six, the error bars widen faster than the cancellation helps, and the structure stops being checkable.

For a duration, the factors that get dropped and dominate the answer are: the number of distinct places to change, review and its latency, the environments it must pass through, and the fraction of time actually spent on this rather than on other work. That last one is usually between a quarter and a half, and leaving it out is the single most common reason software estimates come in at a third of reality.

## 2. Bound each factor

For each factor give a low and a high, not a point.

Set the bounds so you would be genuinely surprised to be outside them, then widen them, because the well-documented result is that people set them too narrow. If both bounds feel comfortable, they are too tight.

Say where each bound came from, in a few words: counted, measured, documented, from a similar case, or a guess. That tag is what makes the estimate auditable, and it lets someone replace one weak factor without redoing the rest.

Keep the ratio honest. A factor you know within ten percent and one you know within a factor of ten should not be presented in the same style.

## 3. Combine

Multiply the lows for the low end and the highs for the high end, then state a central value.

Two adjustments, both of which matter:

- **The extreme bounds are too extreme.** Every factor simultaneously at its low is very unlikely. Present the outer product as the range, and give a central estimate that is not simply the midpoint of it. For a product of uncertain factors the sensible centre is the product of the central values, and the distribution around it is skewed high, not symmetric.
- **Round hard.** Two significant figures at most, and often one. "About three weeks" and "roughly 40GB" are honest. "23.4 days" claims precision the method cannot produce, and readers will treat the digits as information.

State the answer as a range with a central value, in that order.

## 4. Find the dominant factor

The most useful output is not the number. It is which factor the number is hostage to.

Find the factor whose range contributes most of the spread in the result. Then say two things:

- **What resolving it would do to the answer.** "Pinning down how many call sites there are narrows this from two to six weeks down to three to four."
- **What resolving it would cost.** Usually far less than the deliberation it would replace. Where it is cheap, recommend doing it now rather than accepting the estimate.

This is the step that converts an estimate into an action.

## 5. Sanity check

Two checks before reporting, both quick.

- **Against a known case.** Compare the result to something real: a comparable change in this repository, a known cost line, an observed duration. If the estimate is far off a real precedent, the precedent is usually right and a factor is wrong. Find it.
- **In the other direction.** Rebuild the estimate from the top down and see if it lands in the same order of magnitude. If it does not, say so and give the range that spans both rather than picking the one you like.

## Output

Short and structured.

- **The question**, with units and scope fixed.
- **The factors**, each with low, high, and the source tag. A table earns its place at four or more.
- **The answer**: a range and a central value, rounded hard.
- **The dominant factor**, and the cheapest way to resolve it.
- **What was measured rather than estimated**, if anything was.

Do not bury the number. Do not present a range so wide it carries no information without saying so plainly.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/base-rate`.** The opposing method, and they should be run together on any estimate that matters. This builds the answer up from the parts, which is the inside view. That looks up what happened the last several times, which is the outside view. Where they disagree, **the base rate wins by default**, because building up from parts systematically omits whole categories of work. Use this to explain the gap, not to overrule it.
- **`/calibrated`.** Reinforcing. The estimate is a judgment, so its confidence level reports the quality of the factor sources rather than the width of the range.
- **`/tradeoff`.** Reinforcing. A criterion that needs a number takes an estimate with a stated range rather than a score out of five.
- **`/premortem`.** Different questions. This asks how big. That asks how it fails.

## Before you send

- Was anything estimated that could have been counted, timed, or looked up?
- Are the units and the scope of the question stated?
- Are there three to six factors, and does each have a real basis?
- For a duration, are review, environments, and the fraction of time actually spent on this in the model?
- Does every factor carry a low, a high, and a source tag?
- Were the bounds widened after they first felt right?
- Is the answer rounded to at most two significant figures?
- Is the dominant factor named, with the cost of resolving it?
- Was the result checked against a real precedent?
- Was `/base-rate` considered, and if it disagrees, does the base rate win?
