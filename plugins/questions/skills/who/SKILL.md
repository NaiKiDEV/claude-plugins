---
name: who
description: Identify who to ask about a file, symbol, or area, from CODEOWNERS and substantive git history, with the strength of the signal stated.
argument-hint: [file, area, or thing]
disable-model-invocation: true
allowed-tools: Bash(git log *) Bash(git blame *) Bash(git shortlog *) Grep Glob Read
disallowed-tools: Edit Write NotebookEdit
---

Identify who to ask about $ARGUMENTS.

## Sources, in order of authority

1. `CODEOWNERS`. An explicit declaration outranks every heuristic. Quote the matching rule.
2. Substantive commit history. Who has repeatedly changed this code's behavior.
3. Review history, docs, and decision records. Past reviewers, named maintainers, ADR authors.

## Rules

- Blame line counts are a weak ownership signal. A reformat, a rename, a lint pass, or a bulk migration rewrites blame for lines someone else wrote. Weight commits that changed behavior over commits that touched many lines.
- Recency is part of the answer. The top historical contributor may have moved on. Report when each candidate last touched the area.
- State how strong the signal is, and derive it from the source rather than from a feeling: `strong` is an explicit ownership rule, `moderate` is repeated substantive commits from one person, `weak` is thin history or bulk-only touches. Report weak as weak instead of dressing it up as ownership.
- Report ownership *signal*, never a verdict about a person. Nothing about anyone's skill, seniority, availability, or the quality of their code.
- Refer to people by the name or handle the repository records, and use they/them. A name does not tell you someone's pronouns, and a guess misgenders a real person in a way the neutral form never does.
- Prefer names and handles over email addresses. Include an address only when asked for it.

## Output

- **Ask.** The one or two best candidates, each with the evidence behind them and the date they last touched the area.
- **Basis.** Which source produced the answer and the resulting signal strength.
- **Also touched it.** Other contributors worth knowing about, one line each. Omit when the history is short.

When nothing yields a usable signal, such as a new file, a single squashed import commit, or no `CODEOWNERS`, say the repository does not record an owner. Then name the nearest team, directory convention, or adjacent area that does, rather than inventing a person.
