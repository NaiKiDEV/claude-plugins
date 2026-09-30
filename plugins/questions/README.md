# questions

Interrogatives for work in progress, all manual except `/what`. Six skills that explain or locate, none of which change anything.

| Skill | Question it answers |
| --- | --- |
| [`/why`](#why) | Why was this decided or claimed? |
| [`/where`](#where) | Where does this live? |
| [`/what`](#what) | What changed? |
| [`/how`](#how) | How does this actually work? |
| [`/who`](#who) | Who do I ask about this? |
| [`/when`](#when) | When did this land? |

## Conventions

These hold across every skill in the plugin.

**Manual, except `/what`.** Five skills set `disable-model-invocation: true`. Claude never invokes one of them on its own. They run when typed, and their descriptions stay out of context until then. `/what` does not, so that where the [`hub`](../hub) plugin is installed, `/hub` can run it over a run's changes and treat its loose ends as seam candidates: a skill with the flag can be invoked only by a user typing its name, and neither the main session nor a subagent can reach it. Its description opens with a narrow trigger and says it applies when the user asks or as a step inside `/hub`.

**Bare names resolve.** Autocomplete resolves `/why`, `/where`, `/what`, `/how`, `/who`, and `/when` directly. Use the `questions:` prefix when another installed plugin already claims one of those names, which is plausible for names this short and generic.

**Nothing writes.** Every skill sets `disallowed-tools: Edit Write NotebookEdit`, so a question cannot mutate the project. The restriction clears on the next message.

The restriction covers the whole invoking turn, which has a consequence worth knowing: `/where is the config loader, then rename it` locates the loader and is then unable to rename it. Send the change as a follow-up. The field enforces what the skill bodies already instruct, and removing it from a given `SKILL.md` reverts the behaviour.

**Claims carry provenance, not confidence.** Self-reported confidence from a model is poorly calibrated and cannot be checked by the reader, which makes it actively misleading on an explanation: it lends an unaudited guess the appearance of having been audited. Calibrating it properly requires external verification signal or sampling across independent attempts, neither of which fits a single-turn skill. No skill here reports one.

In its place, every load-bearing claim carries an inline tag stating how the claim is known:

| Tag | Meaning | How to check it |
| --- | --- | --- |
| `[session]` | Done or stated earlier in this conversation | Scroll back |
| `[src/db.ts:42]` | Recorded in the project | Follow the anchor |
| `[inferred]` | A reconstruction; nothing records it | Nothing to check, which is the point |
| `[unattributed]` | Present in the tree, origin unknown | Used by `/what` for edits it did not make |

A claim that cannot carry a tag is dropped rather than hedged. `[inferred]` is the expected tag for code whose rationale was never written down, and is preferred over presenting inference as a citation. Hedging words do not substitute for a tag: "probably X" with nothing behind it ranks below "X `[inferred]`".

`/who` reports a signal strength of `strong`, `moderate`, or `weak`, which is a different measure. It describes the evidence source, distinguishing an explicit `CODEOWNERS` rule from bulk-formatting blame, and is decided by a mechanical rule rather than by the model assessing its own certainty. The source it used is stated, so the rating can be checked.

**Search is backend-agnostic.** No skill hardcodes a search tool. Each asks for whatever tooling the session offers, preferring surfaces that keep raw output out of context, such as an indexed, batched, or semantic search tool from an MCP server or another plugin, and falls back to `Grep` and `Glob` otherwise. A context-minimizing search plugin is used automatically if one is installed, with no configuration here.

Each skill pre-approves the read-only tools it needs: `Grep`, `Glob`, `Read`, and scoped `Bash(git ...)` patterns for the history-based ones. Pre-approval does not restrict the tool pool, so every other tool stays callable, including tools from other plugins. Those follow existing permission settings and may prompt. Add them to a `permissions` allow list to avoid the prompt.

## `/why`

```
/why
/why did we have to choose this library?
/why is this cast safe?
```

Reports the reason actually acted on. Defaults, habits, and conventions copied from neighbouring code are legitimate answers and are named as such rather than presented as deliberate engineering. Invented rationales are excluded, and a decision that no longer holds is conceded rather than defended, since a `/why` is usually a challenge.

Where any part of an answer is `[inferred]`, a closing **Check** line names the one concrete thing that would confirm or refute it. The trigger is mechanical, so the line appears whenever trust is at risk rather than whenever the model registers uncertainty.

## `/where`

```
/where
/where are all the instances of this ApiClient class you just mentioned
/where is the retry budget configured
/where do we document the onboarding flow
```

The target does not have to be code. A config key, an environment variable, a copy string, a documentation topic, and a data field are all valid, and the skill states what kind of thing it resolved to before searching. Search surfaces follow from that: code symbols pull source and type declarations, config keys pull CI and deploy manifests, and prose pulls documentation and changelogs. Concept-level targets receive synonym expansion rather than one literal pattern, with the terms used reported.

Output is shaped like a Vim quickfix list, with a header carrying hit and file counts, then aligned rows in per-file blocks:

```
 where › ApiClient                                   23 hits · 7 files
 ─────────────────────────────────────────────────────────────────────
 src/lib/api-client.ts:14:14    def  export class ApiClient {
 src/lib/api-client.ts:28:3     use    return new ApiClient(baseUrl)

 src/features/auth/login.ts:3:10    imp  import { ApiClient } from '@/lib/api-client'

 docs/architecture.md:88:5    doc  All outbound calls go through `ApiClient`.
```

Every row carries its full `path:line:col` rather than sitting under a bare filename header. Claude Code linkifies `path:line`, so fully-qualified rows stay clickable while blank lines provide the visual grouping.

Tags are tiered so they remain meaningful off the code path. Any target uses `def` `ref` `cfg` `doc` `tst` `dat`, and a code symbol adds `exp` `imp` `use` `typ`. Matched lines are shown in full, and only a pathologically long line such as a minified bundle or an embedded data blob is elided.

## `/what`

```
/what
/what changed since main
/what changed about auth
/what is staged
```

Scope is resolved and stated first as an explicit ref range or command, since the wrong scope makes an answer wrong rather than merely incomplete. With no argument, the scope is the current session's edits.

Changes are grouped by intent rather than by file: one behavioural change across four files is one entry, and four unrelated edits in one file are four. Anchors are tagged `new` `mod` `del` `mov`.

Authorship is not claimed for edits Claude did not make. Its own are `[session]`, and anything else in the tree is `[unattributed]` and reported as unknown in origin. A **Loose ends** section flags changes that appear unfinished, such as a symbol renamed in one place only, a new config key nothing reads, or a test updated without the code it covers.

## `/how`

```
/how
/how does the retry wrapper work
/how does auth work
```

Traces the real path rather than reconstructing a plausible architecture from file and symbol names. Every step is anchored to `file:line`, and a step that cannot be anchored is tagged `[inferred]` and named as a gap in the trace.

Two outputs distinguish it from a code walkthrough. It reports **divergence**, where a name, comment, or document claims something the code does not do. It also closes with **Where it breaks**, covering unhandled cases, swallowed errors, and assumptions that would produce wrong output rather than a failure.

## `/who`

```
/who
/who owns the billing module
/who should review this
```

Sources are ranked by authority: an explicit `CODEOWNERS` rule outranks any heuristic, followed by substantive commit history, then review history and decision records.

Blame line counts are treated as a weak ownership signal, because a reformat, rename, lint pass, or bulk migration rewrites blame for lines someone else wrote. Commits that changed behaviour outweigh commits that touched many lines, recency is reported alongside each candidate, and thin history is reported as weak rather than presented as ownership.

It reports ownership signal rather than a verdict about a person, and says nothing about anyone's skill, seniority, availability, or code quality. People are referred to by the name or handle the repository records, using they/them pronouns, since a name does not indicate someone's pronouns and a guess misgenders a real person. Names and handles are preferred over email addresses.

## `/when`

```
/when
/when did the rate limiter land
/when did this break
```

Distinguishes the four dates that "when" conflates, being **authored**, **committed**, **merged**, and **released**, and states which one it reports. Default output is authored, merged, and the first containing release, because "when did users get this" is answered by the release rather than the commit date.

`/when did this break` is treated as a bisect question rather than a log question. It establishes last known-good and first known-bad where possible and supplies the `git bisect` invocation rather than inferring a culprit from the log. Squashed or rebased history and shallow clones are reported as caveats where the signals indicate them.

## Install

```
/plugin marketplace add naikidev/claude-plugins
/plugin install questions@naikidev
```
