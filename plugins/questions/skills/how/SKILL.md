---
name: how
description: Explain how something actually works by tracing it through the code, with every step anchored to a real location.
argument-hint: [what to explain]
disable-model-invocation: true
allowed-tools: Grep Glob Read
disallowed-tools: Edit Write NotebookEdit
---

Explain how $ARGUMENTS actually works.

## Resolve the subject

- No argument: the thing most recently discussed. Name it before starting so the user can redirect.
- A behavior rather than a symbol, such as "how does auth work": locate the entry point first and say which one you picked, since a feature usually has several and the choice shapes the whole answer.

## Rules

- Trace it. Read the actual path before describing it. Never reconstruct a plausible architecture from file and symbol names.
- Anchor every step to `file:line`. A step you cannot anchor is tagged `[inferred]` and named as a gap in the trace rather than smoothed over.
- Describe what the code does, not what it is meant to do. Where a name, comment, or doc claims something the code does not do, report the divergence. That gap is usually the most useful thing in the answer.
- Cover error and edge paths, not only the happy path. If you traced just the happy path, say so explicitly.
- Do not report a confidence level. Anchors and `[inferred]` carry that information in a form the user can check for themselves.

## Output

- **Entry point.** Where execution starts, anchored.
- **Flow.** Numbered steps, one line each with its anchor. Show branches as branches; do not flatten a conditional into a single narrative path.
- **State and invariants.** What is held, mutated, cached, or assumed across steps. Omit when there is none.
- **Where it breaks.** Unhandled cases, swallowed errors, and assumptions that would yield wrong output rather than a failure. Omit only if you looked and found none, and say that you looked.

Match depth to the question. "How does this function work" is a few steps; "how does auth work" is a flow across layers.
