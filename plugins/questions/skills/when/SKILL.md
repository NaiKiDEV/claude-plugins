---
name: when
description: Date when something landed, whether a change, a file, a line, or a regression, distinguishing authored, committed, merged, and released timelines.
argument-hint: [what to date]
disable-model-invocation: true
allowed-tools: Bash(git log *) Bash(git show *) Bash(git tag *) Bash(git blame *) Bash(git describe *) Grep Glob Read
disallowed-tools: Edit Write NotebookEdit
---

Establish when $ARGUMENTS landed.

## Which date is being asked for

These are four different dates and the difference usually matters. Say which one you are reporting.

- **Authored.** When the work was written.
- **Committed.** When it entered this history. A rebase, squash, or cherry-pick moves this, sometimes long after the work was done.
- **Merged.** When it reached the target branch.
- **Released.** The first tag or release containing it. When the question means "when did users get this", this is the answer and the commit date is not.

Default to authored, merged, and first containing release. Add committed only when it diverges from authored, and say why it likely diverges.

## Rules

- Anchor every date to the short sha it came from.
- "When did this break" is a bisect question, not a log question. Say so, establish the last known-good and first known-bad points if you can, and give the `git bisect` invocation instead of guessing a culprit from the log.
- Squashed or rebased history destroys original chronology. When the signals point that way, such as one commit adding a large feature or a committer date far from the author date, say the recorded date may not be when the work happened.
- A shallow or partial clone truncates history. If the range you need is absent, say so rather than reporting the oldest available commit as the origin.
- Give absolute dates. Relative age belongs in parentheses, never on its own.

## Output

- **Landed.** The date asked for, with its sha and which kind of date it is.
- **Timeline.** The relevant points in order, one line each: `2026-04-12  a1b2c3d  authored  <subject>`. Include the merge and the first containing tag where they exist.
- **Caveats.** Only when the history is squashed, rebased, shallow, or otherwise unreliable for this particular question.

Match length to the question. A single "when did this land" gets the date and the sha.
