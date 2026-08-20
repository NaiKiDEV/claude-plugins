---
name: comments
description: Write review feedback as Conventional Comments - every remark carries a label and a blocking decoration, so the author can tell a blocker from a nitpick without reading all of them.
argument-hint: [diff, file, or review to format, or nothing to switch the session into it]
disable-model-invocation: true
allowed-tools: Read Grep Glob Bash
---

Write review feedback as Conventional Comments: $ARGUMENTS

Conventional Comments is a published convention for review remarks. Every comment opens with a label saying what kind of remark it is, and optionally a decoration saying whether it blocks. The format is strict and the content is free.

The problem it addresses is a review of thirty remarks in which a security hole and a preference about variable naming are typographically identical. The author reads them in order, spends their attention evenly, and negotiates the ones that were never worth arguing about. Labels let them triage before they read.

This skill formats review output. It does not decide whether to review, and it does not review by itself unless given a target.

## The format

```
<label> [decoration]: <subject>

[discussion]
```

- **Label.** Lower case, required, from the list below.
- **Decoration.** Optional, in parentheses, from `non-blocking`, `blocking`, `if-minor`.
- **Subject.** One sentence saying what the comment is. Not a paragraph.
- **Discussion.** Optional. Reasoning, context, a suggested diff. Blank line above it.

Be strict about the format and loose about the content. The format is what makes a review scannable, and it costs nothing to hold.

## The labels

| Label | Means | Usually |
| --- | --- | --- |
| **issue** | Something is wrong here | Blocking if it affects correctness, security, or data |
| **suggestion** | A specific change that would improve this | Non-blocking unless paired with an issue |
| **nitpick** | A trivial preference | Always non-blocking, by definition |
| **question** | You do not understand something and need an answer | Blocking when the answer changes whether the rest is right |
| **thought** | An idea worth recording that needs no action now | Never blocking |
| **todo** | A small necessary change that is not in dispute | Usually blocking, always trivial |
| **praise** | Something done well | Never blocking |
| **chore** | A process task before merge: changelog, ticket link, version bump | Blocking if the process requires it |
| **note** | Something the author should be aware of, with no action attached | Never blocking |

Rules for the labels:

- **Label the comment for what it actually is.** A blocking defect labelled `thought` wastes the author's time and yours. A preference labelled `issue` costs you the author's trust in every later `issue`.
- **`issue` should come with a `suggestion`**, or with a description of what correct would look like. A defect report with no direction leaves the author to guess.
- **`nitpick` is a promise.** It says: I am telling you because I noticed, and I do not want it changed on my account. Never argue a nitpick.
- **`question` is a real question.** Do not use it to make a criticism sound softer. "question: is there a reason this ignores the error?" when you mean "issue: this ignores the error" is passive aggression in a costume, and the author has to answer it before they can fix anything.
- **`praise` must be substantive.** Name the specific thing and why it is good. A generic compliment on every third file reads as filler and devalues the real ones.
- **`todo` is for the uncontroversial.** A missing import, a stale comment, a wrong copyright year. If it might be argued about, it is a `suggestion` or an `issue`.

## The decorations

- **`(blocking)`.** Merge should not happen until this is resolved. Reserve it for correctness, security, data loss, a broken contract, or a violated policy. Use it deliberately, and be able to defend each one.
- **`(non-blocking)`.** Say it out loud. It is the most useful decoration in the set, because it tells the author they may disagree and merge anyway, which is what most review comments actually mean and almost none of them say.
- **`(if-minor)`.** Address it if the fix is small, otherwise leave it or open a ticket. Good for a `suggestion` whose value depends on its cost.

Default to non-blocking. A reviewer who blocks by default has no way left to say that something matters.

## Resolve what was asked

- **No argument.** Write all review feedback from now on in this format, until the user tells you to stop. Confirm in one line.
- **"off", "stop", or "normal".** Leave the mode. Confirm in one line.
- **A target**, such as `comments review this diff` or a file path. Review it and format the findings this way.
- **An existing review**, yours or somebody else's, given as text. Relabel it. Do not add findings that were not there, and say in one line if any comment's real severity did not match its original wording.

## Anchoring

Every comment names where it applies.

- `file:line` for a specific line, `file:line-line` for a range, `file` for a whole-file remark.
- Where the comment applies across several places, anchor the primary one and list the rest.
- Never report a finding in code you did not read. A comment on a line you inferred from a diff header is a guess presented as a review.
- Quote the minimum needed to make the comment make sense, and do not paste the whole function back to the author who wrote it.

## Volume

A long review buries its own findings, and the format makes this worse rather than better by making every remark look equally deliberate.

- Order by severity: every `blocking` first, then the rest.
- Cap the nitpicks. Three is generous. Beyond that, collapse them into one comment listing the lines, or drop them.
- Never comment on what a formatter, linter, or type checker owns. If the project runs one, its output is not review feedback. If it does not run one, that is a single `suggestion` about tooling, not thirty comments.
- Do not repeat one finding at each of its occurrences. One comment, with the other locations listed.
- Do not review code the change did not touch, unless the change made it wrong.
- A clean review is a complete review. `praise` on the substantive thing plus a line saying nothing is blocking beats manufactured findings.

## Suggested changes

- Give the smallest diff that fixes the thing. Do not rewrite the author's function in your own style and present it as the fix.
- Where a suggested change is one of several valid approaches, say so and say why you prefer yours. The author chose theirs for a reason you may not have.
- Do not suggest a change you have not thought through to compilation. A suggestion that does not work costs the author more than the original defect.

## Tone

The format handles most of what tone was doing. A `nitpick (non-blocking)` needs no softening, because the label already says it does not matter much.

- Comment on the code, not the author. "This drops the error" rather than "you dropped the error".
- Do not hedge a real defect into vagueness. `issue (blocking)` followed by a plain statement of what is wrong is the kindest thing available, because it is unambiguous and quick to fix.
- Do not stack qualifiers. "I might be wrong, but perhaps consider maybe" makes the author work out how much you meant it.
- Where you are genuinely unsure whether something is wrong, that is a `question`, and the uncertainty goes in the subject line.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/normative`.** Reinforcing, and the two must agree. A `(blocking)` decoration and a `MUST` are the same call. Keep them consistent: `issue (blocking)` carries `MUST`, `suggestion (non-blocking)` carries `SHOULD` or `MAY`. Do not mark something blocking and then describe it as a preference.
- **`/calibrated`.** Reinforcing. Where a finding rests on inference rather than on code you read, say so in the subject: "issue (blocking): very likely a race here, moderate confidence" is honest, and a bare assertion is not.
- **`/bluf`.** No conflict. The subject line is the bottom line of the comment, and the discussion is the support.
- **`/ste`** and **`/plain`.** No conflict. Either shapes the subject line and the discussion.
- **`/ubiquitous`.** No conflict. Use the project's own terms when naming what the code does.

## Output

- One comment for each finding, blocking first.
- Anchor, then label, then subject, then discussion. Put the anchor on its own line above the comment when the review is delivered as text rather than posted inline.
- End with a one-line summary: the count by label, and whether anything blocks.
- Do not add a verdict, a score, or a grade unless asked.
- Do not post anything. Formatting a review is not submitting one.

## Before you send

- Does every comment carry a label, and does the label match what the comment really is?
- Is every `(blocking)` genuinely a blocker you would defend?
- Is any `question` a criticism in disguise?
- Is any finding anchored to code that was not read?
- Are there more than three nitpicks, or anything a linter would have caught?
- Is one finding repeated across several locations?
- If nothing is wrong, does the review say so plainly?
