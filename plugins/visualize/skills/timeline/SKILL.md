---
name: timeline
description: Render a dated sequence of events as a vertical timeline, for release plans, project milestones, or incident sequences.
argument-hint: [content to visualize, or nothing to use the last output]
disable-model-invocation: true
allowed-tools: Bash(node *) Read Grep Glob
disallowed-tools: Edit Write NotebookEdit
---

Render $ARGUMENTS as a vertical timeline.

## Resolve what was asked

- No argument: the target is the last substantive assistant message in the conversation, not this invocation. Pull whatever dated or ordered sequence fits out of it.
- The argument IS the content, a described sequence of events: use it directly.
- The argument NAMES something else, a file, "the project milestones", "the release history": locate it first with Read, Grep, or Glob the way `/where` or `/how` would, then extract the events.
- Never invent events to fill the shape. If the source has no dated or ordered sequence to extract, say what was inferred, or say the fit is poor and point at a better-suited visualize skill (a list or a table) instead of forcing it.

## Schema

The script reads this exact JSON on stdin:

```json
{
  "title": "optional string",
  "events": [
    {"date": "2026-01-10", "time": "09:00", "label": "Kickoff"},
    {"date": "2026-02-01", "label": "Beta launch"}
  ]
}
```

- `title`: optional string, printed above the timeline.
- `events`: required array. Each entry needs `date` (non-empty string) and `label` (non-empty string).
- `time`: optional per-event, 24-hour `HH:MM` (`^([01]\d|2[0-3]):[0-5]\d$`), e.g. `"09:00"` or `"14:30"`. An event without `time` renders just the marker and label, as it always has.

Rendering is vertical: one event per row, right after its date, joined by a `│` spine. Not horizontal. A horizontal timeline cannot keep proportional date spacing legible at arbitrary terminal widths, so every event gets its own row instead.

Consecutive events sharing the same `date` are grouped under one date heading: the date prints only on the first event of each run, and later events in that run get a blank, padded date column instead of repeating it. This only groups events that are already adjacent in the array, so list same-day events back to back in the input; a same-day event separated from its group by a different date prints its own date heading instead of joining the group.

Output characters: standard text for dates, times, and labels, plus two glyphs, `●` marking each event and `│` as the spine between them. Both are single-code-unit box-drawing/marker characters, not multi-part Unicode sequences. Nothing else in the render is Unicode.

The script does not sort `events`. It assumes the array already arrives in chronological order and renders it exactly as given. Sorting date strings correctly requires parsing assumptions (format, timezone) outside this skill's scope, so reorder the source data yourself before building the payload if it is not already in order.

## Render

Build the JSON payload from the resolved events, then pipe it through the script from this skill's own base directory (Claude Code states the base directory when the skill loads):

```
node scripts/render.js <<'JSON'
{ ... }
JSON
```

Relay stdout verbatim. Never hand-retype or adjust its spacing.

A non-zero exit means the JSON was malformed or missing a required field: stderr names the problem. Fix the JSON once and retry. If it still fails, say so rather than hand-drawing a fallback.

## Output

- The rendered block, exactly as the script printed it.
- One line noting the source used (the conversation, the named file, and so on) and anything inferred or reordered.
