# change

Change procedures for Claude Code. One skill, which plans the change that cannot land as one green edit: an interface whose consumers are spread across files, so the callee and its callers fall in different write sets and nothing is working midway.

| Skill | Protocol | Question it answers |
| --- | --- | --- |
| [`/parallel-change`](#parallel-change) | Sato's Parallel Change, also called expand and contract | This interface has callers everywhere. How does it change without breaking the tree? |

## What this does

It takes an interface change and turns it into a sequence in which every step leaves the system working. It plans the change. It does not make it.

The failure it addresses is the breaking change landed in one commit. A signature, a type, a schema column, a config key, an API field, or an event payload changes, and every consumer has to change with it. For one person that is a diff that stays red until the last file compiles. For parallel work it is the one change that cannot be partitioned: the callee and its callers belong to different writers, no writer can go green alone, and the break only appears at integration, as an interface changed on one side of a call.

Parallel Change removes that by adding a phase. The new form lands beside the old one first, so the consumers can move in batches that each stand alone, and the old form is removed only when a check proves nothing still uses it. The middle phase is the one that matters for orchestration, because its batches have disjoint write sets and no dependency on each other, which makes them a parallel front.

## Conventions

**Model-invocable.** The skill does not set `disable-model-invocation: true`, so that where the [`hub`](../hub) plugin is installed, `/hub` can call it mid-run when a piece of its decomposition turns out to be an interface change. The cost is that the skill's name and description sit in every session's skill listing, and Claude may invoke it on its own when a request matches. The description is written to narrow that: it leads with the specific trigger, an interface change whose consumers span several files, states that it applies when you ask or as a step inside `/hub`, and excludes a change whose consumers all sit in one write set.

**Read-only.** The skill pre-approves `Read`, `Grep`, and `Glob` and nothing else. It reads the repository and reports a plan. The edits belong to whoever runs the pieces.

**Check before you plan.** The skill counts the references to the old form, per write set, before emitting anything, because the size of the plan is a count and the count is in the repository. It also names the references a search cannot see: dynamic dispatch, keys built from strings, consumers in other repositories, stored data, published clients. Those decide whether the last phase is ever safe.

**The one-way step is gated.** Contract runs last and only behind a stated check: a search for the old symbol returning nothing, the suite green, and evidence for each reference the search could not reach. It also carries a trigger or a deadline, since an expand that never contracts leaves two interfaces in place permanently.

**Hyphens only.** The skill instructs Claude to write the ASCII hyphen and never the em dash or en dash, and to restructure with a full stop, comma, colon, or parentheses where a dash would otherwise appear.

## `/parallel-change`

```
/parallel-change
/parallel-change rename the timeout option on the HTTP client to deadline
/parallel-change move every call site off the deprecated logger
/parallel-change split the name column into given and family names
```

Danilo Sato's Parallel Change, published on Martin Fowler's bliki in 2014. Three phases: expand, migrate, contract. Fowler's Strangler Fig is the same idea at the scale of a whole system, and is out of scope here.

- **Expand is one piece and one writer.** It adds the new form beside the old, using a named coexistence mechanism: delegation, an adapter, dual-write and dual-read for data, a new API or event version, or a feature flag with an owner and a removal date. It must not change the old form's behaviour.
- **Migrate is the parallel front.** One piece per batch of consumers, grouped by ownership rather than by file. No two batches write the same file, no batch depends on another, and no batch edits the interface. A batch that finds the new form inadequate stops and reports, and the fix is another expand.
- **Contract is the one-way piece.** It removes the old form and whatever held it up, behind the gate, after every batch.
- **Data stays readable in both shapes** for the whole of migrate. Readers accept both before any writer switches.
- **Untested behaviour is pinned first.** Where nothing checks the old form at the interface, the first piece is a characterization test, because "the old form keeps working" is otherwise a claim nobody can verify.
- **It declines when there is nothing to stage.** A change inside one file, or one whose consumers all sit in one write set, is one owner's single pass, and three phases would be ceremony.

## Handing off to orchestration

Each piece is emitted with four fields:

```
Objective    what done looks like for this phase or batch
Write set    the exact paths the piece may write, disjoint across migrate batches
Check        the command that decides it, and for contract, the gate
Depends on   expand on nothing, each batch on expand, contract on every batch
```

Where the [`hub`](../hub) plugin is installed, these map onto a spoke brief's objective, scope, and check, with the ordering the gate needs already stated and the boundaries implied by the phase. The hub runs expand, fans the migrate batches out in one message, re-runs the gate itself, then runs contract. Where the [`refine`](../refine) plugin is installed, `/refine:invest` can grade the pieces first and emit them in full brief shape.

## Installation

```
/plugin install change@naikidev
```
