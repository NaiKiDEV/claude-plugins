# hub

Manual-only hub-and-spoke orchestration. One skill that turns the main session into a dispatcher and does no work itself.

| Skill | What it does |
| --- | --- |
| [`/hub`](#hub) | Decomposes a task, gates the plan, dispatches spokes, verifies what comes back, integrates. |

Three generic spokes ship alongside it and are used only when nothing better is installed.

| Agent | Role |
| --- | --- |
| `hub-investigator` | Read-only tracing, location, and factual questions. Returns anchored findings. |
| `hub-implementer` | One scoped change to a named file set, verified before reporting. |
| `hub-verifier` | Takes one claim and tries to refute it. Defaults to refuted when it cannot establish the claim, and reserves `unverifiable` for claims this environment cannot test. |

## The topology

The hub is the main session, not a subagent. `/hub` loads the orchestration protocol into the conversation you are already in, and that conversation dispatches the spokes.

The graph stays one level deep. Nested dispatch, a subagent spawning a subagent, depends on a user setting, so the design does not rely on it: spokes do not delegate onward, and a skill that dispatches its own agent is run by the hub rather than by a spoke. Spokes also cannot see each other, cannot see the conversation, and cannot ask a question once dispatched. Every dependency between two spokes is therefore the hub's to sequence, and every piece of context a spoke needs is the hub's to write into its brief.

## Conventions

**Manual only.** The skill sets `disable-model-invocation: true`. Claude never invokes it on its own, and its description stays out of context until you type it. This matters more here than in a read-only plugin: an orchestrator that self-triggers can spend a large number of tokens without being asked.

The plugin adds no hooks, no MCP server, and no `commands/`, so nothing in it fires on an event.

The three agents are a different case, and the asymmetry is worth stating plainly. An agent definition has no equivalent of `disable-model-invocation`. Installing the plugin registers all three as selectable agent types for every session, and their descriptions occupy a few lines of the agent roster whether or not you ever run `/hub`. Nothing prevents a model from selecting one for unrelated work, which is a live consideration in a setup whose own rules delegate to agents without being asked.

Two things narrow that. Each description opens by stating the agent is dispatched by `/hub` and is not for direct selection, which is the text a model reads when routing. Each agent also refuses to improvise: dispatched without a hub-shaped brief, `hub-implementer` and `hub-verifier` report the missing brief and stop rather than choosing their own scope in a shared working tree.

The `hub-` prefix keeps the names clear of the agents you already have. If you would rather add nothing at all to your agent roster, delete `agents/` and the hub falls back to briefing whatever generic agent the session provides; only the return-contract discipline baked into these three system prompts is lost.

**The hub delegates by default and edits by exception.** Dispatching a spoke carries fixed overhead: a brief to write, a cold read-in, the work, a report, and the hub's verification of that report. Some changes are smaller than that. The skill states the test rather than leaving it to feel:

> If the brief describing the change would be longer than the change, make it yourself.

A missed rename, a dangling import, a wrong path in a config key, or a signature two spokes disagreed about all fail that test and are the hub's to fix. The test is applied before starting, so an edit that turns out larger than it looked stops and becomes a dispatch rather than being finished out of momentum.

Four conditions override the test and force delegation at any size: the change was a piece of the decomposed plan, making it would require reading code the hub has not already read, a dispatched spoke owns the file, or the result is something the hub would have wanted checked by someone other than its author. The third is a correctness constraint rather than a stylistic one. The hub writes into the same tree as the spokes, so a write set handed to a running spoke binds the hub too.

Direct edits do not skip verification, and they are listed separately in the closing report under **Edited directly**, so changes that never passed through a spoke's own verification are visible as such.

**Nothing is pre-approved for writing.** The skill pre-approves `Agent`, `Read`, `Grep`, `Glob`, and `Skill`, the last so the hub can run another plugin's procedure without a prompt; a skill it runs brings its own `allowed-tools` with it. It also pre-approves one `Bash` rule, `Bash(node "${CLAUDE_SKILL_DIR}/scripts/ledger.js" *)`, for the bundled ledger script, which prints the run's table and keeps its state in a temp file, and writes nothing to your repository. `Edit`, `Write`, and every other `Bash` command stay callable but follow your existing permission settings, which keeps the delegated path frictionless and the direct one deliberate. Running commands is what makes phase 6 work at all: the hub checks `git status` against the declared write sets and re-runs the decisive check itself instead of accepting a spoke's report that the check passed.

**Routing prefers what you already have.** The hub reads the agent types available in the session and routes each piece to the most specific match before falling back to the three generics. On a machine with a large installed agent set, most spokes will be your specialists rather than this plugin's. The brief governs scope and the specialist governs technique within it.

**Nothing is written to your repository.** The run's ledger is the gate table, kept by `scripts/ledger.js`, a bundled zero-dependency Node script whose state is a JSON file in the system temp directory keyed by session, not a plan file in your repository. The script computes the alignment, so the hub pastes its output rather than typing the table. To keep the token cost down, each status change is relayed as the one line `set` prints, and the full table is printed only at the gate, when a stage completes, and in the closing report. The state file is what keeps the plan alive through context compaction, and the closing report accounts for every row. If `node` is unavailable, the hub prints the table by hand in the same layout.

## `/hub`

```
/hub
/hub add a retry budget to the API client and thread it through the callers
/hub work out why the nightly job started timing out last week
/hub migrate every call site off the deprecated logger
```

Seven phases run in order, with a stop between planning and execution.

**Scope, then decompose.** The hub reads enough to understand the shape of the problem and stops there. Pieces are split on genuine independence, meaning neither needs the other's output and they write disjoint files. Work that depends on another piece becomes a later stage carrying its predecessor's result, not a parallel peer. A piece that cannot be stated without referring to the conversation is treated as not yet decomposed. Where the shape depends on something not yet traced, the trace becomes an investigation piece that later stages wait on.

**Gate.** The plan is printed and the run stops until you answer:

```
 hub › retry budget                                   5 spokes · 3 stages · up to 3 at once
 ──────────────────────────────────────────────────────────────────────────────────────────
  #  kind         spoke             scope                                 1   2   3   needs
  1  investigate  hub-investigator  how the retry budget is threaded      ===
  2  implement    typescript-pro    src/lib/retry.ts, src/lib/api.ts          ===     1
  3  implement    hub-implementer   src/config/defaults.ts                ===
  4  implement    hub-implementer   docs/retries.md                       ===
  5  verify       hub-verifier      claim: no caller bypasses the budget          === 2,3
```

Each row names the spoke and the files it owns, so a bad split is visible before agents run against it rather than after. The numbered lanes are stages: a row's `===` sits in the stage it can start in, rows sharing a lane run together, and `needs` names the rows it waits on. In the status view the bar shows state instead: `===` done, `>>>` running or retrying, `...` waiting, `xxx` failed, `---` dropped. Past six stages the lanes give way to rows grouped under stage headings.

**Dispatch.** Briefs are written for an agent that starts cold, carrying objective, context, read and write scope, boundaries, the check that decides success, and the return shape. The three generics already carry a return shape and the `Skill` tool, so a brief to one states only what it adds to or replaces in the return, and can name a skill for the spoke to run. Independent spokes are dispatched in one message so they run concurrently.

Declared write sets are a hard constraint, not documentation. Spokes share one working tree, and two concurrent writers on the same file overwrite each other with no error. Where the work resists partitioning, the hub sequences the writers or isolates them in worktrees.

**Verify.** A spoke's report is treated as a claim about the tree rather than a fact about it. The first check is the write sets: the files actually changed, untracked ones included, are compared against the declared sets, and any file outside them is a finding before anything else runs. The hub then re-runs decisive checks itself, reads changed files where the change was subtle, and dispatches `hub-verifier` where a load-bearing claim is worth attacking. Verification scales with consequence.

A spoke that returns `partial`, `blocked`, or nothing, or leaves a gap the plan depended on, gets one retry and is then reported as unfinished. An `unverifiable` verdict is not retried; it is reported under **Worth knowing** with what would test it. A retry that names the fault, a fix pass on the spoke's own files, and a redirect after dispatch all continue the running spoke with its context intact; a fresh start is for when that context is the problem, and spokes a redirect makes moot are stopped. A verifier is never handed the story behind its claim and is never forked. A task is never allowed to disappear quietly between the plan and the summary.

**Integrate.** Seams between independently correct spokes get reconciled: a helper written twice under two names, an interface changed on one side of a call, a config key nothing reads. This is where the hub's editing exception applies most often, because a seam is small and already visible in the reports it holds. A seam that turns out to be a design disagreement becomes an integration spoke instead. Where the [`questions`](../questions) plugin is installed, an investigator spoke runs `/what` over the run's range first, and its loose ends become seam candidates without the diff entering the hub's context.

The closing report separates what is done, with the check the hub ran rather than the check a spoke claimed, from what the hub edited directly and what did not land at all.

Where the [`refine`](../refine) plugin is installed, the hub starts from `/wbs` or `/invest` output you already have, or runs them itself when the pieces are not obvious. `/invest` emits ready items carrying objective, context, scope, boundaries, and check, which are five of the six fields a brief needs. They reach the gate without a translation step, and the hub supplies the return shape.

Other installed plugins supply procedures the hub routes pieces to. Where [`verify`](../verify) is installed, `/characterize` pins an untested change point first and its tests become the piece's check, and `/differential` takes claims that behaviour is unchanged, run against `HEAD` once every writing spoke has landed so a difference traces to its spoke through the write sets. Tests a spoke wrote against source still clean in `git` go to the `verify-mutator` agent, which the hub dispatches directly so the suite runs stay out of its context. Source a spoke changed has to be committed before it can be mutated, because the mutation script refuses a dirty target, so the hub offers that run in the closing report. Where [`change`](../change) is installed, `/parallel-change` turns an interface change whose callers cross write sets into an expand piece, parallel migrate pieces, and a contract piece.

## Install

```
/plugin marketplace add naikidev/claude-plugins
/plugin install hub@naikidev
```

`/hub` resolves bare unless another installed plugin claims the name, which is plausible for a name this short. Use `/hub:hub` in that case.
