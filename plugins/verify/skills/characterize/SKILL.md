---
name: characterize
description: Use before changing code that has no tests, or only weak ones, at the point being changed, when the user asks or as a step inside /hub. Not for code whose tests already pin the behaviour the change could break, and not for stating what code should do. Pins current behaviour as lasting characterization tests, from Feathers, and returns the command that runs them as the check a later change must keep green.
argument-hint: [the code about to change, and the change planned]
allowed-tools: Bash Read Grep Glob Write
disallowed-tools: Edit NotebookEdit
---

Characterize before changing: $ARGUMENTS

Michael Feathers named the technique in *Working Effectively with Legacy Code* (Prentice Hall, 2004), and restates it at https://michaelfeathers.silvrback.com/characterization-testing (summary: https://en.wikipedia.org/wiki/Characterization_test). A characterization test records what the code does now, not what it should do. It needs no specification, only the code and a way to run it, which is why it works on the code that needs it most: the code whose contract nobody can state.

The reason this exists is that a change to untested code has no check. "The tests still pass" means nothing where no test reaches the lines you touched, and an agent will report it anyway. Pinning the current behaviour first turns the change from an assurance into something a command can refute. The pinned tests are the check the change must keep green.

It is also the correction for a specific agent failure: asked to test existing code, an agent writes the tests the code ought to pass, then either fixes the code to match or reports the failures as bugs. Characterization writes down what is, and leaves what ought to be as a question.

## Resolve the target

- **A planned change to named code.** The normal case. The change tells you which behaviour to pin, and it is what keeps the work bounded.
- **Code with no planned change.** Pinning everything is unbounded. Ask what is about to change, or pick the entry point with the most callers and say you picked it.
- **A whole module.** Too large. Pin the change points only.
- **Nothing.** Take the change under discussion and name its change points in one line.

## Check before you pin

- **Do tests already reach the change point?** Find the tests that execute the lines you will touch, and run them. If they assert on the behaviour the change could break, the check exists, and the work is at most to widen it. Say so. If you cannot tell whether they would notice a change, that is `/mutate`'s question.
- **Does a runnable old version exist, and is the claim that nothing changes?** Then `/differential` compares directly and writes nothing. Prefer this skill when the check should outlive the change, or when the change alters some behaviour and must keep the rest.
- **Can the code run under a test at all?** If it cannot be constructed or called without the network, a database, or a clock you do not control, finding a seam is the first job, and it may be all of this one.

## 1. Name the change points

List the places the planned change will edit, by file and line: functions, methods, branches. Then list the behaviour reachable from them that a caller could observe: return values, thrown errors, writes, calls to collaborators, state left behind.

The second list is what you pin. Behaviour the change cannot reach does not need pinning, and pinning it is a cost the next change pays to maintain.

## 2. Find a seam and an entry point

Feathers' seam is a place where you can alter behaviour without editing in that place: a parameter a fake can pass through, a constructor argument, an overridable method, a module the test runner can substitute, an environment variable. You need one to get the code into a harness.

Pick the entry point closest to the change points that a test can call without editing source. Closer is better, because every layer between the test and the change point is behaviour you pin by accident. Name the seam you used.

If no seam exists without editing source, stop and report it. Breaking a dependency is a change to the code and belongs to the planned change, not to this skill. Name the smallest dependency-breaking step that would open a seam.

## 3. Run Feathers' loop

For each behaviour on the list:

1. Write a test that calls the entry point and asserts a value you know is wrong. Use a sentinel that cannot be the answer.
2. Run it. It fails, and the failure message reports what the code actually produced.
3. Replace the sentinel with the observed value, and run it again. It passes.

The deliberate wrong value is the point. It proves the assertion runs and can fail, and it takes the expected value from the code rather than from your reading of it. Where the observed value surprises you, the surprise is a finding: note it before you paste it in.

Where the output varies between runs (timestamps, generated identifiers, unordered collections), fix the input through a seam or normalise the output in the test. Never pin a value that changes run to run. Run every pinned test several times before you trust it, because a check that flakes is not a check.

This skill writes new files only, so step 3 rewrites the test file you created rather than editing one in place.

## 4. Cover the branches the change will touch

One test per behaviour is not one test per branch. For each change point, list its branches and construct an input that takes each one. The branches the change edits come first, then the branches beside them that it could disturb. Where `/boundary` has partitioned the inputs, take its edges.

Where an output is hidden, sense it. A branch that sets a private field, calls a collaborator, or writes somewhere the test cannot read has no return value to pin. Sense it through the seam: a fake collaborator that records its calls, or a testing subclass that overrides a method and records what passed through. Feathers' sensing variable is a field that records which path ran or what a hidden value was. Put it on the fake or the testing subclass, in test code. A sensing variable that must go into the class under test is a source edit: do not make it here. Name the variable and the line it would go on, and list the branch as uncovered.

Report every branch left uncovered, with the reason: unreachable from the seam, needs a source edit to sense, or no input could be constructed to reach it. An uncovered branch at a change point is the part of the change with no check.

## 5. Name them as what they are

A characterization test looks exactly like a specification test, and in a year someone will read one as the contract. Name them so they cannot be mistaken, with `characterizes`, `currently`, or `pins current behaviour` in the test or group name, in the project's naming style. Put them where the project keeps tests, in the framework it already uses.

## Pinned, never fixed

Behaviour that looks wrong is pinned as it is and listed as an open question. It is not fixed here, and the test is not written to the value it ought to have. Mark the test with a one-line comment that points at the question.

Two reasons. Somebody may depend on it: behaviour that looks like a bug is often a contract a caller relies on, and only a decision can tell those apart. And a fix mixed into a characterization pass means the pinned tests no longer describe the code the change starts from, so the check is gone at the moment it is needed.

## Output

- The test files written, with paths, and the test count in each.
- The change points, each with the branches covered and the test that covers each one.
- **Branches left uncovered**, each with its reason, and any sensing variable or dependency-breaking step that would reach it.
- **Open questions:** each pinned behaviour that looks wrong, with the input, the observed output, and why it looks wrong.
- The seam used for each entry point.
- **The exact command that runs the pinned tests**, scoped to them alone, and its result over several runs. This is the check the change must keep green, and in a `/hub` run it becomes the brief's Check.

## Writing tests

This skill creates new test files and nothing else. Do not modify existing tests or any source file, including to open a seam or add a sensing variable: a change the code needs before it can be pinned is a finding to report, not a change to make.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/mutate`.** Sequential, and that is the check on this. Pinned tests record what the code does, which is not the same as noticing when it changes. Run that over the change region afterwards, and each survivor is a line the planned change could alter with the check still green.
- **`/differential`.** The alternative, when a runnable old version exists. That compares old against new directly and leaves no lasting tests; this leaves tests that keep checking after the old version is gone. Where the change is meant to alter some behaviour and keep the rest, prefer this.
- **`/property`.** Where it fits. A characterization test pins one input. Where the observed behaviour follows a rule that is uniform over a class, a property pins the class, stated from what the code does rather than from what it should do.
- **`/boundary`.** Where it fits, and it chooses the inputs. The edges of each class are where a change is likeliest to move behaviour, so pin those first.
- **`/change:parallel-change`.** Sequential, if the `change` plugin is installed, and this comes first. Characterize an untested interface before expanding it, and put the pinned-test command in the Check of expand and of every migrate batch, so each has a check that the old path still behaves as it did.
- **`/hub`.** Sequential, if the `hub` plugin is installed, and this comes first. Run it as a spoke before the change is dispatched, and put its command in the change spoke's Check: a check that already exists and already passes is one the hub can verify.

## Before you send

- Was each change point named, and only behaviour reachable from it pinned?
- Did every test start from a deliberately wrong value, with the expected value taken from the run?
- Were the branches the change touches covered, and each uncovered branch reported with its reason?
- Was hidden output sensed from test code, with no sensing variable added to source?
- Do the test names say they pin current behaviour, not desired behaviour?
- Was every behaviour that looks wrong pinned as it is and listed, rather than fixed?
- Were the pinned tests run several times and found green and deterministic?
- Is the exact command that runs them in the report?
- Were only new test files written, with no source file or existing test touched?
