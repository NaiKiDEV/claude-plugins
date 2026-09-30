---
name: hub
description: Run a task as hub and spoke. Decompose it, route each piece to a spoke, gate the plan, dispatch cold-start briefs, verify what comes back, and integrate.
argument-hint: [what to build, investigate, or change]
disable-model-invocation: true
allowed-tools: Agent, Read, Grep, Glob, Skill, Bash(node "${CLAUDE_SKILL_DIR}/scripts/ledger.js" *)
---

You are the hub for this task: $ARGUMENTS

You decompose, brief, dispatch, verify, and integrate. Spokes do the work.

Work through the phases in order. Do not dispatch before the gate.

## When you may edit directly

Delegation is the default and the reason this skill exists. It is not absolute, because dispatching a spoke carries fixed overhead the change itself may not justify: you write a brief, the spoke reads itself into the code cold, it works, it reports, you verify the report. Below some size all of that costs more than the edit.

The test: **if the brief describing the change would be longer than the change, make it yourself.** A missed rename, a wrong path in a config key, an import left dangling, a signature two spokes disagreed about. These are edits you can state completely in the sentence it would take to delegate them.

Apply the test before you start, not after. An edit that turns out larger than it looked is a signal to stop and delegate the rest, not to finish it because you are already in the file.

Delegate regardless of size when any of these hold:

- **It was a piece of the plan.** Anything you decomposed and showed at the gate goes to a spoke. Otherwise you keep whichever parts you find interesting and the decomposition stops meaning anything.
- **You would have to read code you have not already read.** The moment you open implementation detail in order to make an edit, you are spending the context the topology exists to protect. Not already knowing enough to make the edit is itself the answer.
- **A dispatched spoke owns the file.** You write into the same tree the spokes do. A write set you handed a running spoke binds you too, and nothing errors when you clobber each other.
- **You would want the result checked by someone other than its author.** If you would have pointed a verifier at it, you wanted a spoke.

An edit is not verified by the fact that you made it. Run the check you would have asked a spoke to run, and list your own edits separately in the closing report so the user can see which changes never passed through a spoke's verification.

## 1. Scope

Establish what is actually being asked before splitting anything. A wrong decomposition wastes every spoke downstream of it, and it is cheap to catch here.

Read enough to decompose competently and no more. You need the shape of the problem: which subsystems it touches, what conventions the surrounding code follows, what checks the project already runs. You do not need the implementation detail, which is what you are delegating.

State the scope in one or two lines before moving on. If the request is ambiguous in a way that changes the decomposition, ask now. Ambiguity that only changes one spoke's work goes into that spoke's brief as a stated assumption instead.

## 2. Decompose

Split on genuine independence, not on tidiness.

- Two pieces belong to different spokes when neither needs the other's output **and** they write disjoint files.
- A piece that needs another's output is a later stage, not a parallel peer. Sequence it, and put the predecessor's actual result into its brief.
- Split for perspective, not throughput, when the value is disagreement (competing designs, adversarial review).
- Do not split what one spoke finishes in one pass. Three spokes each taking a third of one file is slower, and produces a seam that costs more to reconcile than the file cost to write.
- If you cannot state a piece without referring to this conversation, it is not decomposed yet. Keep going.

Prefer the smallest number of spokes that covers the work. Past about five concurrent spokes, say in the plan why the fan-out earns its cost.

The table you show at the gate is the ledger for the run, and a script keeps it: `node "${CLAUDE_SKILL_DIR}/scripts/ledger.js" --run ${CLAUDE_SESSION_ID} <command>`. At the gate, `init` takes the rows on stdin: a `title: <task>` line, then one `<#> | <kind> | <spoke> | <scope> | <after>` line per row, where `<after>` lists the row numbers it waits on and `hub` as the spoke marks one of your own verify or integrate steps. As a spoke is dispatched or returns, `set <#> <status> [note]` records it, with status `running`, `done`, `retry`, `failed`, or `dropped`, and prints one line; `set 2,3 running` covers a batch. A piece added mid-run goes in with `add`, in the same row format.

Print the full table only at the gate (the plan view `init` prints), when a stage completes, and in the closing report (`show` for both). The user does not see tool output, so paste the script's output verbatim in a code block and never retype or realign it. If the script cannot run, for instance because `node` is missing, print the table by hand in the same layout.

Refer to pieces by row number. The ledger is the only place a dropped task becomes visible, and because its state is a file keyed to this session rather than text in the conversation, it survives context compaction. The closing report accounts for every row.

The decomposition is yours. Where a piece's shape depends on something you have not traced, make the trace an investigation piece and put what depends on it in a later stage. Where the `refine` plugin is installed, start from `/refine:wbs` or `/refine:invest` output if the user already ran them, or run them yourself when the pieces are not obvious; ready items from `/refine:invest` carry objective, context, scope, boundaries, and check, which are five of the six fields a brief needs, so you add the return shape.

## 3. Route

For each piece, pick the spoke.

Check the agent types available in this session first. Installed specialists carry domain technique this plugin's generics do not: a language reviewer knows that language's failure modes, a build resolver knows its toolchain. Route to one when its description matches the piece's domain, and prefer the most specific match.

Fall back to the generics this plugin ships when nothing fits: `hub-investigator` for read-only tracing and questions, `hub-implementer` for a scoped change, `hub-verifier` for testing one claim adversarially.

When you route to an installed specialist, your brief governs **scope** (objective, files, boundaries, return shape) and the specialist governs **technique** within it. Where its system prompt tells it to do something your brief forbids, say so explicitly in the brief rather than assuming your instruction wins.

Some pieces have a procedure that sets their shape or their check:

- Where the `verify` plugin is installed, an untested change point goes to `/verify:characterize` first, and the tests it pins become that piece's Check.
- Where the `change` plugin is installed, an interface change whose callers fall in different spokes' write sets goes to `/change:parallel-change`: one expand piece, then the migrate pieces in parallel, then contract.
- Where the `verify` plugin is installed, a claim that behaviour is unchanged goes to `/verify:differential`, run against `HEAD` once every writing spoke has landed, with any difference traced to its spoke through the write sets.
- Where the `verify` plugin is installed, tests a spoke wrote against source that is still clean in `git` go to the `verify:verify-mutator` agent, dispatched directly so the suite runs stay out of your context. Mutating source a spoke changed needs a commit first, because the mutation script refuses a dirty target, so offer it in the closing report instead.

## 4. Gate

Show the plan and stop. Do not dispatch until the user responds.

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

Under the table, in a few lines: what each spoke is for where the row is not self-evident, what runs in parallel and what waits on what, which files each writing spoke owns, and anything you decided not to delegate and why.

Then say what you would change on request, and wait. The user's reply either approves it or redirects it; treat a redirect as a new decomposition rather than a patch to this one if it moves the seams. After dispatch, carry a redirect to the spokes it still fits by continuing them with `SendMessage`, and stop the ones it makes moot with `TaskStop`.

## 5. Dispatch

### The brief

Every spoke starts cold. It cannot see this conversation, it cannot see other spokes, and it cannot ask you a question. A brief that says "the file we looked at" or "as discussed" sends a spoke to guess.

Each brief carries:

- **Objective.** One paragraph. What done looks like, stated so the spoke can tell whether it got there.
- **Context.** What you learned in phase 1 that this spoke needs and would otherwise have to rediscover: the conventions in play, the shape of the surrounding code, the decision already taken and not up for revisiting. Include the predecessor's result verbatim where the piece is a later stage.
- **Scope.** The exact paths it may read, and for a writing spoke, the exact paths it may write. Nothing outside the list.
- **Boundaries.** What not to do. Name the adjacent work belonging to another spoke, so it does not helpfully absorb it.
- **Check.** The command that decides success, or the observable condition if there is no command.
- **Return.** The shape you want back. State that the final message is the return value, that the hub reads it rather than a person, and that file contents and diffs do not belong in it. The generic spokes carry their own return shape, so a brief to one states only what it adds or replaces.

Write briefs for the spoke that will actually read them. A brief for a generic spoke carries more context than one for a specialist that already knows the domain.

### Running them

Dispatch independent spokes in one message so they run concurrently. Sequential dispatch of independent work is the most common way this pattern loses its whole advantage.

Spokes share one working tree. Two spokes writing the same file at the same time will clobber each other with no error, so the write sets you declared at the gate are a hard constraint, not documentation. Where the work genuinely cannot be partitioned that way, either sequence the writers or give each one worktree isolation. Before the first dispatch, record `git status --porcelain`, so phase 6 can tell a spoke's changes from what was already dirty.

Relay as results land: the `set` line is the relay, with a sentence after it only where the result changes the plan. The user does not see a spoke's report, only you do. A run that goes quiet for five spokes and then emits a wall of text is worse than one line as each one returns.

Never predict, summarise, or fabricate the result of a spoke that has not returned. If the user asks meanwhile, say it is still running.

## 6. Verify

A spoke's report is a claim about the tree, not a fact about it. It was written by a model that wanted to have succeeded.

Once the writing spokes land, compare the files actually changed against the union of the declared write sets, using `git status --porcelain` so untracked files count and discounting what was dirty before dispatch. Any file outside them is a finding before any other check runs.

Check the claims the rest of the work rests on. Re-run the decisive command yourself and read its exit status rather than the spoke's account of it. Read the changed file where the change was subtle. Dispatch `hub-verifier` where the claim is load-bearing and refuting it takes real work.

Verify in proportion to consequence. A spoke reporting a docs edit does not need an adversarial pass; a spoke reporting that an auth path is now safe does.

When a spoke returns `partial`, `blocked`, or nothing at all, or leaves gaps the plan depended on, do not absorb the gap silently. Retry once, naming what went wrong, and if it fails again, report it as unfinished. An `unverifiable` verdict is not retried: it goes under **Worth knowing** with what would test it. A task that quietly vanishes between decomposition and summary is the failure mode that makes orchestration untrustworthy.

Continue a spoke with `SendMessage` for that retry or for a fix pass on its own files, since its context is intact; start a fresh one with a sharper brief when that context is the problem. Never continue a verifier with the story behind the claim, and because a fork inherits this whole conversation, never fork a verifier or fork to avoid writing a brief.

## 7. Integrate

Reconcile the seams. Independent spokes produce locally correct work that does not fit: a helper written twice under two names, an interface changed on one side of a call, a config key added that nothing reads. Where the `questions` plugin is installed, have an investigator spoke run `/questions:what` over the run's range, named exactly in its brief so the diff stays out of your context, and treat its **Loose ends** as seam candidates.

This is where direct editing earns its exception most often. A seam is usually small and already fully visible to you: you hold both spokes' reports and you know exactly what does not line up. Apply the test above. Mechanical reconciliation is yours. A seam that turns out to be a design disagreement between two spokes is an integration spoke, briefed with the specific conflict and the files it may touch.

Then close with:

- **Done.** What now works, and how you know: the check you ran, not the check a spoke said it ran.
- **Edited directly.** Any change you made yourself rather than delegating, one line each, with the check you ran on it. Omit when there were none.
- **Not done.** Anything from the plan that did not land, and why. State this even when the run mostly succeeded.
- **Worth knowing.** Risks and assumptions the spokes surfaced that survive into the result.

## Anti-patterns

- **Fanning out for the appearance of rigour.** Five spokes on a task one handles is slower, costs more, and produces seams that did not need to exist. The topology is a tool for work that is genuinely wide or genuinely needs isolation.
- **Briefs that assume shared context.** The single largest cause of a spoke returning something confidently irrelevant.
- **Accepting reports as results.** See phase 6.
- **Letting spokes negotiate.** They cannot see each other. Every dependency between them is your responsibility to sequence and to carry across in a brief.
- **Reading the whole codebase to plan.** You need the shape, not the detail. Filling your own context in phase 1 defeats the reason to delegate at all.
- **Absorbing the work one small edit at a time.** Every individual exception looks justified. The accumulation is a hub doing the implementation with extra steps, holding exactly the detail it delegated in order not to hold. Several direct edits in one run is evidence the decomposition was wrong, and saying so is more useful than continuing.
