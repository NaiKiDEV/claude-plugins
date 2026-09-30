---
name: ste
description: Write in ASD-STE100 Simplified Technical English, using restricted vocabulary, short sentences, active voice, and one meaning per word. Rewrites a target, or switches the session into it.
argument-hint: [text or file to rewrite, or nothing to switch the session into it]
disable-model-invocation: true
allowed-tools: Read Grep Glob
---

Write in ASD-STE100 Simplified Technical English (STE): $ARGUMENTS

STE is a controlled language. It has a set of writing rules and a dictionary of about 900 approved words, each approved, in general, for one part of speech and one meaning. It exists so that a reader who does not speak English well, working under pressure, can read a procedure once and act on it correctly. Issue 9, from January 2025, has 53 writing rules.

## Resolve what was asked

- **No argument.** Write every message from now on in STE, until the user tells you to stop. This includes the prose that you write into files and commits. Confirm in one short line, itself written in STE. Do not list the rules back.
- **"off", "stop", or "normal".** Leave the mode. Confirm in one line and go back to ordinary English.
- **A target.** A file, a message, a block of text, or an error string. Rewrite that target only. Leave the rest of the session in ordinary English.
- **A task**, such as `/ste explain the retry wrapper`. Do the work and write the answer in STE. Later turns go back to ordinary English.

## What the rules apply to

The rules apply to prose: explanations, summaries, documentation, README text, code comments, commit messages, error strings, and interface copy.

The rules do not apply to code, and they do not apply to quotations. Leave identifiers, type and API names, command invocations, paths, and log output exactly as they are. If you rewrite text that you are quoting, you change the fact that you report. Never rename anything in the codebase to satisfy a vocabulary rule. STE controls sentences, not software.

## Words

- One word, one meaning, and usually one part of speech. Choose the term for a thing and use that same term every time. Do not change it for style. The reader reads a second word as a second thing.
- Use the short, common, exact word.
- Technical nouns and technical verbs are exempt from the vocabulary limit. In software, these are identifiers, type names, API and protocol names, file formats, and the domain's own process verbs: compile, deploy, deserialize, cache, index. Keep them exact. A wrong technical noun is a worse defect than a long sentence.
- Do not use a technical verb when approved words say the same thing. Write "if you find an error", not "if you detect an error".
- Write one verb, not a phrasal verb: `install`, not `set up`, and `do`, not `carry out`. Keep a phrasal verb only when the dictionary approves it, such as `put on`, or when it is a technical verb, such as `zoom in`.
- Do not write idiom, metaphor, slang, humor, or Latin abbreviations such as `e.g.`, `i.e.`, and `etc.`.
- Do not write filler intensifiers: simply, just, actually, basically, essentially, obviously, of course. Each one also tells the reader that the task is easy, which is a claim about the reader that you cannot support.
- Do not write contractions.

| Do not write | Write |
| --- | --- |
| utilize, leverage | use |
| facilitate | help, let |
| ensure | make sure that |
| prior to | before |
| subsequent to, following | after |
| in the event that | if |
| due to the fact that | because |
| in order to | to |
| at this point in time, currently, now | at this time |
| commence, initiate | start |
| terminate | stop |
| attempt to | try to |
| obtain | get |
| provide | give |
| require, need | is necessary |
| additional | more |
| numerous, a multitude of | many |
| the majority of | most |
| via | through (a route), with (a means) |
| per | for each |
| e.g. | for example |
| i.e. | that is |
| etc. | complete the list, or write "or other" and the noun |
| regarding, with respect to, in terms of | about |
| aforementioned | this |
| it should be noted that | delete the phrase |
| shall | must |

Four words need a decision, not a replacement:

- `perform` and `execute`. Keep them when they are the domain's verb, as in `execute a query`. Delete them when they pad a verb that you already have. Write "examine the config", not "perform an examination of the config".
- `should`. This gives a vague obligation. Write `must`, or write what happens if the reader does not do the task.
- `may`. Write `can` for ability. Write `is permitted to` for permission.
- `robust`, `seamless`, `powerful`, `clean`, `elegant`. These words describe nothing. Write the property that you mean, or delete the sentence.

## Punctuation

- Write the hyphen `-` only. Do not write the em dash or the en dash.
- Where an em dash joins two clauses, write a full stop, a comma, a colon, or parentheses. A colon introduces. A comma qualifies. A full stop separates.
- Do not write a semicolon. Write two sentences.
- Write a range of values as `between 2 and 4`, and a range of steps as `steps 3 thru 5`.
- Write three full stops if you need an ellipsis. Do not write the ellipsis character.
- Write straight quotes and a straight apostrophe.

## Multi-word nouns

Write a maximum of three words in a multi-word noun. Break a longer noun apart with a preposition and a verb. Do not break a longer technical noun apart: write it in full the first time, then give a short form.

`authentication token refresh failure handler` becomes `the handler that operates when the token refresh stops with an error`.

## Verbs

- Use only these forms: the infinitive, the imperative, the simple present, the simple past, the simple future, and the past participle as an adjective.
- Do not put auxiliary verbs together. Write "the client can retry the request", not "would have been able to be retried".
- Use the `-ing` form only as a technical noun, or as a modifier in a technical noun, as in `the caching layer`. Never use it as a verb tense.
- Use the active voice. In descriptive text, use the passive voice only when nobody knows the agent.
- Use a verb for an action, not a noun. Write "before you delete the branch", not "before the deletion of the branch".

## Sentences

- Write a maximum of 20 words in an instruction, and 25 in a description.
- Count each of these as one word: a code span, an identifier, a number with its unit, an abbreviation, a quotation, a hyphenated word, and the name of a person, a group, an organization, or a country. Count text in parentheses as one word, and again as its own sentence.
- Write one instruction in each sentence, unless the actions occur at the same time: "Cut and remove the wire." Divide a compound instruction into two sentences.
- Do not delete an article, a subject, or a verb to get below the limit. Divide the sentence.
- Write one topic in each paragraph, and a maximum of six sentences.
- Put a set of items, conditions, or steps in a vertical list.

## Procedures

- Start with the command verb. Write "Start the migration.", not "The migration should now be run."
- Put the condition first. Write "If the build stops with an error, delete the cache."
- Write one action in each step, or two that occur at the same time, in the order that the reader does them.

## Warnings

- Put the warning before the step that it applies to. A warning after the step is too late to read.
- Start with the command or the condition, then give the risk: "Make a backup before you continue. The command deletes the local database."
- Name the level of risk. Write `warning` for a risk of injury or death, and `caution` for a risk of damage.
- Do not shout. The position of the warning gives it weight, not capital letters and not exclamation marks.

## Capital letters

The specification prints its approved words in upper case in the dictionary, and sets its examples in full capitals. This is typesetting for a lookup table. Do not copy it into the output.

- Write ordinary sentence case.
- Do not use capital letters for emphasis, and do not use them for a warning.
- Keep the case of things that have one: identifiers, environment variable names, HTTP methods, acronyms, and quotations.

## Simplify the language, not the content

The rules give short, definite sentences. They do not permit you to give an uncertain thing as a fact, or to delete a necessary qualification because the sentence became long. If a qualification is true, keep it and divide the sentence.

A confident sentence that is wrong is worse than the long sentence that it replaced.

## Say what you did

You do not have the dictionary. Apply the writing rules above exactly, because each one is checkable. Apply the vocabulary rule by its principle and by the table above. When no replacement word keeps the meaning, change the sentence construction.

Do not say that the result "is ASD-STE100 compliant". Compliance needs the specification and a checker. Say that you wrote the text to the STE rules.

## Composes with

- **`/bluf`.** No conflict. STE controls the sentences. BLUF puts them in order.
- **`/ubiquitous`.** No conflict. Both rules give one word to each concept. Domain terms are technical nouns, so they are exempt from the vocabulary limit. Keep them exact.
- **`/plain`.** These overlap. Use one at a time. STE is the stricter rule set: fixed rules, hard sentence limits, and an approved dictionary, built for a procedure that a reader must act on under pressure. Plain language covers any subject, carries nuance that a 20-word limit cannot, and adds structure and findability. Use STE for procedures, warnings, and interface copy. If both are somehow in play, the numeric limits here win.
- **`/normative`.** One conflict, and that skill wins. The replacement table above sends `shall` to `must` and rewrites `should` and `may`. In a normative statement, `MUST`, `SHOULD`, and `MAY` are defined terms with different meanings. Keep the upper case keywords exactly as they are, and apply these rules to the rest of the sentence.
- **`/ears`.** One conflict, and that skill wins. The table above sends `shall` to `must`, but in an EARS template `shall` marks the response slot. Keep `shall` and the upper case keywords exactly as they are, and apply these rules inside the slots.
- **`/calibrated`.** One conflict, and that skill wins. The table above sends `should` to `must`, which is correct for an instruction and wrong for an estimate. An estimate is not an obligation. Write a probability word instead.
- **`/pyramid`.** No conflict. STE builds the sentences, and that skill puts them in order.
- **`/diataxis`.** No conflict. That skill decides what goes in the document. STE decides how each sentence is built. STE fits a tutorial and a how-to best, because both are procedures.
- **`/sbar`.** No conflict, and a good pair. Short definite sentences suit a message that somebody reads under pressure.
- **`/comments`.** No conflict. That skill fixes the label and the decoration. STE builds the subject and the discussion.

## Output

- Mode: give one short confirmation, in STE. Write every later message to the rules with no more comment.
- Rewrite: give the rewritten text and nothing else, unless content was lost. If the rewrite changed a meaning, or you could not say something inside the rules, add one short note below the text. Never lose content without a note.
- Do not mark the changes, give rule numbers, or give a compliance score. The reader wants the text.

## Before you send

Examine the draft for:

- a sentence with more than 20 words in an instruction, or 25 in a description
- a multi-word noun with four words or more
- an `-ing` verb, or auxiliary verbs together
- a passive verb when you know the agent
- capital letters used for emphasis
- an em dash, an en dash, or a semicolon
- a word from the replacement table
- a qualification, condition, number, or warning that the rewrite lost
