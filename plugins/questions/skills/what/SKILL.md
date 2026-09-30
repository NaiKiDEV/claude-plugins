---
name: what
description: Use when describing what changed over a range (a diff, a branch, a commit range, or the changes a /hub run made), including the loose ends it left, when the user asks or as a step inside /hub. Not for reviewing whether a change is correct, or for how or why the changed code works. Summarizes what changed in a scope, covering session edits, working tree, staged, a branch, or a commit range, grouped by intent rather than by file.
argument-hint: [scope or thing that changed]
allowed-tools: Bash(git status *) Bash(git diff *) Bash(git log *) Bash(git show *) Grep Glob Read
disallowed-tools: Edit Write NotebookEdit
---

Report what changed in $ARGUMENTS.

## Resolve the scope

State the exact scope before reporting anything, as the ref range or command it corresponds to. Never leave it implicit. "What changed" is ambiguous, and the wrong scope makes the entire answer wrong rather than slightly off.

- No argument: the edits made during this session. If the working tree holds changes you did not make, report those separately instead of folding them in.
- A branch, tag, sha, or range such as "since main": that range.
- "staged" or "uncommitted": the index or the working tree specifically.
- A subject rather than a range, such as "what changed about auth": find the changes touching it and state how far back you looked.

## Rules

- Group by intent, not by file. One behavioral change spanning four files is one entry; four unrelated edits inside one file are four entries.
- Anchor every entry to `file:line`.
- Separate what the diff shows from what you think it means. A changed line is citable. "This fixes the race" is a claim, so tag it `[inferred]` unless something records it.
- Never claim authorship of edits you did not make. Yours are `[session]`. Anything else in the tree is `[unattributed]`: report it and say you do not know where it came from.
- Report deletions, renames, and moves, not just additions.
- Do not summarize a diff you did not read.

## Output

- **Scope.** The exact range examined, as a command or ref range, with counts: `N files · +A/-B`.
- **Changes.** Grouped by intent, most significant first. Each entry is a one-line description followed by its anchors, tagged `new` `mod` `del` `mov`.
- **Loose ends.** Changes that look unfinished: a symbol renamed in one place only, a new config key nothing reads, a removed caller whose function survives, or a test updated without the code it covers. Omit when there are none.

Match length to the size of the change. A two-file diff gets a few lines, not a report.
