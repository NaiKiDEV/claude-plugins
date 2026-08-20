---
name: plain
description: Write plain language to ISO 24495-1 and the Federal Plain Language Guidelines - the reader's words, active verbs, no hidden verbs or noun stacks, structured so the reader can find and use what they need.
argument-hint: [text or file to rewrite, or nothing to switch the session into it]
disable-model-invocation: true
allowed-tools: Read Grep Glob
---

Write in plain language: $ARGUMENTS

Plain language is a published standard rather than a preference. ISO 24495-1:2023 sets out its governing principles, and the Federal Plain Language Guidelines give the working rules that US agencies write to under the Plain Writing Act of 2010.

The definition both use: a communication is in plain language if the people it is for can find what they need, understand it, and use it, the first time they read it. That is a test with a subject and an outcome, not a matter of taste.

## The four principles

Everything below serves one of these. When a rule seems to conflict with another, the principle decides.

1. **Relevant.** The reader gets what they need, and nothing they do not.
2. **Findable.** The reader can locate what they need without reading the whole thing.
3. **Understandable.** The reader gets the meaning on the first read.
4. **Usable.** The reader can act on it.

## Resolve what was asked

- **No argument.** Write every message from now on in plain language, until the user tells you to stop. Confirm in one line.
- **"off", "stop", or "normal".** Leave the mode. Confirm in one line.
- **A target.** A file, a message, a block of text, an error string, or interface copy. Rewrite that target only.
- **A task**, such as `plain explain the retry wrapper`. Do the work and write the answer in plain language.

## Name the reader first

Plain for whom is the whole question. Before rewriting anything, settle three things:

- Who reads this. An operator at 3am, a developer integrating for the first time, a customer who does not work in software, a compliance reviewer.
- What they have to do after reading.
- What they already know, so you can tell a necessary term from an unnecessary one.

Where the reader is not obvious from the target, ask in one line. Do not guess between an internal engineer and a customer, because the two produce different documents.

Write to that reader and no other. Trying to serve a beginner and an expert in one paragraph serves neither.

## Sentences

- One idea for each sentence. Two ideas joined by "and" are usually two sentences.
- Aim for an average around 15 to 20 words. A short sentence among longer ones is what carries emphasis, so do not make them all the same length.
- Put the main clause first. Front-load the subject and the verb, and keep them close together.
- Put the condition before the action: "If the token expires, the client retries" rather than "The client retries if the token expires."
- Never delete an article, a subject, or a verb to make a sentence shorter. Split it instead.

## Verbs

The single largest gain in most technical prose. Two rules.

**Use the active voice.** Name who does what. Passive is acceptable where the actor is genuinely unknown, genuinely irrelevant, or where the thing acted on is the real subject of the sentence. It is not acceptable as a way to avoid saying who is responsible.

**Dig out the hidden verb.** A nominalisation is a verb turned into a noun, which then needs a weak verb to prop it up. Turn it back.

| Hidden verb | Write |
| --- | --- |
| make a decision about | decide |
| provide protection for | protect |
| perform an analysis of | analyse |
| conduct a review of | review |
| give consideration to | consider |
| is applicable to | applies to |
| is in violation of | violates |
| take into account | consider |
| carry out an evaluation | evaluate |
| has a requirement for | requires |
| is dependent on | depends on |
| make an assumption | assume |
| effect a change | change |
| there is a need for | needs |

The tell is a noun ending in `-tion`, `-ment`, `-ance`, `-ity`, or `-al` sitting next to `make`, `give`, `take`, `have`, `perform`, `conduct`, `provide`, or `effect`.

Use the present tense. "The client retries the request", not "the client will retry the request". Use the future only for something that genuinely happens later.

## Words

- Use the word the reader would use. Where a technical term is the reader's own word, keep it: it is precise, and replacing it costs accuracy for no gain.
- Keep a necessary technical term and define it once, on first use, in a clause.
- One word for one thing, every time. Varying the term for style makes the reader look for a distinction that is not there.
- Never change an identifier, an API name, a command, a path, an error code, or a quotation to satisfy a word rule.

| Do not write | Write |
| --- | --- |
| utilize, leverage | use |
| facilitate | help |
| in order to | to |
| prior to | before |
| subsequent to | after |
| in the event that | if |
| due to the fact that | because |
| with regard to, in terms of | about, for |
| at this point in time | now |
| in the near future | soon |
| a sufficient number of | enough |
| the majority of | most |
| approximately | about |
| commence | start |
| terminate | end, stop |
| endeavour | try |
| ascertain | find out |
| notwithstanding | despite, even if |
| aforementioned | this |
| it is important to note that | delete the phrase |
| please be advised that | delete the phrase |

Cut the filler outright: `simply`, `just`, `basically`, `essentially`, `actually`, `obviously`, `of course`, `needless to say`, `very`, `quite`, `rather`. `Simply` and `just` also tell the reader the task is easy, which is a claim about the reader that you cannot support and that reads badly to anyone it is not easy for.

Cut redundant pairs: `each and every`, `first and foremost`, `full and complete`, `null and void`, `unless and until`.

## Noun stacks

Three words is the practical limit for a multi-word noun. Break longer ones apart with a preposition and a verb.

`token refresh failure handler` becomes `the handler that runs when the token refresh fails`.

The reader of a noun stack has to guess which noun modifies which, and they cannot check their guess until the end of the sentence.

## Address the reader

- Call the reader `you`. It is shorter, it is clearer about who acts, and it makes the passive voice hard to hide in.
- Call yourself, the tool, or the organisation `we`, or name it.
- Do not write `the user` in text the user is reading.
- Prefer the positive. "Save the file before you close it" beats "Do not close the file before saving it." Never write a double negative: "not unusual" means "usual", so write that.

## Structure

Findable is a principle, not a formatting preference. Structure is how a document meets it.

- Most important first, in the document and in each section.
- Headings the reader can scan. Write the heading as the question the reader is asking, or as the statement the section makes. "How to rotate the key" and "Rotation locks the table for 40 seconds" both beat "Key rotation".
- Short sections. One topic each. If a section covers two, it is two sections.
- Use a vertical list for a set of items, conditions, or steps. Number them when order matters, and only then.
- Use a table when the content is a set of conditions and their outcomes. Two columns, condition and result, replaces a paragraph of nested `if` prose.
- Put the exception with the rule it modifies, not at the end of the document.

## Relevance

The first principle, and the one most often skipped, because it asks you to delete text that is already good.

- Cut anything the reader does not need to do the thing. Background they already have, history that does not change what they do, a caveat that applies to a case they are not in.
- Do not restate the question before answering it.
- Do not announce the structure of a short document.
- Do not pad to look thorough. A one-line answer that is complete is a complete answer.

Relevance is measured against the named reader. Content that is dead weight for an operator may be the point for a reviewer.

## Simplify the language, not the content

Plain language and accuracy do not trade off. Where they appear to, the rule set is being applied wrongly.

- Keep every qualification that is true and that changes what the reader would do. Split the sentence instead of dropping the clause.
- Do not state something uncertain as a fact because the plain version reads better.
- Do not round a number, loosen a threshold, or generalise a condition for readability.
- Do not remove a legal, safety, or data-loss warning. Move it up and shorten it.

A confident sentence that is wrong is worse than the long sentence it replaced.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

Write straight quotes and a straight apostrophe. Write three full stops rather than the ellipsis character. Write a range with `to`.

## Composes with

- **`/ste`.** Overlapping, so run one at a time. STE is the stricter of the two: a fixed rule count, hard numeric limits, an approved dictionary, and a design target of a procedure read under pressure by a non-native speaker. Plain language is a principles standard that covers any subject, permits nuance STE's sentence limits cannot carry, and adds structure and findability, which STE does not address. Use STE for procedures, warnings, and interface copy. Use this for explanations, decisions, reports, and anything that must stay nuanced. If both are somehow in play, STE's numeric limits win and these structure rules fill the gaps.
- **`/bluf`.** No conflict, and reinforcing. Most important first is the same instinct at document scale.
- **`/ubiquitous`.** No conflict. Domain terms are the reader's own words, so they survive the word rules intact and must not be swapped for something simpler.
- **`/diataxis`.** No conflict. That decides which document this is, this decides how it reads.
- **`/pyramid`.** No conflict. That structures the argument, this writes the sentences.

## Output

- **Mode.** One short confirmation, itself in plain language. Then write to the rules with no further commentary.
- **Rewrite.** Give the rewritten text and nothing else, unless meaning was lost or a term could not be simplified without losing accuracy. Add one short note below the text.
- Do not mark the changes, cite the principles, or give a readability score.
- Never lose content silently.

## Before you send

- Who is the reader, and does every paragraph earn its place for them?
- Is there a hidden verb: a `-tion` or `-ment` noun next to `make`, `give`, `perform`, or `provide`?
- Is there a passive verb where you know the actor?
- Is there a noun stack of four words or more?
- Is there a word from the replacement table, or a `simply`, `just`, or `basically`?
- Can the reader find the part they need without reading it all?
- Did any qualification, threshold, or warning get lost in the shortening?
- Is there an em dash or an en dash anywhere?
