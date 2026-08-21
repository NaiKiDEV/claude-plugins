---
name: mutate
description: Introduce small faults deliberately and check whether the tests notice. Mutation testing, which measures detection rather than execution.
argument-hint: [the file or module whose tests you doubt]
disable-model-invocation: true
allowed-tools: Bash Read Grep Glob
disallowed-tools: Edit Write NotebookEdit
---

Mutation test: $ARGUMENTS

DeMillo, Lipton, and Sayward proposed this in *Hints on Test Data Selection* (IEEE Computer, 1978). Change one small thing in the source, deliberately and wrongly, then run the tests. If they still pass, they were not testing that.

The reason this exists is that coverage answers the wrong question. Coverage measures which lines *executed*, and a test that calls a function and asserts nothing gives full coverage of everything it touched. Mutation testing measures which faults are *detected*, which is what anyone actually wanted to know when they asked for coverage. A line at 100% coverage with a surviving mutant is a line no test constrains.

For agent-written code this is the sharpest tool here. The characteristic failure of a generated test suite is high coverage and weak assertions: tests that execute a great deal and pin down very little, because they were written against the implementation rather than against a contract. Mutation testing finds exactly that, and it finds it as a specific list of lines rather than as a general worry.

## This one modifies your source

Every other skill in this plugin is read-only. This one rewrites the file under test, once per mutant, and restores it. Read the safety contract before running it, because that is the part that matters.

The bundled script owns the whole apply-run-restore loop, so no editing tool touches your code. It refuses to start unless the target file is clean in `git`, keeps an on-disk backup that survives being killed outright, restores in a `finally` and on `SIGINT`, `SIGTERM`, `SIGHUP`, and `SIGBREAK`, and verifies the file is byte-identical before it reports anything.

Do not pass `--allow-dirty` to get past a refusal. The clean-tree requirement is what makes an interrupted run recoverable, and it costs one commit.

## Resolve the target

- **A file.** The normal case, and the right granularity.
- **A function.** Use `--limit` and read the line numbers, or accept the file and report only the survivors inside that function.
- **A whole project.** Too expensive. Mutation runs the suite once per mutant, so a project-wide run is hours. Pick the file whose tests you doubt most and say why you picked it.
- **Nothing.** Take the code under discussion, or the file changed most recently, and say which you chose.

## Check before you run

- **Is the suite green and fast?** Both are preconditions. The script refuses on a red suite because a mutation score computed against failing tests means nothing. A slow suite makes the whole run unaffordable, so scope to the tests covering the target rather than running everything.
- **Is the suite deterministic?** A flaky test kills mutants at random and the score is noise. Run it a few times first.
- **Is there any test at all?** If the file has no tests, mutation testing will report that every mutant survived, at great expense, to tell you what one `grep` would have. Say that instead.
- **Is coverage already zero here?** Same argument. Mutation is for code that looks tested.

## 1. Scope the run

Cost is mutants multiplied by suite duration. Both are yours to control.

Narrow the test command to the tests that cover the target, not the whole suite. Use `--limit` for a first pass to see the shape before committing to a full run. Use `--operators` to focus on one class of fault when you already suspect one.

Run the discovery pass first, which costs nothing:

```
node scripts/mutate.js --file <path> --dry-run
```

That prints every mutation site with its line and context. Read it before running. If a site sits somewhere that could not matter, you have learned something about the file for free.

## 2. Run

```
node scripts/mutate.js --file <path> --test <command>
```

The operators are token-level swaps that keep the file syntactically valid: conditional boundaries (`<` against `<=`), negated conditionals (`==` against `!=`), logical connectors (`&&` against `||`), arithmetic, increment direction, and boolean literals. Comments and string literals are masked out, so a mutation never lands inside text.

Timeouts are derived from the measured baseline rather than fixed, because mutating a loop counter or a loop condition routinely produces a mutant that never terminates. That is an expected outcome, and the script counts a timeout as killed: the fault was detected, by the clock rather than by an assertion.

## 3. Read the survivors

The score is not the output. The survivors are, and each one is a specific missing assertion at a specific line.

Sort them into three groups:

- **A real gap.** The mutant changes behaviour and nothing noticed. Write the assertion. Most survivors are this.
- **An equivalent mutant.** The mutation cannot change behaviour, so no test could kill it. A boundary that is unreachable, a branch on a value that is always the same, arithmetic on a constant that happens to be zero. Detecting these in general is undecidable, so they are read by hand and excluded from the score by judgment. Report them separately rather than silently dropping them.
- **Behaviour nobody has decided.** The mutant changes what happens in a case the specification never covered. This is the most valuable group, because the answer is not a test, it is a decision.

A surviving boundary mutant is almost always a genuine gap, and it is the same gap `/boundary` predicts from the other direction. When both agree on a line, that line is untested and the fix is one assertion.

## 4. Interpret the score

Report it as killed over the total minus the equivalents, and treat it as a relative measure only.

An absolute mutation score is not a target and should not be turned into one. Chasing a number produces tests written to kill mutants rather than to express a contract, which is the same failure in a new costume. The useful comparisons are between files, and for one file over time.

## Output

- The file, the test command, and the scope of both.
- Mutants found, run, killed, survived, and how many were killed by timeout.
- The score, with the equivalents excluded and named.
- **The survivors**, each with line, operator, the change, and the source line, sorted into real gap, equivalent, and undecided behaviour.
- For each real gap, the assertion that would kill it, in one line.
- Confirmation that the file was restored byte-identically.
- Where the run was scoped or limited, what was left out.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/boundary`.** Reinforcing, and the pair is the strongest in the plugin. That predicts which classes are untested from the input space; this proves which lines are unconstrained from the code. A surviving conditional-boundary mutant on a line that partitioning also flagged is a confirmed gap.
- **`/property`.** Sequential, and this is the check on that. Properties are the strongest defence against surviving mutants, so run this afterwards to find out whether they earned their cost.
- **`/differential`.** Adjacent. Both perturb something and compare, but that changes the implementation and holds the tests fixed, while this changes the code and asks whether the tests move.
- **`/redteam`.** The same stance, applied to a different object. That attacks an argument, this attacks a test suite.
- **`/premortem`.** Reinforcing, on detectability. That ranks causes by whether anyone would notice in time, and a surviving mutant is a direct answer for the causes a test would have caught.
- **`/quit`.** Reinforcing, occasionally. A file whose mutation score does not move after real effort is evidence about the design, not just about the tests.

## Before you send

- Was the suite confirmed green and deterministic before the run?
- Was the run scoped to the tests covering the target rather than the whole suite?
- Was the dry run read before committing to a full run?
- Are survivors sorted into real gaps, equivalents, and undecided behaviour, rather than listed flat?
- Is each equivalent mutant justified, rather than assumed?
- Does each real gap come with the assertion that would kill it?
- Is the score reported as relative, without being proposed as a target?
- Is the byte-identical restoration confirmed and stated?
- Was `--allow-dirty` left alone?
