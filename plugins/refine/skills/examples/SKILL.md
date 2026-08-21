---
name: examples
description: Turn acceptance criteria into concrete examples with real values, and separate what is settled from what nobody can answer. Wynne's example mapping, where the open questions are an output rather than something to resolve by guessing.
argument-hint: [the story, item, or criteria to map, or nothing to use what is on the table]
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit
---

Map this to rules and examples: $ARGUMENTS

Matt Wynne published example mapping in 2015 as a timeboxed conversation using four colours of index card: yellow for the item, blue for each rule, green for a concrete example of a rule, and red for a question nobody present can answer. It is the practical form of Gojko Adzic's specification by example and the discovery half of BDD, reduced to something that finishes in twenty-five minutes.

The failure it addresses is agreement on an abstraction. "Handles invalid input correctly" is a sentence everyone approves and nobody reads the same way. It survives review because reviewing it means reading it, and reading it is the exact operation that cannot detect the problem. The disagreement surfaces during implementation, or after, when it is a defect rather than a question.

Concrete examples break the tie because two people cannot agree on `-1` returning `400` while privately meaning different things.

For an agent this matters more, not less. A model asked to implement an ambiguous rule will not stop. It will pick a reading, implement it fluently, and produce something that looks finished and encodes a decision nobody made. **The red cards are the guard against that**, and they are the reason this skill exists.

## Resolve what is being mapped

- **An argument.** Map that.
- **Nothing.** Take the item on the table and restate it in one line before starting.
- **Several items.** Map one. Say which, and why that one.
- **Nothing on the table.** Say so and stop.

## Check before you map

Look for the answers before generating questions, because a red card that a five-second search would have closed is noise, and enough of them make the real ones invisible.

- Read the code where the behaviour already partly exists. What it does now is often the answer to the rule nobody stated.
- Read the tests. An existing test is a concrete example somebody already agreed to, and it belongs on the map as a green card rather than being rediscovered.
- Read the issue, the ticket, and any linked discussion.
- Check the project for a documented convention: how errors are shaped, how validation is reported, what the API returns for a missing resource.

Anything you find, put on the map with its source. A rule taken from `src/api/errors.ts:42` is stronger than one you inferred, and it should be visibly different.

## 1. State the item

One line, at the top. What it is, and who it is for.

If restating it in one line is hard, that is the first finding. An item that cannot be said in a sentence has not been scoped, and mapping it will produce rules belonging to two different things.

## 2. Extract the rules

The rules are the acceptance criteria: the constraints that must hold for the item to be correct.

- **One rule per card.** A rule with an `and` in it is two rules, and they can be satisfied separately, which means they can fail separately.
- **State the rule, not the implementation.** "Rejects a request without a tenant header" is a rule. "Checks the header in the middleware" is a design decision.
- **Include the rules that are obvious.** Obvious rules are where the real disagreements hide, because nobody says them out loud and each person's obvious version is slightly different.
- **Include the negative rules.** What must not happen, what must not be visible, what must not be retried.
- **Mark the source of each rule.** Stated by the user, found in the code, found in a test, or inferred by you. An inferred rule is a proposal, and it should be labelled as one, because otherwise it enters the specification with the same weight as one somebody actually asked for.

**Count the rules when you are done.** More than about six means the item is too big to refine as one unit. Stop, say so, and send it to `/split`. Continuing to map produces a comprehensive specification of something that should not be built in one piece.

## 3. Make each rule concrete

Under every rule, at least one example. This is the step the method exists for, and the step most often skipped by restating the rule in different words.

An example is concrete when it has **real values**.

- Not "an invalid email". The string `a@b`, and what happens to it.
- Not "a large payload". `11 MB` against a `10 MB` limit, and the response.
- Not "an expired token". A token that expired `1 second` ago, and separately, one that expires `1 second` from now.

Write each as input and outcome. `Given` and `Then` if that reads naturally, or a table where the rule has several cases, which is usually clearer and always shorter.

For each rule, work through:

- **The typical case.** One example of the rule simply holding.
- **The boundary.** The value at the edge and the value one step past it. Almost every rule with a threshold in it has an off-by-one disagreement waiting, and this is where it appears.
- **The case that breaks it.** Where the rule does not apply, or where another rule wins. Two rules that collide on one example is the most valuable thing this step produces.
- **The case somebody will actually hit.** Empty, zero, absent, duplicated, already-deleted, concurrent.

Where a rule needs more than about five examples to pin down, the rule is doing too much and should be two rules.

Where you cannot produce a concrete example for a rule, that is not a failure of imagination. **It means the rule is not yet a rule**, and it becomes a red card.

## 4. Raise the questions

A red card is anything you cannot answer from the conversation, the code, or the project's documented conventions.

This is the part an agent gets wrong by default, so it is stated as a prohibition:

> **Do not resolve a red card by choosing.** Do not implement the reading you consider most likely. Do not write "assuming X" and continue as though X were established. Raise it, and stop needing it.

What becomes a red card:

- A rule with no example, because nobody knows what it means concretely.
- Two rules that contradict on a specific example, with that example attached.
- A boundary nobody has set. Not "there should be a limit" but "what is the limit".
- A case with no defined behaviour: what happens when it is already deleted, when both arrive at once, when the upstream call fails halfway.
- A term used in two senses. Where the `dialect` plugin is installed, `/ubiquitous` is the repair.
- An assumption you find yourself making in order to write an example.

For each red card, write the question so it can be answered in one line, and say **what you would do differently depending on the answer**. A question whose answers all produce the same work is not blocking, and should be noted rather than raised.

Where a question genuinely does not block the whole item, say which slices it blocks and which can proceed. That is more useful than a flat blocked, and it is usually true.

## 5. Read the map

The card counts are the readiness verdict. This is the method's own signal and it should be reported plainly.

| Shape | Means | Do |
| --- | --- | --- |
| Few rules, examples under each, no red cards | Ready | Proceed |
| Many red cards | Not understood | Answer the questions before any work starts |
| More than about six blue cards | Too big | `/split` before refining further |
| Rules with no examples under them | Not specified, only described | Make them concrete or turn them red |
| Everything agreed immediately, nothing raised | Probably not actually examined | Go back to the boundaries and the collisions |

The last row deserves saying out loud. A map that produces no questions at all is more often a sign that nothing was examined than a sign that everything was clear, and an agent producing it should be suspicious of itself.

## Output

- **The item**, one line.
- **The rules**, each with its source tag, each with its examples underneath. A table where the rule has several cases.
- **The open questions**, listed separately and last, each with what would change depending on the answer, and each marked as blocking the item or blocking a named part of it.
- **The verdict**, from the card counts, in one line: ready, blocked on `n` questions, or too big to refine as one item.
- **The inferred rules**, called out as proposals rather than left mixed in with the ones somebody asked for.

Do not produce a specification document. This produces rules, examples, and questions. Turning them into requirement statements belongs elsewhere, to `/normative` or `/ears` where the `dialect` plugin is installed, and turning them into tests is the implementation.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/split`.** Sequential, and this triggers it. More than about six rules is the signal, and it is a better size test than reading the item and forming an impression.
- **`/invest`.** Sequential, and this is the repair for one letter. An item failing **T** comes here, because concrete examples are what testable means. The examples produced here are what the check in the brief is written against.
- **`/smells`.** Complementary. That audits requirements that already exist for how they are written. This produces the examples that show what they mean. A requirement can pass a smell audit and still be understood two ways, and only an example catches that.
- **`/boundary`.** Reinforcing, if the `verify` plugin is installed. Where a rule is about an input range, equivalence partitioning derives the boundary cases systematically rather than by inspection, and its output drops straight in as green cards.
- **`/property`.** Complementary, if the `verify` plugin is installed. A rule that holds over all inputs rather than at specific values is an invariant, and examples are the weaker way to state it. Where a rule generates more than about five examples that are all the same shape, it is probably a property.
- **`/ubiquitous`.** Reinforcing, if the `dialect` plugin is installed. A term meaning two things is the most common red card, and that is the skill that settles it.
- **`/normative`** and **`/ears`.** Sequential, if the `dialect` plugin is installed. Rules that survive this become requirement statements there, with strength and with a fixed sentence shape.

## Before you send

- Was the code, the tests, and the project's conventions read before questions were generated?
- Is the item stated in one line?
- Is every rule a single rule, with no `and` joining two constraints?
- Does every rule carry a source tag, and are inferred rules labelled as proposals?
- Are there more than about six rules, and if so, was that reported as a size problem rather than mapped through?
- Does every rule have at least one example with real values in it, rather than a restatement?
- Was the boundary case written for every rule that has a threshold?
- Were rule collisions looked for, with the specific example that collides?
- Is every question written so it can be answered in one line?
- Does every question say what would change depending on the answer?
- Was any ambiguity resolved by choosing a reading rather than raising it?
- Is the verdict stated from the card counts?
