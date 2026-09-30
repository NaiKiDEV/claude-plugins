---
name: ears
description: Write every requirement in one of five fixed sentence patterns, or a stated combination of them, so that a missing trigger, a missing state, or an unstated failure case becomes visible as a requirement that fits no template. EARS, from Rolls-Royce.
argument-hint: [requirements to put into EARS, or nothing to switch the session into it]
disable-model-invocation: true
allowed-tools: Read Grep Glob
---

Write these requirements in EARS: $ARGUMENTS

Alistair Mavin and colleagues published the Easy Approach to Requirements Syntax at the IEEE Requirements Engineering conference in 2009, after applying it to jet engine control software at Rolls-Royce. It is five templates plus a rule for combining them, and every requirement must fit exactly one.

The constraint that does the work is not the wording. It is the classification. Deciding which template a requirement belongs to forces you to name its trigger, or its state, or its condition, and a requirement whose trigger cannot be named does not have one. The defect was always there. The template is what makes it visible without anyone having to notice it.

The failure it addresses is the requirement written in a shape that hides what is missing. "The system validates uploaded files" fits no template, and working out why is the whole exercise: it never says when, so it could mean on upload, on access, or nightly, and each of those is a different system.

This skill fixes **shape**. It does not fix **strength**. `/normative` does that, and the two compose.

## The templates

| Pattern | Shape | Use when |
| --- | --- | --- |
| **Ubiquitous** | The `<system>` shall `<response>`. | The behaviour is always active, with no trigger and no precondition. |
| **Event-driven** | **WHEN** `<trigger>`, the `<system>` shall `<response>`. | Something happens, and the system responds to it. |
| **State-driven** | **WHILE** `<state>`, the `<system>` shall `<response>`. | The behaviour holds throughout a period, not at an instant. |
| **Optional feature** | **WHERE** `<feature is included>`, the `<system>` shall `<response>`. | The behaviour exists only in some configurations, editions, or builds. |
| **Unwanted behaviour** | **IF** `<trigger>`, **THEN** the `<system>` shall `<response>`. | The trigger is a failure, an error, an abuse, or anything undesired. |
| **Complex** | **WHILE** `<state>`, **WHEN** `<trigger>`, the `<system>` shall `<response>`. | Any combination of the above, in the order state, then trigger. |

Rules for the keywords:

- Upper case the keyword. `WHEN`, `WHILE`, `WHERE`, `IF`, `THEN`. Lower case is ordinary English, exactly as in RFC 2119.
- **WHEN and IF are not interchangeable.** `WHEN` is for a trigger that is expected to happen. `IF` is for one that is not wanted. That distinction is the highest-value part of the notation, because it makes the failure cases countable, and a specification where nobody can count the failure cases is a specification with an unknown number of gaps.
- **WHILE and WHEN are not interchangeable.** `WHILE` is a duration, `WHEN` is an instant. A requirement using `WHEN` for something that must hold continuously is a requirement that will be satisfied once.
- **WHERE is for optionality in the product, not in the runtime.** A feature flag that ships in every build and switches at runtime is `WHILE`, on the state of the flag. `WHERE` is for what is not compiled, not licensed, or not installed.
- Keep the response on the right of the subject. Preconditions never go after the obligation.

## Resolve what was asked

- **No argument.** From now on, every requirement you state takes an EARS template, until the user says to stop. Confirm in one line.
- **"off", "stop", or "normal".** Leave the mode. Confirm in one line.
- **A target**, such as a specification, a ticket, or a list of acceptance criteria. Put it into templates and leave the session alone.
- **A task**, such as `ears what this queue consumer has to guarantee`. Do the work and give the answer as templated requirements.

When restating somebody else's requirement, do not add a trigger they did not state. Where the template needs one and none exists, that is the finding, and it is reported as an open question rather than filled in. Inventing the trigger is how a reading becomes a specification.

## Writing one

- **One requirement, one sentence, one template.** A sentence needing two templates is two requirements.
- **Name the system.** The subject is the thing with the obligation: the consumer, the endpoint, the migration, the client. Not "the system" generically in a document about several.
- **The response is observable.** Something changed that somebody could see: a value returned, a record written, a message emitted, a status set. "The system shall consider the request valid" describes a state of mind.
- **The trigger is a fact, not a judgment.** "WHEN the upload completes" is a fact. "WHEN the upload seems complete" is not.
- **One response per requirement.** An `and` joining two responses is two requirements, verified separately.
- **No rationale inside the sentence.** It goes on its own line underneath.
- **Give it an identifier** in a document, so it can be referenced and traced. Not in conversation.

## Coverage

The templates are worth more as a set than one at a time, because the classification makes gaps countable. Check these before sending.

- **Every `WHEN` deserves an `IF`.** For each expected trigger, ask what the requirement is when it goes wrong. Most specifications are almost entirely event-driven and ubiquitous, and the missing unwanted-behaviour requirements are where the defects will be.
- **Count the `IF` requirements.** A specification of any size with none is not a specification without failure modes. It is one where nobody wrote them down.
- **Every `WHILE` needs its edges.** Entering the state and leaving it are usually separate event-driven requirements, and they are usually missing.
- **Every `WHERE` needs its absence.** What the system does when the optional feature is not included is a requirement, and it is almost never written.
- **A requirement that fits no template is the output.** Do not force it. Report it, and say which part is missing: the trigger, the state, the subject, or the observable response. This is the single most useful thing the notation produces.
- **A requirement that fits several templates** is more than one requirement, or its trigger and its state have been confused. Split it and say which reading you took.

## What this is not

- **Not strength.** `shall` in EARS marks the response slot; it does not grade the obligation. Where a specification needs to distinguish a blocker from a preference, that is `/normative`, and the two are written together.
- **Not a test.** A templated requirement is verifiable in principle. What the actual values are is `/examples`, if the `refine` plugin is installed, and no template makes a vague response concrete.
- **Not for describing existing behaviour.** How the code behaves now is the present tense. `shall` is an obligation on something not yet built, or not yet confirmed.
- **Not for goals, prose, or explanation.** A document has requirements in it and other things around them. Templating the other things produces stilted text and no extra precision.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/normative`.** Reinforcing, and they are designed to be used together. This fixes shape, that fixes strength. Written together: `WHEN <trigger>, the <system> MUST <response>`, taking the RFC 2119 keyword in the response slot in place of the bare `shall`. Note that the generic requirement shape in `/normative` is this notation's complex template, unnamed. The value here is the classification and the coverage checks, which a single generic shape cannot give.
- **`/ste`.** Reinforcing, with one conflict, and this skill wins it. STE's restricted vocabulary and 20-word limit apply cleanly inside the response slot, and the templates supply the sentence structure STE asks for anyway. STE's replacement table sends `shall` to `must`, but that row does not apply inside a template, where `shall` marks the response slot. Keep `shall` and the upper case keywords exactly as they are.
- **`/plain`.** No conflict. The templates are a fixed structure, which is what plain language asks for; apply the word-level rules inside the slots.
- **`/calibrated`.** No conflict, and they must not be mixed. This states what is required. That states what is likely. A requirement is not probable.
- **`/smells`.** Sequential, if the `refine` plugin is installed, and that comes first on somebody else's document. A requirement it flags as not singular or as missing its actor is usually the same one that fits no template here.
- **`/examples`.** Sequential, if the `refine` plugin is installed, and it comes first. Rules discovered there become templated requirements here, and the concrete examples stay attached, because the template makes a requirement unambiguous in shape and not in value.

## Output

- **Mode.** One short confirmation, then carry the templates with no further commentary about them.
- **A requirements list.** One per line, with an identifier, grouped by template with ubiquitous first, then state-driven, event-driven, optional feature, and unwanted behaviour last. Rationale underneath, only where it adds something.
- **The unfitted.** Every requirement that fits no template, quoted, with the missing part named. Listed separately, because these are findings rather than requirements.
- **The coverage gaps.** Triggers with no unwanted-behaviour requirement, states with no entry or exit, optional features with no absent case.
- Do not invent a trigger, a state, or a subject to make a requirement fit.

## Before you send

- Does every requirement fit exactly one template?
- Is every requirement that fits none reported rather than forced, with the missing part named?
- Is every keyword upper case?
- Is `IF` used for the unwanted cases and `WHEN` for the expected ones, consistently?
- Is `WHILE` used for durations rather than instants?
- Is `WHERE` used for what is not present in the product, rather than for a runtime flag?
- Is the subject a named system rather than a generic one?
- Is every response observable from outside?
- Does any requirement join two responses with `and`?
- For each `WHEN`, was it asked what happens when the trigger goes wrong?
- Are there any unwanted-behaviour requirements at all?
- Was a trigger or a state invented to make somebody else's requirement fit?
