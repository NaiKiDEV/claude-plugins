---
name: normative
description: State obligations in RFC 2119 keywords - MUST, SHOULD, MAY - so a blocker and a preference cannot be confused, with each requirement single, unambiguous, and verifiable.
argument-hint: [text or requirements to make normative, or nothing to switch the session into it]
disable-model-invocation: true
allowed-tools: Read Grep Glob
---

State requirements in normative language: $ARGUMENTS

RFC 2119 defines eleven keywords that fix the strength of a requirement. RFC 8174 adds the rule that only the upper case forms carry that meaning, so ordinary prose can still use the same words as ordinary English. Together they are the reason an internet specification can say what is mandatory and what is a preference without a paragraph of explanation each time.

The problem is a list where "you must add an index", "you should probably rename this", and "consider adding a test" all look the same. The reader cannot tell what blocks release from what is taste, so they either do everything or nothing.

Requirement quality rules below follow the INCOSE guidance and ISO/IEC/IEEE 29148, which say what a well-formed requirement looks like once its strength is fixed.

## The keywords

| Keyword | Means |
| --- | --- |
| **MUST**, **REQUIRED**, **SHALL** | Absolute requirement. Not meeting it makes the thing wrong. |
| **MUST NOT**, **SHALL NOT** | Absolute prohibition. |
| **SHOULD**, **RECOMMENDED** | There may be valid reasons in particular circumstances to do otherwise, but the full implications must be understood and weighed before choosing differently. |
| **SHOULD NOT**, **NOT RECOMMENDED** | The same, in the negative. |
| **MAY**, **OPTIONAL** | Truly optional. Something that omits it must still work with something that includes it, and the reverse. |

Rules for using them:

- Upper case only. `MUST` is normative and `must` is English. Never write the lower case form where you mean the keyword, and never upper case one by accident in running prose.
- Pick one word for each level and use it throughout a document. `MUST` and `SHALL` mean the same thing, and using both makes the reader hunt for a distinction that is not there.
- Use them sparingly. A document where every line is `MUST` has no levels at all. Reserve `MUST` for what actually breaks something: correctness, interoperability, security, data integrity, a legal or contractual obligation.
- Do not use a keyword to impose a method where the method does not matter. Requirements constrain outcomes. Prescribing an implementation that is not needed for the outcome is a design decision wearing a requirement's clothes.
- `SHOULD` carries an obligation to think, not permission to skip. When you write it, say what would justify departing from it. A `SHOULD` with no stated exception case is a `MUST` that lost its nerve.
- `MAY` describes what is permitted, not what is likely. It is not a hedge and it is not a probability.

## Resolve what was asked

- **No argument.** From now on, every obligation you state carries a keyword, until the user tells you to stop. Confirm in one line.
- **"off", "stop", or "normal".** Leave the mode. Confirm in one line.
- **A target**, such as a review, a checklist, a design document, or a list of findings. Restate it with keywords and leave the session alone.
- **A task**, such as `normative what does this endpoint need before launch`. Do the work and give the answer as requirements.

When reading somebody else's specification, quote their keywords exactly. Do not restate their `SHOULD` as a `MUST` because you think it ought to be one. Say that you would raise it, and why.

## Writing a requirement

One requirement is one sentence. The shape:

> `[While <state>,] [when <trigger>,] the <subject> MUST <action> [<object>] [<constraint>].`

- **One requirement for each statement.** An `and` joining two obligations is two requirements. So is a comma list of three things. Split them, because they are verified separately and they can fail separately.
- **Name the subject.** Who or what has the obligation: the client, the migration, the reviewer, the endpoint. A requirement with no subject cannot be assigned.
- **Active voice.** "The client MUST retry", not "the request MUST be retried".
- **Verifiable.** State how anyone would tell whether it is met. Where the criterion is a number, give the number and the unit. "The endpoint MUST respond within 200 ms at the 95th percentile" is verifiable. "The endpoint MUST be fast" is not.
- **Conditions before the obligation**, in the `while` and `when` slots.
- **No rationale inside the requirement.** Why it exists goes on a separate line. Mixing the two makes the requirement itself untestable.
- **Give each requirement an identifier** in a document, so it can be referenced, traced, and argued about. Not in conversation.

## Banned in a requirement

Each of these makes a requirement unverifiable, which means nobody can ever say it was met.

- **Vague qualities:** fast, robust, efficient, scalable, secure, reliable, user-friendly, intuitive, clean, modern, seamless, flexible, lightweight. Replace with the measurable property you mean.
- **Vague quantities:** sufficient, adequate, appropriate, reasonable, minimal, several, some, most, as many as possible, state of the art.
- **Open-ended lists:** `etc.`, `and so on`, `such as`, `including but not limited to`. Complete the list, or state the rule that generates it.
- **Escape hatches:** if practical, if possible, as appropriate, where feasible, to the extent possible, if needed. These make the requirement optional while looking mandatory. Either it is a `SHOULD` with a stated exception, or the condition is real and belongs in the `when` slot.
- **Ambiguous conjunctions:** `and/or`. Say which. Write "A, B, or both" if that is what you mean.
- **Vague verbs:** support, handle, process, manage, deal with. Say what the subject does.
- **Comparatives with no baseline:** better, faster, improved, more secure. Give the baseline and the delta.
- **Certainty words as strength words:** `definitely`, `always`, `never` used for emphasis rather than as a real universal quantifier.

## Boilerplate

A document using the keywords normatively includes the RFC 8174 statement once, near the top:

> The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in BCP 14 [RFC2119] [RFC8174] when, and only when, they appear in all capitals, as described here.

Include it in a specification, an RFC, a design document, or a contract-like document. Leave it out of a chat reply, a review, or a short checklist, where the keywords are self-evident and the paragraph is noise.

## In review and advice

This is where the levels earn their keep, and where the temptation to inflate is strongest.

- `MUST` is for correctness, security, data loss, and anything that breaks a documented contract. Nothing else.
- `SHOULD` is for a real cost the author is entitled to accept: maintainability, consistency with the codebase, a performance characteristic that does not bite yet.
- `MAY` is for a genuine option, and it needs no defence from the author.
- Anything below `MAY` is not a requirement and does not take a keyword. Say it as a plain observation, or leave it out.
- Do not raise a preference to `SHOULD` to make it more likely to be actioned. That empties the level for everyone who reads the next review.
- Do not soften a real blocker to `SHOULD` to avoid an argument. A security hole marked `SHOULD` is a security hole you agreed to ship.
- Order by strength: every `MUST` first, then `SHOULD`, then `MAY`.
- Count them. If a review has eleven `MUST`s, either the change is in serious trouble or the levels have drifted. Re-read them before sending.

## What this is not

- **Not a probability.** `MUST` says something is obligatory, not that it is certain. "The build MUST fail" means it is required to fail, which is almost never what the writer meant. State likelihood with `/calibrated` instead.
- **Not a prediction.** `SHOULD` is an obligation with an exception clause, not "I expect it to work". "This SHOULD work" is the exact ambiguity RFC 2119 exists to remove.
- **Not for describing behaviour.** How the system does behave is the present tense: "the client retries three times". How it is required to behave is `MUST`. Do not use a keyword to describe existing code.
- **Not for code, comments, or commit messages**, unless the code is a specification implementation and the comment cites a requirement.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/ste`.** One conflict, resolved in favour of this skill. STE's replacement table sends `shall` to `must` and rewrites `should` and `may` outright, which is right for procedure prose and wrong for a normative statement, where the three words are distinct defined terms. Under both, keep the upper case keywords exactly as they are and apply STE's rules to everything around them.
- **`/calibrated`.** No conflict, and the two must not be mixed. This states obligation. That states probability. A requirement is not more or less likely, and a judgment is not mandatory.
- **`/bluf`.** No conflict, and reinforcing. Lead with the `MUST`s, since those are what the reader has to act on.
- **`/comments`.** Reinforcing. A conventional comment's `(blocking)` decoration and a `MUST` are the same call, so use them consistently: `issue (blocking)` carries `MUST`, `suggestion (non-blocking)` carries `SHOULD` or `MAY`.
- **`/diataxis`.** Reference and how-to take keywords well. Explanation and tutorial do not, since neither is stating requirements.

## Output

- **Mode.** One short confirmation. Then carry keywords with no further commentary about them.
- **A requirements list.** One requirement for each line, with an identifier, ordered by strength. Rationale and verification on their own lines under the requirement, and only where they add something.
- **A review or a set of findings.** Keyword first, then the finding, anchored to `file:line`.
- Do not add a keyword to a sentence that states no obligation.
- Do not print the RFC 8174 boilerplate in conversation.

## Before you send

- Does every statement of obligation carry a keyword, and does every keyword sit on a real obligation?
- Is every keyword upper case, and is every lower case `must` genuinely meant as English?
- Does any requirement contain an `and` joining two separate obligations?
- Is every `MUST` something that actually breaks if unmet?
- Could a stranger tell, mechanically, whether each requirement was met?
- Is there a `sufficient`, an `appropriate`, an `as needed`, an `etc.`, or an `and/or` left in a requirement?
- Is any `SHOULD` doing the job of `almost certain`?
