---
name: bisect
description: Find the commit that introduced a behaviour by binary search over history, with the predicate designed and validated before the search starts.
argument-hint: [the behaviour to find the origin of]
disable-model-invocation: true
allowed-tools: Bash Read Grep Glob
disallowed-tools: Edit Write NotebookEdit
---

Find where this entered: $ARGUMENTS

`git bisect` is a binary search over history. It is the only technique here that finds a cause without anyone understanding the code, which is exactly why it is worth reaching for early rather than late, and it is routinely reached for last.

The search is not the hard part; `git` does that in log2(n) steps. The hard part is the predicate. Almost every failed bisect is a predicate that was slow, non-deterministic, or testing something other than the symptom, and a bisect with a bad predicate does not fail loudly. It returns a commit, confidently, and that commit is wrong.

So this skill is mostly about the predicate. The search is four commands at the end.

## Resolve what to find

- **A regression.** Something worked and now does not. The standard case.
- **An improvement or a change in output.** Bisect is not limited to breakage. Anything you can test can be bisected, in either direction.
- **A behaviour that was never right.** There may be no good commit. Check before searching: if the oldest reachable commit already exhibits it, the answer is that it was always there, and that is a finding.
- **Nothing.** Take the regression under discussion and restate it in one line.

## Check before you search

Bisect is worth it when the range is large or the cause is not legible. It is not always worth it.

- **Is the range small?** Under about ten commits, read `git log -p` on the touched paths. That is faster than building ten times.
- **Does one command already name it?** `git log -S'<symbol>'` finds when a string entered or left. `git log -L <start>,<end>:<file>` gives the history of specific lines. `git blame` on the offending line answers it outright when the change is local. Try these first; they cost one command and often finish the job.
- **Is it your code at all?** If a dependency bump is the suspect, bisect the lockfile rather than the source, or pin the old version and confirm before searching your own history.

Say which of these you tried before starting a search.

## 1. Establish the endpoints, by testing them

Do not assume either endpoint. Run the predicate on both.

- **Verify the bad commit is bad.** Usually `HEAD`.
- **Verify the good commit is good.** This is the one people skip, and it is the one that wastes the afternoon. A "good" commit that also fails means the bug is older than you think, the range is wrong, and every result inside it will be nonsense.
- **Widen deliberately when the good commit is not good.** Step back by tags, releases, or powers of two until the predicate passes, and say how far back you had to go.

Note that `git bisect` calls these `old` and `new` as well as `good` and `bad`. Use `old` and `new` when bisecting for a change that is not a breakage, so the labels do not invert the meaning.

## 2. Design the predicate

The predicate answers one question per commit, mechanically.

| Requirement | Why | How to get it |
| --- | --- | --- |
| **Specific** | A generic failure matches build breakage and unrelated tests | Match the symptom string, not any non-zero exit |
| **Fast** | It runs log2(n) times, and a full suite makes that unaffordable | Run one test, not the suite |
| **Deterministic** | A flaky predicate sends the search down the wrong half, silently | Measure it, then repeat or pin |
| **Buildable across the range** | Old commits may not compile or may need different dependencies | Reinstall dependencies inside the predicate |
| **Free of the working tree** | Bisect checks out commits, so anything uncommitted follows you | Start from a clean tree, verified |

Two exit codes matter beyond pass and fail. `125` tells `git` the commit cannot be tested and should be skipped, which is how build failures inside the range are handled without corrupting the result. Any code above `127` aborts the run.

Keep the test script outside the bisected tree, or `git` will check it out from under itself. Copy it to a temporary path and run it from there.

## 3. Validate the predicate before trusting it

Run the predicate at both endpoints and confirm it disagrees with itself: passing at good, failing at bad. A predicate that returns the same answer at both ends is measuring something other than the change.

Where flakiness is possible, use the bundled harness, which runs the predicate repeatedly and collapses the result into the exit codes `git bisect run` expects:

```
node scripts/predicate.js --run <command> --repeat 5 --bad-if any
```

`--bad-if any` marks the commit bad if any run fails, which suits an intermittent failure. `--bad-if majority` suits a noisy signal. The harness emits `0` for good, `1` for bad, and `125` when the command could not be evaluated at all, so it drops directly into `git bisect run`.

## 4. Run it

```
git bisect start <bad> <good>
git bisect run <predicate>
git bisect reset
```

Always `reset`. An abandoned bisect leaves the repository on a detached head, and the next thing anyone does in that tree will confuse them.

`--first-parent` restricts the search to the mainline, which is usually what you want on a merge-heavy history: it identifies the merge that introduced the change rather than a commit inside a branch that was never independently good.

## 5. Read the result

The output is a commit. It is not a cause, and reporting it as one is the last way this goes wrong.

- **Read the diff.** `git show` on the result. The commit is usually small; the mechanism should be visible.
- **Check it is not a merge.** A merge commit as the answer usually means the two branches were each fine and the combination was not, which is a different and more interesting finding.
- **Check it is not a revert or a rename.** Bisect lands on the commit where behaviour changed, which is sometimes where a latent bug became reachable rather than where it was written. Say which one it is.
- **Confirm the skipped commits did not hide it.** If `git` skipped commits, the answer is a range rather than a commit. Report the range.

## Output

- The commit, as a short hash, subject, author date.
- The predicate, verbatim, and the signal it matched.
- The endpoints, and confirmation both were tested rather than assumed.
- Steps taken, and how many commits were skipped.
- What the diff shows, in one or two lines: the mechanism, not a restatement of the subject line.
- Whether the commit wrote the bug or exposed it.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/repro`.** Sequential, and it comes first. Bisect needs a fast deterministic predicate, and a reduced case is the best predicate available. Reducing before searching usually pays for itself immediately.
- **`/hypotheses`.** Bisect is often the single observation that separates competing explanations outright, so run it instead of scoring evidence when history is available.
- **`/differential`.** Complementary. Bisect names the commit; a differential run against the commit before it shows exactly what the behaviour change is.
- **`/when`.** Overlapping, and lighter. `/when` dates something that already exists. Use this when the question is which change caused a behaviour, and `/when` when the question is when something landed.
- **`/base-rate`.** Reinforcing. A bisect result is one data point for how long regressions of this kind survive undetected.

## Before you send

- Was the good endpoint actually tested, not assumed?
- Was the predicate validated to disagree between the endpoints?
- Was determinism measured, and repetition used if it was not deterministic?
- Did the predicate match the specific symptom rather than any failure?
- Was `125` used for untestable commits rather than letting them count as good or bad?
- Was the tree clean before starting, and was `git bisect reset` run after?
- Were cheaper alternatives (`git log -S`, `-L`, `blame`) tried first, and said so?
- Is the result reported as a commit plus a mechanism, rather than as a cause?
- If commits were skipped, is the answer reported as a range?
