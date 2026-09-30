---
name: differential
description: Use when a change claims behaviour is unchanged and a runnable reference version exists, such as the commit before a refactor or the implementation a rewrite replaces, when the user asks or as a step inside /hub. Not for changes meant to alter behaviour throughout, or where only one side can run. Runs two implementations against the same inputs and compares, with the accepted differences declared before the run. The refactor safety net, and the way to check a rewrite against the thing it replaces.
argument-hint: [what to compare, or the refactor to check]
allowed-tools: Bash Read Grep Glob
disallowed-tools: Edit Write NotebookEdit
---

Run a differential comparison for: $ARGUMENTS

McKeeman's differential testing (*Differential Testing for Software*, Digital Technical Journal, 1998) sidesteps the hardest problem in testing. Usually you need an oracle: something that knows the right answer. Differential testing replaces the oracle with a second implementation and asks only whether the two agree. You do not need to know what the output should be, which is what makes it work on code nobody fully understands.

For everyday work the second implementation is almost always the previous version of your own code. That makes this the refactor safety net: not "do the tests still pass", which only checks the behaviour someone thought to write a test for, but "does this produce identical output on every input I can find" across the behaviour nobody wrote a test for. That second set is where refactors actually break.

## Resolve the two sides

- **Old against new.** A refactor, a rewrite, an optimisation. The most common case, and `git worktree` gives you both at once.
- **Yours against a reference.** A specification's reference implementation, a mature library you are replacing, another language's standard implementation.
- **Implementation against implementation.** Two backends, two database drivers, two runtime versions, two platforms.
- **A version against itself under different configuration.** Cache on and off, feature flag either way, one worker against many. These find state and concurrency bugs the other configurations hide.
- **Nothing runnable on one side.** There is no differential test. Say so, and use `/boundary` or `/property` instead.

## Check before you build the harness

- **Is the change supposed to alter behaviour?** Then a differential run reports the intended change as thousands of differences and buries the unintended one. Scope it to the parts that should be identical, or declare the intended change as an accepted difference before you start.
- **Do the two sides even run against the same inputs?** If the signature changed, you need an adapter, and the adapter is now code that can be wrong. Keep it trivial and say what it does.
- **Is there already a golden-file or snapshot suite?** If so, you have a differential harness already, and the work is to widen its inputs rather than to build anything.

## 1. Get both sides runnable at once

For old against new, use a worktree rather than stashing or branch-switching. Switching branches under a running comparison is how you end up comparing a version against itself.

```
git worktree add <scratch path> <baseline ref>
```

Build and install dependencies inside the worktree separately. A shared dependency tree across two checkouts is a difference you did not declare, and lockfile drift between the two sides has produced more false positives here than any other cause.

Remove the worktree when finished, with `git worktree remove`. Leaving it behind pollutes the repository and the next `git status` that anyone runs.

## 2. Get inputs

In rough order of value:

- **Production samples.** The best inputs, because they are the distribution that matters. Scrub anything sensitive before it lands anywhere.
- **Existing fixtures.** Whatever the suite already has. Free, and usually too few.
- **Generated.** A generator over the input space, using the classes from `/boundary` so the generator covers the edges rather than the fat middle.
- **The corpus you already have.** Log lines, request captures, sample files in the repository, previous bug reports. Cheap, and unusually good at finding real differences.

Run enough inputs that agreement means something. A hundred inputs that all take the same branch is one input. Report the count and, where you can, the branch coverage.

## 3. Declare the accepted differences first

Before the run, write down what may legitimately differ. Doing this afterwards is how a real difference gets waved through.

Common legitimate differences: timestamps, generated identifiers, ordering where the contract does not fix it, floating-point in the last places, absolute paths, host names, wall-clock durations, and pointer or hash values printed into output.

Turn each into a normalisation rule rather than a judgment made per-case. A normaliser applied to both sides is auditable. An eyeball is not.

Be careful with ordering. Normalising order away is right where the contract genuinely does not specify it, and is how you miss a real regression where callers depend on order the contract forgot to promise. If in doubt, do not normalise it, and report the differences instead.

## 4. Compare

Compare on the strongest relation the contract allows: exact bytes where possible, then normalised, then semantic, then a tolerance for floats. Say which one you used, because a comparison with a loose relation and no differences is a weaker result than it looks.

Compare more than the return value. Errors and exceptions are output, and a refactor that turns a thrown error into a null return is a behaviour change the return value alone will not catch. Where they matter, compare emitted events, writes, and the queries actually issued.

## 5. Classify the differences

The output is not a count. Every difference falls into one of four groups, and the classification is the work.

| Class | Meaning | Action |
| --- | --- | --- |
| **Regression** | New is wrong, old was right | Fix before merging |
| **Improvement** | New is right, old was wrong | Keep, and note that the old behaviour may be depended on |
| **Both wrong** | The inputs agree on neither | The most valuable finding, and the rarest |
| **Accepted** | Covered by a declared normalisation | Confirm it was declared before the run, not after |

Reduce each distinct difference to a minimal input before reporting it. One reduced case is more useful than four hundred raw ones, and differences usually collapse into a handful of causes.

## Output

- The two sides, named as refs or versions, and how each was built.
- The input source and count.
- The comparison relation, and every normalisation applied.
- Differences, grouped by cause rather than listed per input, each with a minimal input.
- Each difference classified as regression, improvement, both wrong, or accepted.
- **What agreement covers.** Zero differences over inputs that only exercise one branch is not evidence of anything, and saying so is the difference between a result and a reassurance.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/repro`.** Sequential, in both directions. Reduce each difference before reporting it, and a reduced failing case makes a good differential input.
- **`/bisect`.** Complementary. Bisect names the commit; this shows what the behaviour change actually is, by comparing across that commit.
- **`/boundary`.** Reinforcing, and it should feed the generator. Random inputs cluster in the middle of every class, so a generator seeded with the boundary values finds differences that uniform sampling will not.
- **`/property`.** Adjacent. A property is an oracle you state; this is an oracle you borrow. Where you can state the property, prefer it, because it survives the old implementation being deleted.
- **`/characterize`.** The alternative, where no runnable old version exists. That pins what the code does now as lasting tests before the change, and they keep checking after the old version is gone; this compares old against new directly and leaves no tests behind.
- **`/reversible`.** Reinforcing, if the `decide` plugin is installed. Differential agreement is what converts a risky rewrite into a reversible one, because it is the evidence that lets you keep the old path until you do not need it.
- **`/redteam`.** Sequential, if the `decide` plugin is installed, and this comes first. Where the claim is that a change alters nothing, run this rather than attacking the argument: a question evidence can settle should not be debated.
- **`/hub`.** Reinforcing, if the `hub` plugin is installed. A spoke that claims its change alters nothing is making exactly the claim this settles, so in a `/hub` run compare against `HEAD` once every writing spoke has landed, and trace a difference to its spoke through the write sets.

## Before you send

- Were the accepted differences declared before the run rather than after?
- Was each side built with its own dependencies, rather than sharing a tree?
- Is the comparison relation named, and is it the strongest one the contract allows?
- Were errors and exceptions compared, not only return values?
- Are differences grouped by cause and reduced to minimal inputs?
- Is each difference classified, including the possibility that the new side is right?
- Is the input count and its coverage reported, so agreement can be weighed?
- Was the worktree removed?
