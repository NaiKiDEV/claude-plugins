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
| `hub-verifier` | Takes one claim and tries to refute it. Defaults to refuted when it cannot establish the claim. |

## The topology

The hub is the main session, not a subagent. `/hub` loads the orchestration protocol into the conversation you are already in, and that conversation dispatches the spokes.

The shape is enforced by the runtime rather than by instruction: a subagent cannot spawn a subagent, so spokes cannot delegate onward and the graph stays one level deep. Spokes also cannot see each other, cannot see the conversation, and cannot ask a question once dispatched. Every dependency between two spokes is therefore the hub's to sequence, and every piece of context a spoke needs is the hub's to write into its brief.

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

**Nothing is pre-approved for writing.** The skill pre-approves `Agent`, `Read`, `Grep`, `Glob`, and `TodoWrite`. `Edit`, `Write`, and `Bash` stay callable but follow your existing permission settings, which keeps the delegated path frictionless and the direct one deliberate. Running commands is what makes phase 6 work at all: the hub re-runs the decisive check itself instead of accepting a spoke's report that the check passed.

**Routing prefers what you already have.** The hub reads the agent types available in the session and routes each piece to the most specific match before falling back to the three generics. On a machine with a large installed agent set, most spokes will be your specialists rather than this plugin's. The brief governs scope and the specialist governs technique within it.

**Nothing is written to disk.** The run's ledger is the `TodoWrite` list, not a plan file in your repository. Progress is visible in the session and leaves nothing behind to clean up.

## `/hub`

```
/hub
/hub add a retry budget to the API client and thread it through the callers
/hub work out why the nightly job started timing out last week
/hub migrate every call site off the deprecated logger
```

Seven phases run in order, with a stop between planning and execution.

**Scope, then decompose.** The hub reads enough to understand the shape of the problem and stops there. Pieces are split on genuine independence, meaning neither needs the other's output and they write disjoint files. Work that depends on another piece becomes a later stage carrying its predecessor's result, not a parallel peer. A piece that cannot be stated without referring to the conversation is treated as not yet decomposed.

**Gate.** The plan is printed and the run stops until you answer:

```
 hub › retry budget                              5 spokes · 3 parallel
 ─────────────────────────────────────────────────────────────────────
 1  investigate   hub-investigator   how the retry budget is threaded
 2  implement     typescript-...     src/lib/retry.ts, src/lib/api.ts     ⟵ after 1
 3  implement     hub-implementer    src/config/defaults.ts               ∥
 4  implement     hub-implementer    docs/retries.md                      ∥
 5  verify        hub-verifier       claim: no caller bypasses the budget ⟵ after 2,3
```

Each row names the spoke and the files it owns, so a bad split is visible before agents run against it rather than after.

**Dispatch.** Briefs are written for an agent that starts cold, carrying objective, context, read and write scope, boundaries, the check that decides success, and the return shape. Independent spokes are dispatched in one message so they run concurrently.

Declared write sets are a hard constraint, not documentation. Spokes share one working tree, and two concurrent writers on the same file overwrite each other with no error. Where the work resists partitioning, the hub sequences the writers or isolates them in worktrees.

**Verify.** A spoke's report is treated as a claim about the tree rather than a fact about it. The hub re-runs decisive checks itself, reads changed files where the change was subtle, and dispatches `hub-verifier` where a load-bearing claim is worth attacking. Verification scales with consequence.

A spoke that returns `partial`, `blocked`, or nothing is re-dispatched once with a sharper brief, then reported as unfinished. A task is never allowed to disappear quietly between the plan and the summary.

**Integrate.** Seams between independently correct spokes get reconciled: a helper written twice under two names, an interface changed on one side of a call, a config key nothing reads. This is where the hub's editing exception applies most often, because a seam is small and already visible in the reports it holds. A seam that turns out to be a design disagreement becomes an integration spoke instead.

The closing report separates what is done, with the check the hub ran rather than the check a spoke claimed, from what the hub edited directly and what did not land at all.

## Install

```
/plugin marketplace add naikidev/claude-plugins
/plugin install hub@naikidev
```

`/hub` resolves bare unless another installed plugin claims the name, which is plausible for a name this short. Use `/hub:hub` in that case.
