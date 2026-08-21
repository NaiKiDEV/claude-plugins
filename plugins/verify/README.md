# verify

Verification procedures for Claude Code. Each skill runs one published protocol to produce evidence about code that already exists: a failure that needs a shape, a regression with an unknown origin, a function whose input space was never mapped, a refactor that claims to change nothing, or a test suite nobody trusts.

| Skill | Protocol | Question it answers |
| --- | --- | --- |
| [`/repro`](#repro) | Delta debugging, from Zeller and Hildebrandt | What is the smallest thing that still fails? |
| [`/bisect`](#bisect) | Binary search over history, with a designed predicate | Which change introduced this? |
| [`/boundary`](#boundary) | Equivalence partitioning and boundary value analysis, from BS 7925-2 | Which inputs are actually different, and which are untested? |
| [`/differential`](#differential) | Differential testing, from McKeeman | Do these two versions agree? |
| [`/property`](#property) | Property-based testing, from QuickCheck | What is true of every input? |
| [`/mutate`](#mutate) | Mutation testing, from DeMillo, Lipton, and Sayward | Would the tests notice if this were wrong? |

## What these do

They produce evidence. They do not produce an argument about the code, and they do not decide what to do about what they find.

The failure they address is that a fluent agent can describe a system convincingly without ever having run anything against it. A stack trace gets a plausible cause, a refactor gets an assurance that behaviour is unchanged, a test suite gets a coverage number, and each of those reads exactly like a result while resting on nothing. The `decide` plugin structures a judgment so it cannot be reverse-engineered to a preference. This one replaces the judgment with an observation wherever an observation is available.

Each protocol fixes the order of operations so the observation cannot be corrupted by what you expect to see. The oracle is written and validated before any reduction runs. Both bisect endpoints are tested rather than assumed. The accepted differences are declared before the differential run, not after. The suite is proved green before a single mutant is introduced. That ordering is the mechanism, and it is why these are skills rather than instructions to test more carefully.

## Conventions

**Manual only.** Every skill sets `disable-model-invocation: true`. Claude never starts a verification run on its own, and the descriptions stay out of context until a skill is called.

**Check before you verify.** Every skill opens with the same rule, because a protocol applied to a question one command would settle costs more than the answer. `/bisect` tries `git log -S` and `blame` first and says so. `/repro` reads the stack trace before reducing. `/mutate` refuses to spend an hour proving that a file with no tests has no tests.

**Read-only, with two exceptions that the scripts own.** Four skills hold `disallowed-tools: Edit Write NotebookEdit`. `/property` may create new test files and nothing else. `/mutate` rewrites the file under test, and the bundled script owns the entire apply-run-restore loop so no editing tool ever touches your source.

**Nothing invented to fill a shape.** A reduction that did not converge says where it stalled. A differential run with no differences reports what its inputs actually covered, because agreement over inputs that all take one branch is not evidence. A bisect that skipped commits reports a range rather than a commit.

**Sequenced, with declared precedence.** Each skill carries a `Composes with` section. `/repro` comes before `/bisect`, because bisect needs a fast deterministic predicate and a reduced case is the best one available. `/boundary` comes before `/property`, whose generators should be biased by what partitioning found. `/boundary` and `/mutate` approach the same gap from opposite directions and agreeing on a line is a confirmed finding.

## Scripts

Three skills bundle a zero-dependency Node script, for the same reason `visualize` does: where an answer has a checkable invariant, it should be computed rather than generated.

| Script | Skill | What it computes |
| --- | --- | --- |
| `ddmin.js` | `/repro` | The `ddmin` reduction itself, terminating at a 1-minimal case |
| `predicate.js` | `/bisect` | A flake-tolerant predicate collapsed into git's `0`, `1`, and `125` exit codes |
| `mutate.js` | `/mutate` | Mutant discovery with comments and strings masked, and the apply-run-restore loop |

All three run the oracle or suite through `$SHELL` rather than the platform default, because Node resolves a shell to `cmd.exe` on Windows, which does not expand `$CANDIDATE` and has no `grep`.

## Safety

`/mutate` is the only skill here that modifies a tracked file. Its contract:

- It refuses to run unless the target file is clean in `git`, so an interrupted run is always recoverable.
- It refuses to run unless the suite passes on the unmutated file.
- It keeps an on-disk backup and recovers from one left behind by a run that was killed outright, which no `finally` block can protect against.
- It restores in a `finally` and on `SIGINT`, `SIGTERM`, `SIGHUP`, and `SIGBREAK`.
- It verifies the file is byte-identical to its original before reporting, and reports that verification.
- Per-mutant timeouts are derived from the measured baseline, because mutating a loop counter routinely produces a mutant that never terminates.

`--allow-dirty` exists and neither the skill nor the agent will use it.

## Agents

Two agents ship with the plugin. Both run loops with a high iteration count and little informative intermediate state, which is the case where a separate context window earns its cost.

| Agent | Dispatched by | Returns |
| --- | --- | --- |
| `verify-shrinker` | `/repro` | The minimal case, the oracle, and what the reduction ruled out |
| `verify-mutator` | `/mutate` | Survivors classified into real gap, equivalent, and undecided behaviour |

Neither is for direct selection. They start cold, cannot see the dispatching conversation, and stop rather than guess when a brief is incomplete.

## Skills

### `/repro`

Delta debugging. Reduces a failure to the smallest input, steps, or configuration that still triggers it, after fixing an oracle that matches the specific failure signal rather than any non-zero exit. The reduction is run by `ddmin.js`, which refuses to start unless the full input reproduces and the empty input does not.

The output people underuse is what the reduction *removed*: every discarded part is something the failure does not depend on, which is usually a shorter list of suspects than reading the code would have produced.

### `/bisect`

Binary search over history. The search is four commands; the skill is about the predicate, because a bad predicate does not fail loudly, it returns a commit confidently and that commit is wrong. Endpoints are tested rather than assumed, `125` is used for untestable commits, and `predicate.js` runs the check repeatedly when the signal is flaky.

The result is reported as a commit plus a mechanism, and separates the commit that wrote a bug from the commit that exposed one.

### `/boundary`

Equivalence partitioning and boundary value analysis. Derives cases from the input space rather than from the implementation, which is what stops tests from reproducing the implementation's own assumptions and passing by construction. Invalid classes are enumerated separately, because "bad input" is four classes and code that handles one often mishandles the others.

Then it checks which classes the existing tests actually cover, by reading assertions and running them rather than by reading test names.

### `/differential`

Differential testing. Replaces the oracle with a second implementation and asks only whether the two agree, which works on code nobody fully understands. For everyday work the second implementation is the previous version of your own code, reached through `git worktree`, which makes this the refactor safety net over the behaviour nobody wrote a test for.

Accepted differences are declared as normalisation rules before the run. Every difference is classified as regression, improvement, both wrong, or accepted.

### `/property`

Property-based testing. Works a catalogue of property patterns rather than inventing assertions: round trip, invariant, idempotence, commutativity, oracle, induction, algebraic law, never crashes, and metamorphic for the genuinely oracle-free case. Uses whichever framework the project already has, and does not introduce one.

Half the findings come from the properties that could not be stated, since an unspecified contract is what breaks when somebody refactors.

### `/mutate`

Mutation testing. Coverage measures which lines executed; this measures which faults are detected, which is what anyone asking for coverage actually wanted. It is the sharpest tool here for generated test suites, whose characteristic failure is high coverage with weak assertions.

Survivors are the output, not the score, and each is sorted into a real gap, an equivalent mutant, or behaviour nobody has decided. The score is reported as a relative measure and is never proposed as a target.

## Install

```
/plugin install verify@naikidev
```

## Naming

Skill names resolve bare: `/repro`, `/bisect`, and so on. Prefix with the plugin name, as in `/verify:property`, when another installed plugin claims the same name. `/boundary`, `/property`, and `/differential` are the likeliest collisions.

No skill here is named `verify`, so an existing `/verify` command from another source stays reachable.
