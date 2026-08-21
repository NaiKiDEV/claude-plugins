---
name: adr
description: Record a decision so the reasoning survives the people who made it. Nygard's Architecture Decision Record - context, decision, consequences, and a status that can be superseded but never edited.
argument-hint: [the decision to record]
disable-model-invocation: true
allowed-tools: Read Grep Glob Bash Write Edit
---

Record this decision: $ARGUMENTS

Michael Nygard proposed the Architecture Decision Record in 2011 as a short document, kept in the repository next to the code, capturing one decision and the forces that produced it. The format is deliberately small, because a format that is expensive to write does not get written.

The failure it addresses is specific and familiar. Six months later the code shows what was decided and nothing shows why. The constraint that forced it has gone, the alternatives that were considered are forgotten, and the next person either preserves a constraint that no longer exists or removes a safeguard whose reason was never written down. The code is a record of the decision. It is not a record of the reasoning, and the reasoning is what the next change needs.

This is the only skill in this plugin that writes to disk. It writes one file.

## Resolve what is being recorded

- **An argument.** Record that.
- **Nothing.** Take the decision just made in the conversation and state it in one line for confirmation before writing anything.
- **Nothing decided.** Say there is nothing to record and stop. An ADR for a decision nobody has made is a proposal, and it should be written as one, with status `Proposed`.

## Check whether it deserves a record

Most decisions do not. A repository full of ADRs for choices nobody would revisit is a repository whose ADRs stop being read, which costs more than the ones that were never written.

Record a decision when at least one of these holds:

- **It is hard to reverse.** Run `/reversible` if that is not obvious. A one-way door is the canonical case.
- **The reasoning is not visible in the code.** Especially when the result looks wrong without it: the deliberate duplication, the unusual library, the constraint that seems arbitrary.
- **The alternatives were real.** Someone will propose one of them again, and the record is what saves that conversation.
- **It was forced by something external** that will outlive the memory of it: a client, a deadline, a licence, a limit in a dependency, a regulation.
- **It reverses or narrows an earlier decision.** These must always be recorded, because the earlier decision is what the next reader will find.

Do not record: a decision the code states plainly, a naming choice with no consequence, or something already documented elsewhere in the project. Say why you are not recording it rather than writing a thin one.

## Find where they live

Look before creating anything. Projects that keep ADRs already have a convention, and inventing a second one is worse than not writing the record.

Check `docs/adr`, `docs/decisions`, `doc/arch`, `adr`, and `.adr-dir`, and search the repository for existing files matching an ADR naming pattern. Where records exist, follow them exactly: their directory, their numbering, their filename format, their headings, and their tone. An existing set is the specification.

Where none exist, use `docs/adr/NNNN-kebab-case-title.md`, starting at `0001`, and say in your report that you are establishing the convention.

Number sequentially and never reuse a number. Where two records could collide, take the next free one.

## Write it

Five sections. Keep the whole thing under a page, because length is what stops these being written and being read.

### Title

`# NNNN. A short declarative title`

The title states the decision, not the topic. "Use Postgres advisory locks for job claiming", not "Job claiming". A reader scanning a directory of titles should be able to find the relevant record without opening anything.

### Status

One word, plus a date. `Proposed`, `Accepted`, `Deprecated`, or `Superseded by NNNN`.

Records are immutable once accepted. When a decision changes, write a new record and set the old one's status to `Superseded by NNNN`, with a link. Editing an accepted record to match current practice destroys the only thing the format is for, which is the ability to see what was believed at the time and what changed.

The status line is the sole exception: it may be updated, and only to supersede or deprecate.

### Context

The forces in play at the time, written in the present tense, as they were then.

This is the section that has to carry the weight, and it is the one most often written badly. It is not background about the project. It is the specific pressures that made this decision necessary and made it non-obvious:

- The constraint. The volume, the latency budget, the deadline, the dependency limit, the thing the client requires.
- What was already true. The existing architecture, the prior decision this sits inside, the state of the codebase.
- The tension. Two things that could not both be satisfied. If there was no tension, there was probably no decision.
- What was not known at the time. This is what makes a later reversal legible rather than embarrassing, and it belongs on the record.

Write facts and forces, not advocacy. A reader who disagrees with the decision should still recognise the context as accurate.

### Decision

What was decided, in the active voice, as a statement rather than an intention. "We will use X." Not "it was decided that X might be used."

Include the alternatives that were genuinely considered and one line each on why they lost. This is what stops the record being re-litigated: the next person to suggest the obvious alternative can see it was considered and why it did not win. Where `/options` or `/tradeoff` was run, the rejected options and the criteria come straight across.

Do not include alternatives nobody seriously weighed. A padded list of rejects is noise.

### Consequences

Everything that follows, good and bad, stated as facts about the new situation rather than as a defence of it.

- **What becomes easier.** The reason it was chosen.
- **What becomes harder.** State this plainly and specifically. A consequences section with no costs in it is advertising, and a reader will discount the whole record on sight.
- **What is now committed to.** The interface published, the dependency taken on, the shape others will build against.
- **What has to be maintained.** The thing someone must keep doing for this to keep working.
- **What would make this worth revisiting.** The condition under which the decision should be reopened: a volume threshold, a dependency reaching maturity, a constraint expiring. This is the most useful line in the whole record and the one most often left out.

## After writing

- Print the path and the title.
- Where a record has been superseded, update that record's status line and nothing else, and say which one you changed.
- Where the project keeps an index or a README in the ADR directory, add the row.
- Do not commit unless the user asks.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/reversible`.** Sequential, and it is the trigger. A one-way door is the decision that deserves a record.
- **`/options`.** Reinforcing. The rejected options and their opportunity costs are the alternatives section, and they are the part reconstructed worst from memory.
- **`/tradeoff`.** Reinforcing. The criteria and weights are the Context, and the losing options are the alternatives.
- **`/premortem`.** Reinforcing. Accepted risks belong in Consequences, since an accepted risk that was never written down is indistinguishable later from one nobody saw.
- **`/why`.** Complementary, if the `questions` plugin is installed. That reconstructs reasoning that was never recorded. This is how it stops being necessary.
- **`/diataxis`.** No conflict, if the `dialect` plugin is installed. An ADR is explanation, and it is exempt from being split, since the format is fixed by convention.

## Before you send

- Does this decision actually deserve a record?
- Was the repository checked for an existing ADR convention, and is it being followed exactly?
- Is the number free and sequential?
- Does the title state the decision rather than the topic?
- Is the Context written in the present tense, as facts and forces, and would someone who disagrees still call it accurate?
- Does the Context name the tension, and what was not known at the time?
- Are the real alternatives listed with one line each on why they lost?
- Does Consequences state what becomes harder, specifically?
- Is the condition for revisiting the decision written down?
- Is the whole record under a page?
- If this supersedes an earlier record, was that record's status line updated and nothing else?
