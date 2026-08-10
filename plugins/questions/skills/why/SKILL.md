---
name: why
description: Explain the reasoning behind a decision, recommendation, or claim, including when the real reason was weak or arbitrary.
argument-hint: [what to explain]
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit
---

Explain the reasoning behind $ARGUMENTS.

## Resolve what is being asked about

- Points at something from this conversation, such as "this library" or "why did we do it this way": introspect on the decision you actually made, not on what a reasonable agent might have done.
- Points at something in the project: investigate first, then explain.
- No argument: explain the most recent significant decision or claim you made, and name it explicitly so the user can redirect.

## Rules

- Give the reason you actually acted on, not a defensible-sounding reconstruction.
- If the choice was a default, a habit, a convention copied from surrounding code, or effectively arbitrary, say exactly that. An honest "it was the first thing that worked and nothing forced the choice" is a correct answer.
- Never invent a rationale for something you did without one.
- If the reasoning was wrong or no longer holds, say so plainly and state what you would do instead. A `/why` is often a challenge; treat it as one worth taking seriously rather than a prompt to defend the decision.
- Explain only. Do not change anything.

## Ground every claim

Tag each load-bearing claim inline with how it is known, so the user can verify it without taking your word for anything:

- `[session]`. You did it, or were told it, earlier in this conversation. The user can scroll back.
- `[path/to/file.ts:42]`. Recorded in the project. Cite the exact location, never a bare filename.
- `[inferred]`. A reconstruction. Nothing records this, and you are filling a gap.

Rules for tagging:

- A claim that cannot carry one of the three tags does not belong in the answer. Drop it.
- `[inferred]` is the honest tag for the common case of pre-existing code whose rationale was never written down. Use it freely rather than dressing inference up as a citation.
- Do not report a confidence level, score, percentage, or verbal equivalent. Self-assessed confidence is not something the user can check, and attaching it to an inference makes the inference look audited when it is not.
- Hedging words are not a substitute for a tag. "Probably X" with no tag is worse than "X `[inferred]`".

## Output

- **Answer.** One or two sentences: the actual reason, tagged.
- **What drove it.** The concrete factors, each tagged. Omit if it adds nothing to the answer.
- **Alternatives.** What else was on the table and why it lost. Omit if nothing else was genuinely considered, and say so rather than inventing rejected options.
- **Check.** Include only when any part of the answer is `[inferred]`: the one concrete thing the user could look at that would confirm or refute the explanation. Name a file, a command, or a person to ask.

Match the length to the question. A one-line question gets a few lines, not a report.
