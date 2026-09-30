---
name: parallel-change
description: Use when an interface change (a signature, type, schema, config key, API, or event) has consumers across several files, so it cannot land as one green change, when the user asks or as a step inside /hub. Not for a change whose consumers all sit in one write set. Plans it as Sato's Parallel Change, which expands, migrates in batches with disjoint write sets, then contracts.
argument-hint: [the interface change to plan]
allowed-tools: Read Grep Glob
disallowed-tools: Edit Write NotebookEdit
---

Plan this interface change: $ARGUMENTS

Danilo Sato's Parallel Change (https://martinfowler.com/bliki/ParallelChange.html, 2014), also called expand and contract, breaks a backward-incompatible change to an interface into three phases. Expand adds the new form beside the old. Migrate moves the consumers across. Contract removes the old form once nothing uses it. Every phase leaves the system working, and that is the whole of the method's value.

The failure it addresses is the interface change landed as one edit. A signature, a type, a schema column, a config key, an API field, or an event payload changes, and every consumer must change in the same commit. For one person that is a large diff that stays red until the last file compiles. For parallel work it is worse. The callee and its callers fall in different write sets, no writer can go green alone, and the seam only shows at integration, as an interface changed on one side of a call.

The rule this skill enforces: **every piece leaves the tree green**, and the one piece that cannot be undone runs last, behind a check proving nothing still needs what it removes.

This plans the change. It does not make it, and it edits nothing.

## When it applies

Use it when the old form has consumers in more than one write set: several modules, several packages, several services, or stored data already written in the old shape.

Do not use it when:

- The change is inside one file, or every consumer sits in one write set. One owner edits the callee and the callers in one pass, and three phases is ceremony.
- Nothing consumes the interface yet. Unpublished code has no old form worth keeping.

At system scale, where a whole component is being replaced rather than one interface, the same idea is Martin Fowler's Strangler Fig (https://martinfowler.com/bliki/StranglerFigApplication.html). This skill plans one interface, not a replacement system.

## Resolve the change

- **An argument.** Plan that.
- **Nothing.** Take the change on the table and restate it in one line: the old form, the new form.
- **A step inside `/hub`.** Plan the change the hub names and return the pieces to it. Dispatch nothing.
- **Several interface changes bundled.** Separate them and plan each. Where one new form depends on another, say which expands first.
- **Nothing on the table.** Say so and stop.

## 1. Find every reference

The size of this plan is a count, and the count is in the repository. Read before planning.

- **The old form.** File, symbol, and exactly which part of its shape changes.
- **Every reference, with counts.** Search for the symbol and for its aliases, re-exports, string lookups, config files, fixtures, serialised data, generated code, and docs. Report the count per file and the total.
- **What search cannot see.** Dynamic dispatch, a key assembled from strings, consumers in another repository, stored payloads, published clients on old versions. Name each. These decide whether contract is ever safe.
- **The grouping.** Group the references by write set, meaning the module or directory one owner would take. These groups become the migrate batches.

Where the old form's behaviour is not pinned by tests at the interface, the first piece is a characterization test (Feathers, *Working Effectively with Legacy Code*, 2004). Without it, "the old form keeps working" is a claim nothing can check.

## 2. Choose how old and new coexist

Pick one mechanism and say why that one.

- **Delegation.** The old form becomes a thin call into the new one. The default for functions and methods, because there is one implementation and nothing can drift.
- **Adapter.** A shim translates between shapes where they differ too much for delegation. Keep it trivial, since it is code that can be wrong.
- **Dual-write and dual-read.** For data and schemas. Readers accept both shapes before any writer switches, writers then write both, and a backfill moves the rest.
- **A new version.** For a published API or event: the new endpoint or schema version beside the old, with the old one marked deprecated.
- **A feature flag.** Where the switch must happen at runtime or reverse without a deploy. The flag carries an owner and a removal date, or it becomes the permanent interface.

Expand must not change the old form's behaviour. Where delegation would alter it (a different default, an error thrown where null came back), the old form keeps its own path or the adapter restores the difference.

## 3. Define the contract gate

Contract is gated by a check, not by the batches reporting done. State it as commands:

- A search for the old symbol and every alias from step 1, returning nothing outside the old definition itself.
- The test suite, green.
- For each reference search cannot see, the specific evidence: a log query showing no calls, a count of zero rows in the old shape, a client version floor.
- **The trigger or deadline.** The date, release, or event at which contract runs. An expand with no trigger is how a codebase ends up with two interfaces permanently.

Say what the gate returns now, which is the count from step 1, so it can be seen to fail today.

## 4. Emit the pieces

Every piece carries **Objective**, **Write set**, **Check**, and **Depends on**.

- **Expand.** One piece, one writer. Adds the new form and the coexistence mechanism, writing only the interface's own files. Check: the existing suite passes unchanged, plus a test on the new form, plus the pinned-test command where the interface was characterized first. Depends on the characterization piece where there is one, otherwise nothing.
- **Migrate.** One piece per batch from step 1. Each batch moves its references to the new form and touches nothing else. Write sets are disjoint, with no file in two batches. Every batch depends on expand and on nothing else, so the batches run in any order and together form the parallel front. Check: the suite passes, and the search for the old form scoped to the batch's paths returns nothing.
- **Contract.** One piece, run last. Removes the old form and whatever held it up: the delegation, the adapter, the flag, the dual-write. Depends on every migrate batch. Check: the gate from step 3.

Size the batches by ownership, not by file. One batch per file is overhead, and one batch for everything is the original problem again. Two to about six is usual.

## Guardrails

| Anti-pattern | Why it fails | Repair |
| --- | --- | --- |
| Contract before migration is complete | Every reference not yet moved breaks at once, and it is the one step with no way back | Gate it on the search and the suite, not on batches reporting done |
| A migrate batch that also edits the interface | Two writers on one file, and the batches stop being independent | The batch stops and reports. The fix is a new expand piece |
| An expand that changes the old form's behaviour | Every unmigrated caller changes under it with nothing red to say so | Preserve the old path, or restore the difference in the adapter |
| An expand that never contracts | Two interfaces forever, and new code picks one at random | A stated trigger or deadline in the contract piece |
| Data readable in only one shape during migrate | Rows written by one side become unreadable to the other | Dual-read lands in expand, before any writer switches |

## Output

- **The change**, in one line: the old form, the new form, and why it cannot land as one green change.
- **The references**: count per write set, the total, and every reference search cannot see.
- **The coexistence mechanism**, and why that one.
- **The contract gate**, as commands, with what it returns now and the trigger or deadline.
- **The pieces**, as a table with columns: number, phase, objective, write set, check, depends on.
- **Open risks**: consumers outside the search, old behaviour no test pins, anything that would make contract unsafe on its trigger date.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/hub`.** Sequential, if the `hub` plugin is installed, and the reason for the output shape. Each piece arrives with its objective, scope, check, and ordering already filled, and the boundaries follow from the phase. The hub runs expand, fans out the migrate batches in one message, re-runs the gate itself, then runs contract.
- **`/verify:characterize`.** Sequential, if the `verify` plugin is installed, and it comes first. Where the interface's current behaviour is untested, that pins it before expand, and the command running the pinned tests becomes part of the Check of expand and of every migrate batch.
- **`/refine:wbs`.** Sequential, if the `refine` plugin is installed. Where the interface change is one node in a larger breakdown, this is how that node decomposes, and the deprecation and old-code deletion that `/refine:wbs` checks for by name are the contract piece.
- **`/refine:invest`.** Sequential, if the `refine` plugin is installed. Grade the pieces before dispatch and emit them in full brief shape. A migrate batch failing **I** is a write set overlap, which is a planning error to fix here.
- **`/decide:reversible`.** Reinforcing, if the `decide` plugin is installed. Expand and each migrate batch are two-way doors. Contract is the one-way piece, and the door closes when it lands.
- **`/verify:differential`.** Reinforcing, if the `verify` plugin is installed. During migrate the old and new forms should behave the same, and running both against the same inputs is the evidence that lets the old path stay until it is not needed.

## Before you send

- Was it established that the consumers span more than one write set, so the ceremony is earned?
- Were the references counted from the repository, per write set, rather than estimated?
- Is every reference search cannot see named, with the evidence that would clear it?
- Is the coexistence mechanism named, and does expand leave the old form's behaviour unchanged?
- For data and schemas, are both shapes readable for the whole of migrate?
- Do any two migrate batches write the same file, or does any batch depend on another?
- Does any migrate batch edit the interface?
- Is the contract gate a set of commands, and is it said what it returns now?
- Does contract carry a trigger or deadline?
- Does every piece carry an objective, a write set, a check, and its dependencies?
