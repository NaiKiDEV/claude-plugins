# timeline examples

Each pair below is real: the JSON was piped into `scripts/render.js` and the fenced block after it is the script's actual stdout, unedited.

## 1. Titled timeline, three events, no times

Input:

```json
{
  "title": "Launch Plan",
  "events": [
    {"date": "2026-01-10", "label": "Kickoff"},
    {"date": "2026-02-01", "label": "Beta launch"},
    {"date": "2026-03-15", "label": "General availability"}
  ]
}
```

Output:

```
Launch Plan

2026-01-10  ●-- Kickoff
            │
2026-02-01  ●-- Beta launch
            │
2026-03-15  ●-- General availability
```

An event without `time` renders exactly like this: marker, then label, nothing between.

## 2. Same-day multi-event, mixed timed and untimed

Input:

```json
{
  "events": [
    {"date": "2026-01-10", "time": "09:00", "label": "Kickoff"},
    {"date": "2026-01-10", "time": "14:30", "label": "Design review"},
    {"date": "2026-01-10", "time": "18:00", "label": "Retro"},
    {"date": "2026-02-01", "label": "Beta launch"}
  ]
}
```

Output:

```
2026-01-10  ●-- 09:00  Kickoff
            │
            ●-- 14:30  Design review
            │
            ●-- 18:00  Retro
            │
2026-02-01  ●-- Beta launch
```

The three `2026-01-10` events are consecutive in the input, so the date prints once and later rows in the run get a blank, padded date column. The spine still runs between every event, grouped or not. `Beta launch` has no `time`, so it falls back to the untimed row shape, and its own date is a new run so it prints normally.

## 3. No title, five events, widely varying label lengths

Input:

```json
{
  "events": [
    {"date": "2025-11-01", "label": "Q4 planning"},
    {"date": "2025-12-05", "label": "A"},
    {"date": "2026-01-10", "label": "Security review and remediation sign-off"},
    {"date": "2026-01-20", "label": "Freeze"},
    {"date": "2026-02-14", "label": "Regional rollout begins across three continents"}
  ]
}
```

Output:

```
2025-11-01  ●-- Q4 planning
            │
2025-12-05  ●-- A
            │
2026-01-10  ●-- Security review and remediation sign-off
            │
2026-01-20  ●-- Freeze
            │
2026-02-14  ●-- Regional rollout begins across three continents
```

Label length has no effect on the date column or spine width. Only the date strings set that column's width.
