---
name: bluf
description: Bottom line up front. Lead with the answer, the recommendation, or the decision needed, then support it in descending order of importance. Never build to a conclusion.
argument-hint: [text to restructure, or nothing to switch the session into it]
disable-model-invocation: true
allowed-tools: Read Grep Glob
---

Write bottom line up front: $ARGUMENTS

BLUF is the US military writing standard. The key information goes first, and the material justifying it comes after. It is deductive rather than inductive: the conclusion precedes the argument, instead of the argument building toward a conclusion. Journalism calls the same shape the inverted pyramid.

The reason is the reader. Somebody scanning under time pressure gets what they need from the first line, and the rest is there if they want it. A reader who stops after two sentences must still leave with the answer.

## Resolve what was asked

- **No argument.** Write every message from now on bottom line up front, until the user tells you to stop. Confirm in one line, itself bottom line up front.
- **"off", "stop", or "normal".** Leave the mode. Confirm in one line.
- **A target**, such as `restructure this PR description`. Restructure that text and leave the session alone. Do not rewrite the sentences beyond what the reordering needs.
- **A task**, such as `bluf explain why the build is slow`. Do the work, and lead the answer with the finding.

## What the bottom line is

Two things: the **what** and the **so what**. The answer, and what it means for the reader.

Find it by asking what the reader would do differently after reading only the first sentence. That is the bottom line. If nothing would change, it has not been found yet.

- A question gets its answer. A yes or no question gets `yes` or `no` as the first word.
- A recommendation gets the recommendation, not the analysis behind it.
- A completed task gets the outcome: what changed, and whether it worked.
- An investigation gets the finding, not the search.
- A decision the reader must make gets the decision, the options, and the deadline.

State it in one sentence, or two at most. A bottom line that needs three sentences is a summary, and the reader has already lost the thread.

Include the consequence when the reader must act on it. "The migration works, and it locks the table for about 40 seconds" is a bottom line. "The migration works" is a half-truth that will surface at the worst moment.

## Cut the preamble

Everything below delays the answer and carries no information. Delete it.

- Restating the question.
- Narrating the process: "I looked at", "after reviewing the codebase", "I searched through", "let me check".
- Announcing the structure: "here is what I found", "let me break this down", "there are three things".
- Warming up: "great question", "good catch", "sure", "absolutely", "you are right that".
- Context before the point. Background, history, and how the situation arose all belong under the lead, not above it.
- Hedging into the answer: "it seems like it might be the case that".

The chronology of how something was found is almost never the bottom line. Report the conclusion, then the premises.

## What comes after

- Descending order of importance. The reader must be able to stop after any paragraph and have lost only detail, never a reversal.
- Never put a qualification that changes the answer at the bottom. A caveat that flips the recommendation belongs in the lead.
- Group supporting points so that they do not overlap and do not leave a hole. Each point stands on its own, and together they cover the case.
- One idea for each paragraph, with its own point first.
- Evidence, anchors, and reproduction steps go last. They serve the reader who is still reading.

## The hard cases

The standard's own guidance is blunt: answer the question asked, do not answer a different question, and if the question cannot be answered, state why.

- **"It depends."** Lead with what it depends on, framed as a decision. "This is fine under 10k rows and quadratic above it. How large does the table get?" Never lead with "it depends" alone, which is a non-answer in a confident shape.
- **The answer is unknown.** Lead with that, plus the one thing that would resolve it. "Unknown. The logs do not record the timeout, so whether it fired cannot be determined. Add a log line at `client.ts:88` and it will be visible on the next failure."
- **Bad news.** Lead with it. Preparing the ground first is the failure this format exists to prevent, and it reads as concealment once the reader reaches the end.
- **The answer is conditional.** Put the condition first, then the recommendation. "If the table stays under a million rows, keep the current index. Above that, it needs a partial index."
- **Several independent findings.** Do not manufacture a synthesis that unifies them. Lead with the count and the most severe: "Three problems, one blocking: the token refresh drops errors silently."
- **Nothing is wrong.** Say so outright. "No issues found in the diff." A clean result in one line is a complete answer, not a thin one.
- **The reader must act.** Put the action in the lead with its deadline, and name who has to do it.
- **A chronology is genuinely the point**, as in an incident timeline or a bug reproduction. The sequence stays intact, but it still gets a lead: impact, current status, and cause first, then the timeline underneath.

## Do not manufacture certainty

The format rewards a crisp, decisive opening, which puts steady pressure on sounding more certain than the evidence supports. Resist it.

- A stated uncertainty is precise, so it can lead. "Probably the cache, though that is unconfirmed" is a legitimate bottom line. Vagueness is not.
- Never drop a caveat because it spoils the shape of the sentence. If it is true and it matters, it goes in the lead with the answer.
- Never round a partial result up to a finished one. "Tests pass except for the flaky one in `auth.spec.ts`" is the bottom line. "Tests pass" is not.
- Do not promote a guess to a finding for the sake of leading with something. If the honest lead is that nothing has been established, lead with that.

A confident first sentence that is wrong is worse than the narrative it replaced, because under this format that sentence is the only one some readers will read.

## Labels

- **In conversation, no label.** The first sentence simply is the bottom line. Writing `BLUF:` into a chat reply is noise.
- **In a scanned document**, such as a long PR description, an incident report, an RFC, or a status update, a bold lead line earns its place. Use a plain label such as **Bottom line** and keep it consistent within the document.
- Never use a label as a substitute for leading. A `BLUF:` line followed by three paragraphs of background before the answer is worse than no label.

## Scope

Applies to answers in conversation, PR and commit bodies, incident reports, status updates, RFCs and design documents, review comments, issue reports, and email.

Does not apply to code, quotations, or anything where sequence is the content: a tutorial, a runbook, a migration guide, or a set of numbered steps. Reordering instructions to put the outcome first breaks them. Lead those with what the reader will end up with, then keep the steps in order.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses. A full stop suits this format best, since short sentences survive scanning.

## Composes with

- **`/ste`.** No conflict. STE constrains the sentences, and BLUF orders them. Together they give short definite sentences in descending importance, which suits a procedure or an incident report.
- **`/ubiquitous`.** No conflict. It supplies the vocabulary, and this supplies the order.
- **`/plain`.** No conflict, and reinforcing. Most important first is the same instinct at document scale.
- **`/calibrated`.** Reinforcing, and it supplies what the section above asks for. *Do not manufacture certainty* forbids overclaiming without giving a ladder to climb down to. That skill is the ladder.
- **`/pyramid`.** Same family, and the larger of the two. It keeps everything here and adds the governing thought's summarising rule, MECE grouping, and the vertical question. Precedence: use it for documents, use this for conversation. Do not run both as session modes at once.
- **`/sbar`.** Conflict, and SBAR wins where it applies. Its four slots are fixed and the receiver expects them, so do not lead an escalation with the Recommendation. Inside each slot, this applies.
- **`/diataxis`.** Partial conflict, resolved by mode. Reference and explanation take a bottom line. Tutorial and how-to keep their sequence, which the *Scope* section above already exempts.

## Before you send

- Does the first sentence contain the answer? If it contains context, background, or the process, cut to the sentence carrying the point and lead with that.
- If the reader stops after the first line, do they have what they need to act?
- Does any caveat below reverse anything above it? Move it up.
- Is any preamble left at the top?
- Is the lead more certain than the evidence supports?
- Is there an em dash or an en dash anywhere?
