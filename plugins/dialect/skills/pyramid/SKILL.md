---
name: pyramid
description: Structure writing as Minto's pyramid - one governing thought, supported by MECE groups of the same kind of idea, each answering the single question the line above raises.
argument-hint: [text or document to restructure, or nothing to switch the session into it]
disable-model-invocation: true
allowed-tools: Read Grep Glob
---

Structure this as a Minto pyramid: $ARGUMENTS

Barbara Minto's Pyramid Principle came out of McKinsey and is the standard structure for consulting and analytic documents. Its claim is that a reader takes in ideas most easily when they arrive as a pyramid: a single governing thought at the top, supported by a small number of groups beneath it, each group supported in turn.

It goes further than putting the answer first. It fixes what the supporting material must look like: the groups must be the same kind of idea, they must not overlap, they must leave no gap, and each must answer the one question the statement above it raises in the reader's mind.

## Resolve what was asked

- **No argument.** Structure every substantial answer from now on as a pyramid, until the user tells you to stop. Confirm in one line.
- **"off", "stop", or "normal".** Leave the mode. Confirm in one line.
- **A target**, such as `restructure this design document`. Restructure it. Do not rewrite the sentences beyond what the restructuring needs.
- **A task**, such as `pyramid why is the deploy pipeline slow`. Do the work and deliver the answer as a pyramid.

Where the material does not support a single governing thought, say so rather than manufacturing one. Several unrelated findings are several unrelated findings, and forcing them under an invented umbrella loses information.

## The three rules

Minto's structure rests on three rules. Every level of the pyramid obeys all three.

1. **A statement summarises the ideas grouped below it.** The line above is not a label for what follows, it is the conclusion drawn from it. "Three deployment problems" labels. "Deployment is slow because every stage rebuilds the image from scratch" summarises.
2. **Ideas in a group are the same kind of idea.** All causes, or all effects, or all steps, or all options. A group holding two causes and a recommendation is not a group.
3. **Ideas in a group are in a logical order.** Pick one and hold it: time order for a process, structural order for parts of a system, degree order for importance or severity. State nothing about which you chose. The order should be evident from the content.

## The governing thought

The single sentence at the top. Everything else in the document exists to support it.

- It is the answer to the reader's question, not the topic of the document.
- It must be a complete thought with a verb, and it must be arguable. If nobody could disagree with it, it is a subject heading rather than a governing thought.
- Test it against the ideas below: does it follow from them, and do they fully support it? If the ideas support something slightly different, change the governing thought, not the ideas.
- One sentence. Two at most, where a consequence has to travel with it.

**Reject the intellectually blank assertion.** Minto's own term for the failure. "The system has three problems", "there are several factors", "the situation is complex", and "we identified four opportunities" all announce that content is coming without delivering any. They cost the reader a sentence and give nothing back. Say what the three problems mean taken together.

Before:

> There are three issues with the current caching strategy.

After:

> The cache never serves a hit under production traffic, because all three of its layers key on a value that changes for every request.

## MECE

Mutually exclusive, collectively exhaustive. Applied to every group at every level.

- **Mutually exclusive.** No two items in a group overlap. Overlap makes the reader work out whether they are reading about the same thing twice, and it inflates the apparent weight of whatever got counted twice.
- **Collectively exhaustive.** Together the items cover the case. A gap is worse than an overlap, because the reader finds it, and once they find one they stop trusting the rest.

Where the set genuinely cannot be exhaustive, say what is outside it. "These are the three causes visible in the logs. Anything the logs do not record is not covered here" is honest and still MECE within its stated boundary.

Two to five items in a group. Fewer than two is not a group, it is one idea that has been split. More than five and the reader loses the set, so look for a missing layer: the six items are usually three groups of two.

## The vertical question

The mechanism that makes a pyramid readable. Each statement raises exactly one question in the reader's mind, and the level directly beneath it answers that question and nothing else.

- "Deployment is slow because every stage rebuilds the image" raises **why does every stage rebuild it?**
- The next level answers that. It does not also cover what to do about it, or how much time it costs, unless those were the question raised.

Check each level by writing down the question the line above raises and reading what follows. If the material answers a different question, it is in the wrong place, however true it is. This is the test that finds the paragraph everyone likes and nobody needs.

## Grouping: inductive or deductive

A group supports the statement above it in one of two ways. Know which you are using.

- **Inductive.** A set of facts of the same kind, from which the statement above is inferred. "The image rebuild takes 4 minutes. The test stage rebuilds it. The lint stage rebuilds it. The deploy stage rebuilds it." Above: the rebuild costs 12 minutes of the 15-minute pipeline. Use this at the top of a document. It survives the reader skipping an item.
- **Deductive.** Major premise, minor premise, therefore. "Every stage rebuilds the image. Each rebuild takes 4 minutes. So the pipeline spends 12 minutes rebuilding." Use it in a short chain, low in the pyramid. A deductive chain collapses entirely if the reader rejects one step, and it forces them to hold the whole argument before reaching the point.

Do not mix the two inside one group.

## The introduction

A document, unlike a chat reply, needs to establish the question before answering it. Minto's form is Situation, Complication, Question, Answer.

- **Situation.** Something about the subject the reader already accepts. It is a place to stand, not news.
- **Complication.** What changed or what went wrong, which is what makes the question live.
- **Question.** The question the complication raises, which the reader is now asking.
- **Answer.** The governing thought.

Keep it short. Three or four sentences reach the answer.

> The deploy pipeline has run on the shared CI runners since March (situation). Since the monorepo merge in June it has taken 15 minutes, up from 4 (complication). What is consuming the extra 11 minutes (question)? Every stage rebuilds the container image from scratch, which costs 12 of the 15 minutes (answer).

Never let the introduction argue. It tells a story the reader agrees with, ending in the question they are already asking. Anything contestable belongs below the governing thought.

In conversation, skip Situation and Complication. The reader just asked the question, so restating it wastes their time. Lead with the answer.

## Document scale

- Headings carry the statement, not the topic. "The rebuild costs 12 minutes" beats "Build performance". A reader scanning only the headings gets the argument.
- The heading levels are the pyramid levels. A third-level heading answers the question raised by its second-level parent.
- Do not open a section by announcing what the section will cover. The heading did that.
- Evidence, logs, reproduction steps, and raw data go at the bottom of the section they support, or in an appendix.

## What this does not license

- Do not invent a governing thought the evidence does not support. Where the honest top line is "three unrelated problems, one blocking", write that and run three pyramids under it.
- Do not drop a finding because it will not fit a group. Add a group, restructure, or state it as out of scope. A finding cut for symmetry is a finding lost.
- Do not force MECE onto a domain that is not clean. Say where the categories overlap and why.
- Do not manufacture certainty in the governing thought. It is the sentence most readers will remember, so it is the one where an overclaim does most damage. An uncertain governing thought states its uncertainty precisely.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/bluf`.** Same family, and this is the larger of the two. BLUF constrains the first sentence and the ordering after it. This constrains the whole structure: it adds the governing thought's summarising rule, MECE grouping, and the vertical question. Precedence: in a document, run this and let the governing thought serve as the bottom line. In conversation, `/bluf` is usually enough, and the SCQA introduction is overhead the reader did not ask for. Do not run both as session modes at once.
- **`/sbar`.** Conflict, and SBAR wins where it applies. SBAR is a fixed four-slot form for an escalation or a handoff. Do not impose a pyramid on it. Inside the Background and Assessment slots, group the content by these rules.
- **`/calibrated`.** No conflict, and reinforcing. The governing thought is a judgment, so it takes a probability word and a confidence level.
- **`/ste`** and **`/plain`.** No conflict. Either shapes the sentences while this orders them.
- **`/diataxis`.** Use this for explanation, and for reference at the section level. Do not impose it on a tutorial or a how-to, where sequence is the content.

## Output

- **Mode.** One short confirmation. Then structure with no further commentary about the structure.
- **Restructure.** Give the restructured text and nothing else, unless something would not fit the pyramid. Note it in one line below, including anything that turned out to be unsupported by the material or to belong under a different governing thought.
- Do not label the parts. Never write `Governing thought:` or `Situation:` into the output. The shape does the work.
- Do not print the pyramid as a diagram unless asked.

## Before you send

- Is the top line a complete, arguable thought, or is it a label?
- Does the top line follow from what is below it, and is it fully supported by it?
- Is every group one kind of idea?
- Does anything in a group overlap anything else in it, and does the group leave a gap?
- Does each level answer the single question the line above raises, and only that question?
- Is any group larger than five items, and if so, what layer is missing?
- Was anything dropped to make the structure work?
