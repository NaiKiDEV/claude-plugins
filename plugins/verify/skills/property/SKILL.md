---
name: property
description: Find the invariants that must hold over all inputs and test those instead of examples, using whichever property-based framework the project already has.
argument-hint: [the function or module to find properties for]
disable-model-invocation: true
allowed-tools: Bash Read Grep Glob Write
disallowed-tools: Edit NotebookEdit
---

Find properties for: $ARGUMENTS

Claessen and Hughes's QuickCheck (*QuickCheck: A Lightweight Tool for Random Testing of Haskell Programs*, ICFP 2000) changed what a test is. An example test asserts that one input produces one output. A property asserts something true of every input, and the framework goes looking for a counterexample.

The value is not the volume of inputs. It is that stating the property forces you to say what the function actually guarantees, and that question is frequently unanswerable for code that has been working for years. Half the findings here come from failing to state a property, not from a property failing.

The hard part is finding properties. "Test that it works" is not one, and an agent asked for properties will otherwise produce assertions that restate the implementation, which pass by construction and detect nothing.

## Resolve the target

- **A pure function.** The ideal case.
- **A function with effects.** Properties still apply to the pure core. Separate them, and say which part is untestable this way.
- **A data structure or a parser.** Round-trip and invariant properties apply directly, and this is where the technique pays best.
- **A whole module.** Pick the two or three functions whose contracts are load-bearing, and say why those.
- **Nothing.** Take the code under discussion and name its entry point.

## Check before you write anything

- **Which framework is already installed?** Read the manifest. `fast-check` for JavaScript and TypeScript, `hypothesis` for Python, `proptest` or `quickcheck` for Rust, `jqwik` for Java, `gopter` or native fuzzing for Go, `ScalaCheck`, `PropEr` or `PropCheck`. Use what is there. Introducing a dependency to write one test is a bad trade and is not this skill's decision to make.
- **Are there existing properties?** If the project already has them, match their style and put new ones beside them.
- **Is there a simple correct reference?** A slow, obviously correct version of the function is the strongest oracle available, and it may already exist as the code you are replacing.

## 1. Find the properties

Work the catalogue. Most functions satisfy two or three of these, and the exercise is to check each one rather than to invent from nothing.

| Pattern | Shape | Fits |
| --- | --- | --- |
| **Round trip** | `decode(encode(x)) == x` | Serialisers, parsers, codecs, migrations up and down |
| **Invariant** | Something is preserved | Sorting preserves length and multiset, transforms preserve totals |
| **Idempotence** | `f(f(x)) == f(x)` | Normalisers, sanitisers, formatters, upserts, deduplication |
| **Commutativity** | Order does not matter | Merges, set operations, independent updates |
| **Oracle** | `f(x) == simple_slow_f(x)` | Optimisations, caches, rewrites. The strongest, when available |
| **Induction** | `f(x + [e])` relates to `f(x)` | Aggregations, folds, incremental computation |
| **Algebraic law** | Associativity, identity, absorption | Combinators, monoids, query builders |
| **Never crashes** | Total on its declared domain | Parsers and anything taking untrusted input |
| **Metamorphic** | Change the input in a known way, predict the change in output | Anything with no oracle at all: rankers, solvers, models |

The metamorphic row is the escape hatch for the genuinely oracle-free case. You cannot say what a search ranking should be, but you can say that adding an irrelevant document should not reorder the top ten, and that is a testable claim about behaviour nobody can otherwise pin down.

Also look for the properties that should hold and do not. A function that is nearly idempotent is a bug or a missing note in the contract, and finding that out is the point.

## 2. Write generators that reach the interesting inputs

A property is only as good as its generator, and this is where property-based tests quietly stop working.

- **Default generators cluster in the boring middle.** Short strings, small integers, non-empty collections. Bias them towards the boundaries from `/boundary`: empty, one element, maximum size, duplicates, zero, negative, the edges of the representable range.
- **Constrain by construction, not by filtering.** A generator that discards most of what it produces will exhaust the framework's discard budget and silently run a handful of cases. Build valid values directly.
- **Generate the whole state, not one field.** A function taking a record needs every field varied, otherwise the property tests one shape repeatedly.
- **Check the distribution.** Most frameworks can report a breakdown of generated values. Look at it once. A generator that never produced an empty list means the property was never tested on the case most likely to break.

## 3. Run, and read the counterexample

Run more cases than the default when the run is fast. The default is chosen to keep suites quick, not to find rare bugs.

When a property fails, the framework shrinks the counterexample automatically. Read the shrunk case rather than the original: it is the minimal input, and it is usually the diagnosis.

A shrunk counterexample that looks absurd is still a real finding. The two responses are to fix the code or to narrow the property, and narrowing the property means writing down a precondition the contract never stated, which is itself a result worth reporting.

**Record the seed of any failure**, and add the shrunk case as an ordinary example test alongside the property. Property tests are randomised, so without a pinned regression test the case may not recur.

## 4. Report what you could not state

The properties you failed to write are as informative as the ones you wrote.

A function whose behaviour on an empty input nobody can name, an ordering guarantee nobody will commit to, an error case with no defined shape: each is an unspecified contract, and unspecified contracts are what break when someone refactors. List them.

## Output

- The framework used, and that it was already present.
- Each property: its name, the pattern it comes from, and the claim in one line of plain language.
- The generator for each, and any bias applied towards boundary values.
- Results: cases run, failures, and the shrunk counterexample for each failure with its seed.
- Any property that had to be weakened, and the precondition that weakening implies.
- **Properties that could not be stated**, with what is unspecified about each.
- Where tests were written, if any were.

## Writing tests

This skill may create new test files, and that is its only write. Put them where the project already keeps tests, in the style already used there. Do not modify existing tests or any source file: a property that requires the code to change is a finding to report, not a change to make.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/boundary`.** Complementary, and it feeds the generators. That enumerates the specific interesting values; this states the rule that covers a class. Run it first and bias the generators with what it found.
- **`/repro`.** Usually unnecessary after a property failure, since the framework shrinks. Reach for it when the shrinker stops somewhere unhelpful, which happens with stateful or constrained generators.
- **`/differential`.** The oracle pattern in this catalogue is a differential test with the comparison stated as a property. Prefer a property where you can state one, because it outlives the reference implementation.
- **`/mutate`.** Sequential. Properties are the strongest defence against surviving mutants, so run that afterwards to see whether they earned it.
- **`/normative`.** Reinforcing on the output, if the `dialect` plugin is installed. A property is a `MUST` that executes, and the properties you could not state are the requirements nobody wrote.

## Before you send

- Was the framework already in the project, rather than introduced for this?
- Does each property state a guarantee, rather than restate the implementation?
- Was the catalogue worked through, rather than one or two properties invented?
- Are generators biased towards boundary values, and constrained by construction rather than by filtering?
- Was the generated distribution checked at least once?
- Is every failure reported with its shrunk counterexample and seed?
- Was a pinned regression test added for each failure?
- Are the properties that could not be stated reported, with what is unspecified?
- Were only new test files written, with no source file touched?
