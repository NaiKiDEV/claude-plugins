---
name: where
description: Locate every reference to a symbol, config key, string, or concept anywhere in the project and report them as a quickfix-style hit list with a short summary.
argument-hint: [what to locate]
disable-model-invocation: true
allowed-tools: Grep Glob Read
disallowed-tools: Edit Write NotebookEdit
---

Find everywhere $ARGUMENTS appears in this project.

## Resolve the target

State what you are looking for before searching, and what kind of thing it is. Targets are not always code. A config key, an env var, a copy string, a doc topic, a ticket ID, a data field, and a class name are all valid.

- No argument, or a reference that depends on context such as "this class" or "that setting you just mentioned". Resolve it from the most recent relevant subject in the conversation and say what you resolved it to.
- Where several distinct things share the name, report each separately under its own header rather than merging them.
- For a concept rather than a literal token, such as "the retry policy" or "onboarding copy", no single pattern will find it. Search the synonyms and related terminology too, and list the terms you actually used so the user can see the shape of the search.

## Search

- Use whatever search tooling this session offers, preferring surfaces that keep raw output out of context: an indexed, batched, or semantic search tool provided by an MCP server or plugin beats a raw scan. Fall back to `Grep` and `Glob` when nothing better is available.
- Match the surfaces to the target. Code symbols live in source, tests, and type declarations; config keys live in env files, CI, manifests, and deploy config; prose lives in docs, comments, changelogs, and README files; strings live in locale files, fixtures, and templates.
- Cover the whole project, not just source directories. Include plausible alternate spellings (`camelCase`, `PascalCase`, `snake_case`, `SCREAMING_SNAKE`, `kebab-case`, plural forms) when they refer to the same thing.
- Skip lockfiles, build output, and vendored dependencies. If you skip a path that likely holds real hits, say which and why.
- Where a tag is ambiguous, read the surrounding region to settle it. Do not guess from the matched line alone, and do not read whole files to find hits.
- If the target plainly is not in the project and a connected surface could hold it, such as an issue tracker, a docs site, or a dashboard, say so instead of reporting a bare zero.

## Output

A quickfix list. Every row carries its full `path:line:col` so the anchors stay clickable, a blank line separates files, and columns are padded to align:

```
 where › ApiClient                                   23 hits · 7 files
 ─────────────────────────────────────────────────────────────────────
 src/lib/api-client.ts:14:14    def  export class ApiClient {
 src/lib/api-client.ts:28:3     use    return new ApiClient(baseUrl)

 src/features/auth/login.ts:3:10    imp  import { ApiClient } from '@/lib/api-client'
 src/features/auth/login.ts:19:18   use  const client = new ApiClient(env.API_URL)

 docs/architecture.md:88:5    doc  All outbound calls go through `ApiClient`.
```

- Paths relative to the project root. Drop `:col` for prose hits where a column number carries no meaning.
- Show the matched line in full, trimmed of surrounding whitespace. Elide only a pathologically long line, such as a minified bundle or an embedded data blob, and mark the cut with `...`.
- Order files by relevance: canonical definition first, then descending hit count.

Tags, padded to three characters. Core set, for any target:

`def` definition or origin · `ref` mention or reference · `cfg` configuration · `doc` documentation or prose · `tst` test · `dat` data, fixture, or asset

A code symbol adds: `exp` export · `imp` import · `use` call site or instantiation · `typ` type position

Then a **Summary** of at most four lines covering where the thing originates, the shape of its usage (a single wrapper, three duplicated call sites, one hot path), and anything surprising: a dead export, a second unrelated thing sharing the name, a config key read nowhere, or references only from tests.

On zero hits: say so, list the patterns and paths you searched, and name the closest matches you did find.

Report only. Writes are blocked for this turn; if the user wants a change, locate it and say the change needs a follow-up message.
