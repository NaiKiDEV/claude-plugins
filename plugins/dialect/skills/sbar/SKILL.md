---
name: sbar
description: Escalate or hand off in the SBAR form - Situation, Background, Assessment, Recommendation - with all four slots filled and a named action in the last one.
argument-hint: [what to escalate or hand off, or nothing to switch the session into it]
disable-model-invocation: true
allowed-tools: Read Grep Glob Bash
---

Report this as SBAR: $ARGUMENTS

SBAR is a handoff form. It came out of the US Navy's nuclear submarine service and reached healthcare through Kaiser Permanente, where it is now standard for a nurse escalating to a physician. Four slots, always the same four, always in the same order.

The failure it exists to prevent is specific: someone with the facts presents them to someone with the authority and stops short of saying what they think and what they want. The receiver then has to reconstruct the judgment from the data, under time pressure, with less context than the sender had. SBAR makes the judgment and the ask mandatory fields.

## When this is the right form

SBAR is for escalation and handoff. It is not a general writing style, and applying it to an ordinary answer is heavier than the answer needs.

Use it for:

- Escalating a blocker to a person who can unblock it.
- Handing work over: to another session, another agent, another person, the next shift.
- Reporting an incident while it is live.
- Asking for a decision you cannot make yourself.
- Reporting that you are stuck, and what you need.

Do not use it for: answering a question, explaining how something works, writing documentation, or reporting finished work that needs nothing from anyone. Those want `/bluf` or `/pyramid`.

## Resolve what was asked

- **No argument.** Put every escalation, handoff, and request for a decision from now on into SBAR, until the user tells you to stop. Ordinary answers stay ordinary. Confirm in one line.
- **"off", "stop", or "normal".** Leave the mode. Confirm in one line.
- **A target**, such as `sbar the migration is blocked`. Produce one SBAR for that situation.
- **A task**, such as `sbar hand this session off`. Do the work of gathering the state, then report it in the form.

## The four slots

### S - Situation

What is happening now. One or two sentences.

- Name the thing and the immediate problem. "The nightly ETL job has failed on the last three runs."
- Include when it started and whether it is ongoing.
- Do not include history here. That is the next slot.
- Do not open with pleasantries or with how you came to be looking at this.

### B - Background

The context the receiver needs to understand the situation, and nothing more.

- What changed recently, and when.
- What has already been tried, and what happened.
- The relevant state: versions, config, environment, scale, who else is involved.
- Anchor facts to `file:line`, a command, or a log line where they came from the code or the system.
- Severity, blast radius, and who is affected belong here when they are facts. When they are your read, they belong in Assessment.
- This is the slot that bloats. Cut anything the receiver does not need to evaluate your Assessment or act on your Recommendation.

### A - Assessment

What you think is going on. This slot is mandatory and it is the point of the form.

- State a judgment, not a summary of the facts you just gave. If you find yourself restating Background here, you have not made an assessment.
- Where the cause is unknown, say so plainly and say what you have ruled out: "Cause unknown. Not the dependency bump, since the failure predates it by two days."
- Give the probability of your read where more than one explanation survives. "Very likely the connection pool, high confidence" says more than "seems to be the connection pool".
- Say how bad it is and how urgent it is, and keep those separate. A serious problem that can wait is not the same as a small one that cannot.
- Never leave this slot empty because you are unsure. An uncertain assessment stated as uncertain is exactly what the form asks for. Silence here forces the receiver to guess what you think.

### R - Recommendation

What you want, from whom, by when.

- Name the action. "Roll back to `v2.4.1`", not "we should consider our options".
- Name who does it. If it is you, say you will do it and what you need in order to start.
- Give the timeframe, and say what happens if it slips.
- Where you are asking for a decision rather than an action, give the options with their consequences, and say which one you would take.
- Where you need information rather than a decision, name the exact question.
- "Please advise" is not a recommendation. Neither is "let me know how you want to proceed". If you genuinely have no recommendation, say what you would need in order to form one.

## Rules for the whole message

- **All four slots, always, in order.** An empty slot is stated, not skipped: "Assessment: cause unknown, see below."
- **Short.** SBAR was designed to be spoken in under a minute. A written one should be readable in about thirty seconds. If Background runs past a short paragraph, most of it is not needed.
- **Label the slots.** Unlike a bottom line up front in conversation, the labels here earn their place. The receiver scans for `R` first when they are busy, and for `A` when they are deciding whether to get involved. Use `Situation`, `Background`, `Assessment`, `Recommendation` as headings, or their single letters in a compact message.
- **No preamble above `Situation`.** No apology, no warm-up, no "sorry to bother you".
- **Facts, judgment, and ask stay in their slots.** A judgment in Background reads as a fact and will be repeated as one. An action buried in Assessment will be missed.
- **Attach the detail below, not inside.** Logs, stack traces, diffs, and reproduction steps go under the four slots for the reader who wants them.

## Bad news

The form exists for bad news, so do not soften it.

- Situation states the bad thing in its first sentence.
- Do not lead with what is still working, and do not open with what you have already fixed.
- Do not shade an assessment toward the answer the receiver would prefer.
- Where you caused it, say so in Background in one sentence, then move on. The receiver needs the state of the system more than they need an apology, and the apology delays the Recommendation.

## Handoff

A handoff is an SBAR to whoever picks the work up next, including a future session.

- Situation: what the work is and where it stands right now.
- Background: what has been done, what was tried and rejected, and why. Anchor to files and commits.
- Assessment: what you believe about the remaining work, including what you are unsure of and what you would check first.
- Recommendation: the next concrete action, and anything that will bite the next person.

The test is whether somebody cold can act on it without asking you a question. If they would have to, that answer belongs in Background.

## Confirm receipt

The form comes from settings where the receiver reads the instruction back before acting.

- When you are the receiver of an SBAR or an instruction that carries risk, restate the action, the target, and the constraint in one line before doing it: "Rolling back `api` to `v2.4.1` on production only, leaving staging alone."
- Do this for anything destructive, anything outward facing, and anything you cannot undo. Do not do it for ordinary work, where it is noise.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/bluf`.** Conflict at the top, resolved in favour of this form. BLUF would put the Recommendation first. SBAR's order is fixed and the receiver expects it, so keep the four slots as they are. Inside each slot, BLUF applies: lead the slot with its point.
- **`/pyramid`.** Conflict, resolved the same way. Do not impose a pyramid over the four slots. Use it to organise the contents of Background and Assessment when either grows past a few lines.
- **`/calibrated`.** Reinforcing, and close to required. Assessment is a judgment, so it takes a probability word and a confidence level, and Background is evidence, so it takes anchors.
- **`/ste`.** No conflict, and a good pairing. Short definite sentences suit a message read under pressure.
- **`/normative`.** Reinforcing in the Recommendation slot, where a `MUST` separates the action that must happen from the ones that can wait.

## Output

- **Mode.** One short confirmation. Then use the form for escalations and handoffs only, and answer ordinary questions normally.
- **The report.** Four labelled slots, in order, then any attached detail.
- Do not name the form in the output. The labels are the form.
- Do not pad a slot to make the four look balanced. Situation is often one sentence and Background is often three.

## Before you send

- Are all four slots present and in order?
- Does Assessment contain a judgment, or does it restate Background?
- Does Recommendation name an action, an actor, and a timeframe?
- Would a cold reader know what to do, or would they have to ask you something first?
- Is the bad news in the first sentence?
- Is there anything in Background the receiver does not need?
- Is a judgment sitting in Background, or an action buried in Assessment?
