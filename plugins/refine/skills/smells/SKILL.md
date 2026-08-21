---
name: smells
description: Audit a specification that already exists for the defects that make it unexecutable. Requirements smells against the ISO 29148 quality characteristics, including the set-level defects a single requirement can never reveal.
argument-hint: [the spec, ticket, or requirements to audit, or nothing to use what is on the table]
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit
---

Audit this specification: $ARGUMENTS

ISO/IEC/IEEE 29148 defines what a well-formed requirement is, and separately what a well-formed **set** of requirements is. Henning Femmer and colleagues turned the first half into a working detector in *Rapid quality assurance with requirements smells*, on the argument that most requirement defects are visible in the text itself and can be found by looking for specific words, without understanding the domain.

The failure this addresses is a specification that reads well and cannot be executed. It passes review because review means reading it, and reading it is the operation that cannot detect the defect: every sentence is grammatical, every paragraph is plausible, and the ambiguity only becomes visible when somebody has to act on it and picks a reading.

The property that makes this worth running separately from a careful read: **most of the serious defects are between requirements, not inside them.** Two requirements that each pass every quality check can still contradict each other, and no amount of scrutiny applied one sentence at a time will find it.

This skill audits. It does not rewrite. Where the `dialect` plugin is installed, rewriting is `/normative` and `/ears`.

## Resolve what is being audited

- **An argument naming a file, a ticket, or a block of text.** Audit that.
- **Nothing.** Take the specification on the table and name it in one line before starting.
- **A plan or a design document rather than requirements.** Audit it, and say which parts are requirements and which are prose. Applying requirement quality checks to explanation produces noise, and the two are usually mixed in the same document.
- **Nothing on the table.** Say so and stop.

Where the specification is a file, read it whole before auditing any part of it. Set-level defects are invisible from inside a fragment.

## Check before you audit

Find out what the requirements are supposed to be true of, and check them against it. A textual audit that never touches the code will report things that are already settled and miss the ones that are actually wrong.

- Where a requirement describes existing behaviour, check the behaviour. A requirement that contradicts the code is a defect this skill should catch, and it outranks every wording problem in the document.
- Where a requirement names a threshold, a limit, or a version, check whether the project already sets one somewhere else. Two numbers for the same thing in two places is a set-level conflict.
- Where a requirement cites a standard, an interface, or an upstream contract, check it exists and says what is claimed.

Report anything found this way first, before any wording finding. A wrong requirement dressed in perfect language is worse than a vague one, because nothing about reading it invites doubt.

## 1. Scan each requirement

Work the smell catalogue over each requirement. Every finding carries a location, the smell, and the quality characteristic it violates.

**Ambiguity smells**

- **Subjective language.** User-friendly, intuitive, clean, simple, seamless, modern, reasonable, appropriate, adequate, sufficient, robust, flexible, lightweight.
- **Ambiguous adverbs and adjectives.** Almost always, significantly, minimal, easily, quickly, usually, typically, roughly, normally.
- **Vague pronouns.** It, this, they, that, where the referent is not the nearest noun or is genuinely unclear. Common and easy to miss, because the writer knows what it refers to.
- **Comparatives with no baseline.** Faster, better, improved, more secure, more reliable. Faster than what, by how much.
- **Superlatives.** Best, maximum, optimal, as fast as possible. These state an aspiration and specify nothing.
- **Vague verbs.** Support, handle, process, manage, deal with, cope with. Every one of them can be read as anything from a stub to a full implementation.

**Verifiability smells**

- **Non-verifiable terms.** Where no procedure could establish whether the requirement was met. This is the characteristic that matters most for execution, because an unverifiable requirement has no completion condition, so the work under it never ends and never provably finishes.
- **Loopholes and escape hatches.** If practical, if possible, where feasible, as appropriate, to the extent possible, if needed. These make a requirement optional while it still reads as mandatory.
- **Open-ended lists.** `etc.`, and so on, such as, including but not limited to. The reader cannot know what is in scope, so scope is set by whoever implements it.

**Structure smells**

- **Not singular.** An `and` joining two obligations, or a comma list of three things. They are verified separately and can fail separately, so they are separate requirements.
- **Passive voice with no actor.** "The request must be validated" does not say by whom, and a requirement with no subject cannot be assigned to anyone.
- **Negative statements**, where a positive one is available. Especially double negatives, and especially in combination with a condition.
- **Incomplete references.** A pointer to a section, a document, a ticket, or a standard that does not exist, is not versioned, or does not say what is claimed.
- **Requirement mixed with rationale or design.** Both are worth having, and both make the requirement itself untestable when they are inside it.

Do not report a smell that does not matter. A subjective word in a document's introduction is not a defect. A subjective word in the only sentence stating the acceptance condition is the whole problem. Judge by whether somebody acting on this would be able to go wrong.

## 2. Scan the set

This is the half a per-requirement read cannot do, and where the findings that stop work usually are.

- **Conflict.** Two requirements that cannot both be satisfied. Quote both, and give the specific case where they collide. This is the highest-value finding in the skill and it is worth going looking for deliberately: sort the requirements by the thing they constrain and read each group together.
- **Duplication.** The same requirement stated twice, in different words. It will be implemented twice, or changed in one place only, and the two copies will diverge silently.
- **Overlap.** Two requirements partly covering the same ground with different boundaries. Worse than duplication, because it looks intentional.
- **Gaps.** The set does not cover the whole scope it claims to. Look specifically for: the error path where only the success path is stated, the empty and the maximum case, what happens on the second attempt, the migration of what already exists, and who can do it where an operation is specified but not its authorisation.
- **Orphans.** A requirement traceable to no goal, no stakeholder, and no source. Either something is missing above it or the requirement is not needed. Both are worth knowing.
- **Inconsistent terminology.** The same concept named two ways, or one name used for two concepts. List the terms and where each appears. Where the `dialect` plugin is installed, `/ubiquitous` is the repair.
- **Inconsistent strength.** The document uses must, should, shall, will, and needs to interchangeably, so a blocker cannot be told from a preference. Where the `dialect` plugin is installed, `/normative` is the repair.
- **Unbounded set.** The specification implies more requirements exist without stating them, usually through an open-ended list or a phrase like "and the usual validation".

## 3. Grade by consequence

Sort the findings by what happens if nobody fixes them, not by how many there are. A count of smells is a number that goes down when somebody deletes adjectives, and it measures nothing.

| Level | Meaning |
| --- | --- |
| **Blocking** | Somebody acting on this would build the wrong thing, or could not tell when to stop. Conflicts, unverifiable acceptance conditions, gaps in the specified behaviour, and any requirement contradicted by the code. |
| **Serious** | Two readings exist and both are plausible. Work would proceed, and the disagreement would surface at review or later. |
| **Minor** | Imprecise, but only one sensible reading exists in context. |

Report blocking and serious in full. Cap minor at about five and say how many were left off. A long tail of minor findings buries the conflict at the top, which is the finding that was worth the audit.

Where the whole document is uniformly imprecise, say that as one finding rather than as forty. The response to that is a rewrite, not a list of edits.

## 4. Say what to do

For each blocking and serious finding, one line on the repair. Name the question to be answered where the fix needs a decision, rather than proposing wording that quietly makes the decision.

That distinction is the discipline of this skill. Sharpening "the endpoint must be fast" into "the endpoint must respond within 200 ms at p95" is not an edit. It is a decision about a service level, made by whoever writes the sentence, and it should be raised as a question rather than smuggled in as a correction.

Where the repair is genuinely mechanical, such as splitting a conjoined requirement or naming a passive actor that is unambiguous from context, propose it directly.

## Output

- **Findings against the code first**, where a requirement contradicts what exists, or cites something that does not.
- **The requirement-level table**: location, the requirement quoted or cited, the smell, and the severity.
- **The set-level findings**, separately and second, because they are the ones a reader will otherwise assume were covered by the table. Conflicts first, with both requirements quoted and the colliding case named.
- **The blocking list**, as questions to be answered, in the order they should be answered.
- **A verdict** in one line: whether this specification can be executed as written, and if not, the count of blocking findings.

Do not rewrite the document. Do not produce a corrected version. Where the user wants that, the audit hands off.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/normative`.** Sequential, and it is the repair, if the `dialect` plugin is installed. One overlap, resolved in favour of that skill: its banned-words list and this catalogue cover much of the same ground at the sentence level. The division is direction and scope. That one writes requirements and works one sentence at a time. This one reads requirements somebody else wrote and adds the set-level pass, which is where the conflicts and the gaps are, and which that skill structurally cannot do.
- **`/ears`.** Sequential, and it is the repair for structure, if the `dialect` plugin is installed. A requirement that fits no EARS template is usually the same requirement this flags as not singular or as missing its trigger.
- **`/examples`.** Complementary, and the more powerful of the two for ambiguity. This finds requirements that are written badly. That finds requirements that are written well and understood two ways, which no textual audit can catch. Run this on a document, that on the requirements that survive.
- **`/invest`.** Sequential, and it is the gate afterwards. This grades how the specification is written. That grades whether each item can actually be picked up and executed.
- **`/ubiquitous`.** Reinforcing, if the `dialect` plugin is installed. Inconsistent terminology is a set-level finding here and a resolved glossary there.
- **`/redteam`.** Complementary, if the `decide` plugin is installed. That attacks whether the specification is right. This checks whether it can be acted on at all, which is a different question and a cheaper one, and it should run first.

## Before you send

- Were the requirements checked against the code, not only against themselves?
- Was the whole document read before any part of it was audited?
- Does every finding carry a location and the characteristic it violates?
- Was the set-level pass actually run, with requirements grouped by what they constrain and read together?
- Were conflicts looked for deliberately, rather than only noticed?
- Were the standard gaps checked: error paths, empty and maximum cases, retries, migration of existing data, and authorisation?
- Is every finding graded by consequence rather than counted?
- Are minor findings capped, with the number omitted stated?
- Does every blocking finding come with a question rather than a wording fix that makes the decision?
- Was the document left unrewritten?
- Is there a one-line verdict on whether this can be executed as written?
