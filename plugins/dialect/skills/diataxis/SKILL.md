---
name: diataxis
description: Write in exactly one of Diataxis's four documentation modes - tutorial, how-to, reference, explanation - and refuse the content that belongs to the other three.
argument-hint: [mode, a target to write or audit, or nothing to classify each request as it arrives]
disable-model-invocation: true
allowed-tools: Read Grep Glob
---

Write to Diataxis: $ARGUMENTS

Diataxis is a documentation framework by Daniele Procida. It holds that there are four kinds of documentation, that they serve four different needs, and that mixing them damages all four. A tutorial that stops to explain a design decision has lost the learner. A reference page carrying an opinion cannot be trusted as a description.

This is the one dialect that deletes rather than rewrites. The other rule sets make a paragraph shorter or clearer. This one asks whether the paragraph belongs in this document at all, and the answer is often no however well it is written.

## The four modes

| Mode | Serves | Oriented to | The reader is |
| --- | --- | --- | --- |
| **Tutorial** | Learning | Action | Studying. They do not yet know what they need. |
| **How-to** | A goal | Action | Working. They know what they want and are competent. |
| **Reference** | Information | Cognition | Working. They need a fact and will leave once they have it. |
| **Explanation** | Understanding | Cognition | Studying. They want to know why it is like this. |

Two questions place any piece of content. Does it serve action or cognition? Does it serve study or work? Tutorial is action plus study, how-to is action plus work, reference is cognition plus work, explanation is cognition plus study.

## Resolve what was asked

- **A mode**, such as `diataxis how-to`. Write in that mode until told otherwise.
- **A mode and a target**, such as `diataxis reference the config options`. Write that target in that mode. Leave the session alone.
- **A target alone**, such as `diataxis rewrite docs/setup.md`. Determine which mode the document is trying to be, say which, then write it in that mode only.
- **`audit <path>`.** Report mode contamination. Rewrite nothing.
- **No argument.** Classify each request as it arrives, name the mode in one short line, and answer in that mode alone. Continue until told to stop.
- **"off", "stop", or "normal".** Leave the mode. Confirm in one line.

Where a target mixes modes and no single one is dominant, say so and give the split. Do not silently pick one and drop the rest of the content.

## Tutorial

A lesson. The reader learns by doing something that works. They are a beginner and they do not yet know enough to make choices, so you make every choice for them.

- The tutorial must work. Every command, every time, from the stated starting point. A broken step destroys the reader's confidence in themselves, not in the document.
- The reader must reach a visible, meaningful result. Say at the start what they will have built.
- You choose. No options, no alternatives, no "you could also", no "depending on your setup". A choice offered to a beginner is a burden, not a kindness.
- Minimal explanation. Where the reader will stumble without a word of context, give one sentence and link out. Never a paragraph.
- Concrete throughout. Real names, real values, real output. Show what they should see after each step so they can confirm they are on track.
- Do not describe the general case. The tutorial teaches one path, not the shape of the space.
- Do not cover error handling, edge cases, performance, or production concerns.

**Forbidden:** design rationale, alternatives, configuration surface, "for more advanced users", anything that would only matter to someone who already knows the tool.

## How-to

A recipe. The reader has a goal and enough competence to adapt. They are at work, and something is blocking them.

- Title it as the goal: "How to rotate the signing key", not "Key rotation".
- Assume competence. Do not teach concepts the reader must already have to be asking this question.
- Include only what is needed to reach the goal. Every sentence that does not move the reader toward it is a delay.
- Address the real-world case, which usually means conditions: "If you use the managed database, do X instead."
- Sequence matters. Order the steps in the order they are performed.
- Name alternatives in a clause, not a section. "Use `--force` if the branch has diverged" is fine. Three paragraphs on when to force-push is explanation.

**Forbidden:** teaching, conceptual background, why the system works this way, complete option listings, tutorial-style hand holding.

## Reference

A description of the machinery. The reader is looking up a fact.

- Austere and neutral. State what the thing is and what it does. Nothing else.
- Structure mirrors the code. If the code has modules, the reference has sections in the same shape and the same order, with the same names.
- Consistent format for every entry. Same fields, same order, every time. The reader learns the shape once and then scans.
- Complete within its scope. A reference with gaps is worse than one with a stated boundary.
- Facts only: signatures, types, defaults, valid ranges, units, return values, errors raised, side effects, version introduced.
- Examples are permitted where they clarify usage, and only where they clarify usage. They are illustrations, not lessons.

**Forbidden:** instruction, recommendation, opinion, judgement about when to use something, explanation of why the design is this way, tutorial narrative.

## Explanation

A discussion. The reader wants to understand, and they are not at the keyboard.

- Written in the register of a conversation. It can wander a little, in a way none of the other three can.
- Cover why: the reasoning, the constraints, the history, the alternatives considered and rejected.
- Make connections. Relate this thing to other things, including things outside the project.
- Opinion is permitted here and nowhere else, and it is labelled as opinion.
- Provide the context that makes the other three documents make sense.

**Forbidden:** instructions, steps to follow, complete API listings, anything the reader is meant to do while reading.

## Contamination

These are the leaks worth watching for, in order of how often they occur.

| Leak | Looks like | Belongs in |
| --- | --- | --- |
| Explanation into how-to | "The reason this works is that the scheduler..." | Explanation, linked |
| Explanation into reference | "This option exists because early versions..." | Explanation, linked |
| How-to into tutorial | "In production you would instead..." | A how-to, linked |
| Reference into how-to | A full table of every flag | Reference, linked |
| Tutorial into how-to | Explaining what a container is | A tutorial, linked |
| Opinion into reference | "The preferred approach is..." | Explanation |
| Explanation into a tutorial | A paragraph on why this pattern | Cut, or one sentence and a link |

The remedy is always the same: move the content to the document that owns it and link. Deleting it outright is correct only when it exists nowhere and nobody needs it.

## In conversation

The framework was written for documents, and it applies to answers, since a question is a request for one of the four things.

- "How do I ..." is how-to. Give the steps. Do not explain the design.
- "Why does ..." or "why is ..." is explanation. Give the reasoning. Do not give steps.
- "What is the default for ..." or "what does X return" is reference. Give the fact, in one line, and stop.
- "I am new to this, walk me through ..." is tutorial. Choose the path and hold it.

Answer in the mode asked for, and only that mode. Where the reader plainly needs a second mode as well, finish the first, then offer the second in one line: "Say the word if you want why it works this way." Do not append it uninvited.

Where the request genuinely spans two modes, say which two and answer them in separate labelled sections rather than interleaving them.

## Auditing

`/diataxis audit <path>` reports, and changes nothing.

For each document: name the mode it is trying to be, and the evidence for that reading. Then list each passage that belongs to a different mode, anchored to `file:line`, with the mode that owns it.

Also report the gaps. Four modes are four needs, and a project with four how-to guides and nothing else has three unmet needs. Name which of the four is missing and what the reader is left to work out alone.

Do not report a document as contaminated on the strength of its title. Read it.

## What this does not license

- Do not cut a true caveat because caveats feel like explanation. A warning about data loss is part of the how-to. The consequence of a step belongs with the step.
- Do not cut a prerequisite. What the reader needs before starting belongs at the top of both tutorial and how-to.
- Do not refuse to answer because the question spans modes. Classify, answer, and say what you set aside.
- Do not restructure a user's existing documentation set unasked. An audit reports. A rewrite happens when it is requested.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/ste`.** No conflict, and they work at different levels. This decides what goes in the document, STE decides how each sentence is built. STE suits tutorial and how-to particularly well, since both are procedures.
- **`/bluf`.** Partial conflict, resolved by mode. Reference and explanation take a bottom line up front. How-to and tutorial keep their sequence and take a lead stating the outcome, which is what BLUF's own exemption for sequence-critical writing already requires.
- **`/pyramid`.** Use for explanation. An explanation is an argument, so it takes a governing thought and grouped support. Do not impose it on the other three.
- **`/ubiquitous`.** No conflict. It supplies the vocabulary for whichever mode is in play.
- **`/plain`.** No conflict, and reinforcing. Its relevance principle asks whether the reader needs this content, which is the same question in narrower form.

## Output

- **Mode declaration.** One short line naming the mode, then the content. In a written document, no declaration is needed: the shape says it.
- **Audit.** Findings anchored to `file:line`, grouped by document, with the missing modes reported at the end.
- Do not name the framework in the output itself. A tutorial does not tell the reader it is a tutorial.
- Do not add mode labels as headings inside a document unless the document genuinely covers two and the user asked for both.

## Before you send

- Is this one mode, or did a second one leak in?
- Tutorial: does every step work, and did you make every choice for the reader?
- How-to: is there a sentence that does not move the reader toward the goal?
- Reference: is there a recommendation, an opinion, or a "why" anywhere in it?
- Explanation: is there an instruction the reader is meant to follow while reading?
- Was anything cut that the reader needed, such as a warning or a prerequisite?
