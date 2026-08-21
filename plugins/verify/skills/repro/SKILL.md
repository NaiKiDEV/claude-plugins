---
name: repro
description: Shrink a failure to the smallest input, steps, or code that still triggers it. Delta debugging, with the oracle fixed before any reduction starts.
argument-hint: [the failure to minimize]
disable-model-invocation: true
allowed-tools: Bash Read Grep Glob
disallowed-tools: Edit Write NotebookEdit
---

Minimize this failure: $ARGUMENTS

Zeller and Hildebrandt's delta debugging (*Simplifying and Isolating Failure-Inducing Input*, IEEE TSE 2002) formalised something people already do by hand, badly. Given something that fails, remove parts of it and re-test. Keep removing while it still fails. The algorithm, `ddmin`, does this in a way that terminates at a 1-minimal case rather than at whatever point the person got bored.

The minimal case is usually the diagnosis. Four hundred lines of failing test tell you nothing. The three lines that survive reduction tell you what the bug is about. This is why reduction comes before reading code rather than after.

It is also the correction for a specific agent failure mode: handed a stack trace and a large repro, an agent starts reading source and theorising immediately, and produces a plausible cause for a failure whose actual shape it never established.

## Resolve what fails

- **A failing test, command, or script.** That is the target.
- **A described failure with no runnable case.** There is nothing to shrink. Build the repro first, then come back. Say this rather than reducing a hypothesis.
- **A failure that only occurs in production.** Reduce the input, not the run. If neither the input nor the environment can be reproduced locally, say so and stop.
- **Nothing.** Take the failure under discussion and restate it in one line.

## Check before you reduce

Reduction costs many runs. Some failures need none.

If the stack trace names a line and the cause is legible there, read it and report the fact. If the failure is a type error, a missing import, or a null on a line you can see, the answer costs one `Read`. Reduction is for failures whose *shape* is unclear, not for every failure.

Say plainly when the answer was cheaper than the protocol.

## 1. Fix the oracle first

Everything downstream depends on answering one question mechanically: **does this still fail, in the same way?**

Write it as a command with an exit code. Not an impression, and not a screenshot read by eye.

- **Same way matters.** A reduction that only keeps "exits non-zero" will happily shrink an assertion failure into a syntax error and report it as minimal. Match on the specific signal: the assertion message, the exception type, the exit code, a string in stderr. State what you matched on.
- **Match the symptom, not failure in general.** Piping stderr into a `grep -q` for the exact exception text is an oracle. Testing that the exit code is non-zero is not.
- **Bound the runtime.** A reduction that hangs on some candidate stalls the whole run. Put a timeout on the oracle and treat a timeout as "does not reproduce", unless the hang is itself the bug.

## 2. Establish determinism

`ddmin` assumes the oracle is a function. If it is not, the reduction wanders and the result means nothing.

Run the oracle on the unreduced case several times. If it does not fail every time, stop reducing and deal with that first: find the seed, pin the clock, stub the network, serialise the test, set concurrency to one. Report the flake rate you measured.

A flaky oracle can still be used with repetition, failing if any of N runs fails, at N times the cost. Say so if you take that route, and say what it did to the run time.

## 3. Choose the reduction axis

Reduce along one axis at a time, cheapest first. Most failures shrink on the first axis that applies.

| Axis | What to remove | Typical win |
| --- | --- | --- |
| **Input data** | Lines, records, fields, array elements, characters | Largest, and the script handles it |
| **Steps** | Setup calls, prior test cases, fixtures, seeded rows | Isolates ordering and shared-state bugs |
| **Configuration** | Flags, env vars, options, feature toggles | Names the setting that matters |
| **Code** | Functions, branches, whole modules, stubbed dependencies | Slow, but finds the interacting pair |
| **Versions** | Dependency versions, runtime version | Use `/bisect` instead when it is your own history |

Removing prior test cases deserves naming separately. A test that fails only after another test has run is a shared-state bug, and reduction is how you prove that rather than assert it.

## 4. Run the reduction

For line-oriented input, the bundled script implements `ddmin` directly. Run it from this skill's base directory:

```
node scripts/ddmin.js --input <file> --test <oracle command> --out <path>
```

The oracle command receives the candidate file path in the `CANDIDATE` environment variable and must exit `0` when the failure still reproduces. The script writes candidates under a scratch directory, reports the run count, and leaves the minimal case at `--out`. Pass `--repeat N` when the oracle is flaky and you accepted that cost in step 2.

Pass `--scratch <path>` to put candidates somewhere you choose, and `--keep` to leave them behind. Both are worth using when a reduction produces a surprising result and you want to inspect the candidates it tried.

The script refuses to start unless the full input reproduces and the empty input does not. Those two guards are what stop a reduction from confidently minimising a failure the oracle was never detecting, so do not work around a refusal by loosening the oracle.

On Windows, Node resolves a shell to `cmd.exe`, which does not expand `$CANDIDATE` and has no `grep`. The script prefers `$SHELL` for this reason. Pass `--shell bash` explicitly if the oracle is a POSIX command and `$SHELL` is not set.

Where the input is not a file of lines, reduce by hand on the same rules: split the remaining set, keep the part that still fails, and never accept a candidate the oracle has not confirmed.

## 5. Confirm and report

Two checks before reporting anything.

- **Re-run the minimal case from a clean state.** Reductions accumulate scratch state, and a case that fails only inside the reduction run is not a repro.
- **Confirm 1-minimality on the parts that matter.** Removing any single remaining element should make the failure disappear. Where it does not, the case is not minimal, and the leftover is noise you should report as noise.

## Output

- The minimal case, verbatim, and where it now lives.
- The oracle, as the exact command and the signal it matched.
- The reduction: from what size to what size, in how many runs.
- **What the reduction ruled out.** This is the real product. Everything removed is something the bug does not depend on, and that is usually a shorter list of suspects than any amount of reading would have produced.
- Determinism: the measured flake rate, or confirmed deterministic.
- One line on what the minimal case suggests, marked as a suggestion. Reduction produces evidence, not a diagnosis.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/bisect`.** Complementary halves of one investigation. This finds what is minimal, that finds when it entered. Run this first, because bisect needs a fast deterministic predicate and the minimal case is exactly that.
- **`/hypotheses`.** Sequential, if the `decide` plugin is installed, and this is the observation that closes it. ACH ends by naming the cheapest observation that separates the surviving explanations. Reduction is often that observation, and the removed parts eliminate hypotheses wholesale.
- **`/property`.** Reinforcing. A property-based failure arrives pre-shrunk by the framework, so run this only where the framework's shrinker stopped somewhere unhelpful.
- **`/differential`.** The minimal case makes a good differential input once it exists.
- **`/why` and `/how`.** If the `questions` plugin is installed, run this before either. Explaining a failure you have not reduced explains the wrong thing.

## Before you send

- Is the oracle an exact command with a matched signal, rather than "it fails"?
- Was the signal checked to be the same failure, not merely a failure?
- Was determinism measured rather than assumed?
- Was the unreduced case confirmed to fail before reduction started?
- Does the minimal case still fail from a clean state?
- Is what the reduction ruled out reported, not only what survived?
- Was the cheap answer checked first, and said so if reduction was not needed?
- Is the suggested cause marked as a suggestion rather than stated as the finding?
