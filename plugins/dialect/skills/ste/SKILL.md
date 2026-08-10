---
name: ste
description: Write in ASD-STE100 Simplified Technical English, using restricted vocabulary, short sentences, active voice, and one meaning per word. Rewrites a target, or switches the session into it.
argument-hint: [text or file to rewrite, or nothing to switch the session into it]
disable-model-invocation: true
allowed-tools: Read Grep Glob
---

Write in ASD-STE100 Simplified Technical English (STE): $ARGUMENTS

STE is a controlled language. It has a set of writing rules and a dictionary of about 900 approved words, each approved for one part of speech and one meaning. It exists so that a reader who does not speak English well, working under pressure, can read a procedure once and act on it correctly. Issue 9, from January 2025, has 53 writing rules.

## Resolve what was asked

- **No argument.** Write every message from now on in STE, until the user tells you to stop. Confirm in one short line, itself written in STE. Do not list the rules back.
- **"off", "stop", or "normal".** Leave the mode. Confirm in one line and go back to ordinary English.
- **A target.** A file, a message, a block of text, or an error string. Rewrite that target only. Leave the rest of the session in ordinary English.
- **A task**, such as `/ste explain the retry wrapper`. Do the work and write the answer in STE. Later turns go back to ordinary English.

## What the rules apply to

The rules apply to prose: explanations, summaries, documentation, README text, code comments, commit messages, error strings, and interface copy.

The rules do not apply to code, and they do not apply to quotations. Leave identifiers, type and API names, command invocations, paths, and log output exactly as they are. If you rewrite text that you are quoting, you change the fact that you report. Never rename anything in the codebase to satisfy a vocabulary rule. STE controls sentences, not software.

## Words

- One word, one meaning, one part of speech. Choose the term for a thing and use that same term every time. Do not change it for style. The reader reads a second word as a second thing.
- Use the short, common, exact word.
- Technical names and technical verbs are exempt from the vocabulary limit. In software, these are identifiers, type names, API and protocol names, file formats, and the domain's own process verbs: compile, deploy, deserialize, cache, index. Keep them exact. A wrong technical name is a worse defect than a long sentence.
- Do not write idiom, metaphor, slang, humor, or Latin abbreviations such as `e.g.`, `i.e.`, `etc.`, `via`, and `per`.
- Do not write filler intensifiers: simply, just, actually, basically, essentially, obviously, of course. Each one also tells the reader that the task is easy, which is a claim about the reader that you cannot support.
- Do not write contractions.

| Do not write | Write |
| --- | --- |
| utilize, leverage | use |
| facilitate, enable | help, let |
| ensure | make sure that |
| prior to | before |
| subsequent to, following | after |
| in the event that | if |
| due to the fact that | because |
| in order to | to |
| at this point in time, currently | now |
| approximately | about |
| commence, initiate | start |
| terminate | stop |
| attempt to | try to |
| obtain | get |
| provide | give |
| require | need |
| additional | more |
| numerous, a multitude of | many |
| the majority of | most |
| via | with, by |
| per | for each |
| e.g. | for example |
| i.e. | that is |
| etc. | complete the list |
| regarding, with respect to, in terms of | about, for |
| aforementioned | this |
| it should be noted that | delete the phrase |
| shall | must |

Four words need a decision, not a replacement:

- `perform` and `execute`. Keep them when they are the domain's verb, as in `execute a query`. Delete them when they pad a verb that you already have. Write "check the config", not "perform a check on the config".
- `should`. This gives a vague obligation. Write `must`, or write what happens if the reader does not do the task.
- `may`. Write `can` for ability. Write `is permitted to` for permission.
- `robust`, `seamless`, `powerful`, `clean`, `elegant`. These words describe nothing. Write the property that you mean, or delete the sentence.

## Punctuation

- Write the hyphen `-` only. Do not write the em dash or the en dash.
- Where an em dash joins two clauses, write a full stop, a comma, a colon, or parentheses. A colon introduces. A comma qualifies. A full stop separates.
- Write a range with the word `to`: `20 to 25 words`.
- Write three full stops if you need an ellipsis. Do not write the ellipsis character.
- Write straight quotes and a straight apostrophe.

## Noun clusters

Write a maximum of three words in a multi-word noun. Break a longer noun apart with a preposition and a verb.

`authentication token refresh failure handler` becomes `the handler that runs when the token refresh fails`.

## Verbs

- Use only these forms: the infinitive, the imperative, the simple present, the simple past, the simple future, and the past participle as an adjective.
- Do not put auxiliary verbs together. Write "the client can retry the request", not "would have been able to be retried".
- Use the `-ing` form only as a technical noun, or as a modifier in a technical noun, as in `the caching layer`. Never use it as a verb tense.
- Use the active voice. In descriptive text, use the passive voice only when nobody knows the agent.

## Sentences

- Write a maximum of 20 words in an instruction, and 25 in a description.
- Write one instruction in each sentence. Divide a compound instruction into two sentences.
- Do not delete an article, a subject, or a verb to get below the limit. Divide the sentence.
- Write one topic in each paragraph, and a maximum of six sentences.
- Put a set of items, conditions, or steps in a vertical list.

## Procedures

- Start with the command verb. Write "Run the migration.", not "The migration should now be run."
- Put the condition first. Write "If the build fails, delete the cache."
- Write one action in each step, in the order that the reader does them.

## Warnings

- Put the warning before the step that it applies to. A warning after the step is too late to read.
- Give the condition and the consequence, then the action: "The command deletes the local database. Make a backup before you continue."
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

You do not have the dictionary. Apply the writing rules exactly, because they are complete here and each one is checkable. Apply the vocabulary rule by its principle and by the table above.

Do not say that the result "is ASD-STE100 compliant". Compliance needs the specification and a checker. Say that you wrote the text to the STE rules.

## Composes with

- **`/bluf`.** No conflict. STE controls the sentences. BLUF puts them in order.
- **`/ubiquitous`.** No conflict. Both rules give one word to each concept. Domain terms are technical names, so they are exempt from the vocabulary limit. Keep them exact.

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
- an em dash or an en dash
- a word from the replacement table
