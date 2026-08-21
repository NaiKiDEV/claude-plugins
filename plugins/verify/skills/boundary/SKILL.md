---
name: boundary
description: Derive test cases from the input space rather than from the code, using equivalence partitioning and boundary value analysis, then report which classes the existing tests already cover.
argument-hint: [the function, endpoint, or input to analyse]
disable-model-invocation: true
allowed-tools: Bash Read Grep Glob
disallowed-tools: Edit Write NotebookEdit
---

Partition the input space of: $ARGUMENTS

Equivalence partitioning and boundary value analysis are the oldest techniques in the discipline and still the highest yield per minute spent. Both are specified in BS 7925-2 and carried into ISO/IEC/IEEE 29119-4.

The argument is in two halves. **Equivalence partitioning** says the input space divides into classes whose members the code treats identically, so one value from each class tests the class, and a hundred more from the same class test nothing. **Boundary value analysis** says the errors cluster at the edges of those classes, because that is where the comparison operators are, so the edges get tested exhaustively while the interiors get one value each.

Together they answer the question that makes test suites shallow: not "how do I test more" but "which inputs are actually different?"

This is the correction for a common agent failure: tests written by reading the implementation, which reproduce the implementation's own assumptions and pass by construction. Partitioning derives cases from the input space, so it finds the class the implementation forgot.

## Resolve what to analyse

- **A function or method.** Its parameters, jointly.
- **An endpoint.** Path parameters, query string, body, headers, and auth state, all of which are input.
- **A form or a parser.** The accepted grammar is the input space.
- **A whole module.** Too large. Ask which entry point, or pick the one with the most callers and say you picked it.
- **Nothing.** Take the code under discussion and name its entry point in one line.

## Check before you partition

Read the signature and the validation before deriving anything. Much of the input space is already closed off, and partitioning a space the type system has eliminated is wasted effort.

- **What do the types already exclude?** A non-nullable enum parameter has no null class and three valid classes, not an infinite space.
- **What does the validation layer reject?** A schema at the boundary means the interesting classes are the ones the schema admits, plus the ones it should reject and does not.
- **What tests exist?** Find them first. The output of this skill is the gap, and you cannot report a gap without knowing what is covered.

## 1. Partition

For each input, list the classes. Both kinds, and the second is the one that gets skipped.

- **Valid classes.** The distinct treatments the code should give to acceptable input.
- **Invalid classes.** Each way input can be unacceptable, kept separate. "Bad input" is not one class: too long, wrong type, wrong encoding, and out of range are four, and code that handles one often mishandles the others.

Two classes are the same class only if you can say why the code cannot distinguish them. Where you are unsure, keep them separate and mark it.

## 2. Take the boundaries

For every ordered class, the boundary is where the comparison lives, and off-by-one is the most common defect in the discipline. Test both sides of every edge.

For a range admitting `min` through `max`: `min - 1`, `min`, `min + 1`, `max - 1`, `max`, `max + 1`. Where the type permits, the values just outside the representable range too.

The type-specific edges worth walking, because they are where real defects sit:

| Type | Edges that find defects |
| --- | --- |
| **Integer** | `0`, `-1`, `1`, min and max of the width, overflow at the boundary |
| **Float** | `0`, `-0`, `NaN`, infinities, the smallest denormal, precision loss near the boundary |
| **String** | empty, one character, whitespace only, maximum length, one over, combining characters, astral-plane characters, embedded null, leading and trailing space |
| **Collection** | empty, one element, two elements, duplicates, maximum size, nested empty |
| **Absence** | `null`, `undefined`, missing key, present key with empty value. These are four different inputs and are frequently handled by three code paths |
| **Date and time** | epoch, DST transitions in the relevant zone, leap day, leap second, year boundaries, the maximum representable date |
| **Identifier** | the empty identifier, one that exists, one that does not, one belonging to another tenant |

Ordering is an input too, wherever the code takes a collection. Empty, sorted, reverse-sorted, and containing duplicates are distinct classes for anything that sorts, dedupes, or paginates.

## 3. Combine, without exploding

The product of every class of every parameter is unaffordable and mostly redundant.

Default to **each choice**: every class of every parameter appears in at least one case, chosen to keep the case count near the largest single parameter's class count. Escalate to **all pairs** only where parameters genuinely interact, and say which interaction justified it. Reserve the full product for a small number of parameters where the interaction is the whole point.

State which strategy you used. A reader cannot judge the case list without knowing whether combinations were covered or sampled.

## 4. Check what is covered

This is the empirical half, and it is what separates this skill from a checklist.

Find the existing tests for the target and map each to the classes it exercises. Then run them, because a test that exists is not a test that passes, and a skipped test covers nothing.

Report three groups: classes covered by a passing test, classes covered only by a skipped or failing test, and classes with nothing at all. The third group is the finding.

Do not report a class as covered because a test's name suggests it. Read the assertion.

## Output

- The entry point, and the inputs treated as its space.
- A table of classes: input, class, representative value, boundary values, covered or not, and the test that covers it.
- The combination strategy used.
- **The uncovered classes, in priority order.** Rank by the cost of the class being wrong, not by how easy the test is to write.
- Any class the code appears to handle by accident: the value falls through to a default that happens to be right. These are the ones that break during refactors.
- Where partitioning revealed a specification gap rather than a test gap, say so. "What should this return for an empty list" is often unanswered rather than untested, and that is a more useful finding.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/property`.** Complementary, and they divide cleanly. This enumerates specific interesting values; that states what must hold for all of them. Where a class is large and its rule is uniform, a property covers it better than a representative value.
- **`/fuzz`, when present.** Partitioning finds the classes you thought of. Fuzzing finds the ones you did not. Neither replaces the other.
- **`/mutate`.** Sequential and reinforcing. This says which classes are untested; that says whether the tests for the covered classes actually assert anything.
- **`/repro`.** Reversed direction. This derives cases from the space, that reduces a case you already have.
- **`/normative`.** Reinforcing when the specification is the thing in doubt, if the `dialect` plugin is installed. A class with no defined behaviour is a `MUST` nobody wrote.

## Before you send

- Are invalid classes enumerated separately rather than collapsed into "bad input"?
- Does every ordered class have both sides of both edges?
- Are `null`, `undefined`, missing, and empty treated as four inputs where the language distinguishes them?
- Is the combination strategy named?
- Was coverage established by reading assertions and running the tests, not by reading test names?
- Are skipped and failing tests reported as not covering their class?
- Are uncovered classes ranked by consequence rather than by ease?
- Is a specification gap reported as a specification gap rather than as a missing test?
