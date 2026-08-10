---
name: ubiquitous
description: Speak the domain's ubiquitous language, the terms the business actually uses, scoped to one bounded context, with drift between the code and the business reported rather than smoothed over.
argument-hint: [domain or bounded context, or a target to rewrite or audit]
disable-model-invocation: true
allowed-tools: Read Grep Glob
---

Speak the ubiquitous language of: $ARGUMENTS

A ubiquitous language is the single vocabulary shared by the domain experts and the people building the software: the same words in conversation, in documentation, and in the code, with no translation layer between them. It belongs to one bounded context, never to a whole project. Where the language and the code have drifted apart, the drift is the defect.

## Resolve what was asked

- **No argument.** Establish the domain, then write every message from now on in its language, until the user tells you to stop.
- **"off", "stop", or "normal".** Leave the mode. Confirm in one line.
- **A domain or a context**, such as `freight forwarding` or `the billing context`. Take it as stated, confirm the scope, then speak it.
- **A target**, such as `rewrite this PR description`. Rewrite that target in the domain language and leave the session alone.
- **`audit <area>`.** Report drift instead of rewriting anything.

## Establish the domain before using a single term

Work in this order. Never skip straight to asking.

1. **Read the argument.** A named domain is the strongest start available.
2. **Look at the project.** Committed glossaries, architecture decision records, domain documentation, README prose, product copy, migration names, event names, and the nouns in the core model. This costs the user nothing, so always do it.
3. **Ask about what is left.** Only the gaps and the conflicts.

If the codebase is closed, absent, or yields nothing usable, there is nothing to infer and every term has to come from the user. Say so plainly and ask.

Never proceed on an invented domain. A web framework, an ORM, and a queue say nothing about the business. If the domain cannot be established, stop and ask rather than producing a confident glossary for a guessed business.

## Where each term comes from

Tag every term in a glossary or an audit with how it is known:

- `[stated]`. The user said it. This is authority: the term a domain expert uses is the term, by definition.
- `[docs/domain.md:12]` or `[src/billing/invoice.ts:30]`. The project records it. This is evidence.
- `[inferred]`. Read from naming, with nothing to confirm it. This is a guess.

Ranking rules:

- `[stated]` outranks anything in the repository on what a term should be.
- A committed glossary, an architecture decision record, or a domain document outranks naming in code. The team wrote those deliberately. A class name may be an accident from years ago.
- When authority and evidence disagree, report the disagreement. Do not quietly pick a winner. A codebase that says `ShipmentRecord` while the business says "consignment" carries more information than either term alone.
- Never present `[inferred]` as evidence. A guessed term and a recorded term are not the same claim.

## What is not domain language

These name how the software is built, not what the business does. Keep them out of a glossary:

- **CRUD and lifecycle verbs.** create, update, delete, get, set, save, load, fetch, handle, process, manage, validate.
- **Layer and pattern suffixes.** Service, Manager, Controller, Repository, Handler, Helper, Util, Factory, Provider, Impl, Base, Abstract, DTO.
- **Framework and infrastructure nouns.** Request, Response, Session, Cache, Queue, Job, Worker, Migration, Middleware, Hook, Store, Client.
- **Generic containers.** Data, Info, Item, Record, Object, Detail, Config, Params, Payload, Result, State, Status, Type, Kind, Flag.
- **Persistence artifacts.** Table, column, and foreign key names, unless the business says them out loud.

A glossary built from these words is architecture vocabulary wearing a domain costume.

The lists are not a blacklist. `Claim` is filler in one codebase and the central noun of insurance in another. `Order` is generic and also the core of commerce. `Settlement`, `Reconciliation`, and `Dispute` all look like process nouns, and all name real things a bank employee says. The test is never the word itself. The test is whether a domain expert would use it, unprompted, to describe their own work. When that is unclear, ask. One question costs far less than a wrong glossary.

## Bounded context

- Establish which bounded context is in play before using any term, and say which one it is.
- The same word legitimately means different things in different contexts. `Customer` in Billing is a payment method and a dunning state. `Customer` in Support is a contact and a ticket history. Neither is wrong, and neither is the real one.
- Do not merge two meanings into one definition, and do not resolve the conflict. Record both, each against its context.
- Treat a term that has crossed a boundary as suspect. A Billing concept named inside Support code is usually a missing translation layer or a leaked model. Report it. Do not adopt it.
- If the context of something cannot be determined, say so instead of assigning one.

## How to speak it

- Use the domain's term every time, exactly as the domain says it. Match its inflection and its capitalization in prose.
- One term for each concept, one concept for each term. Never reach for a synonym to avoid repetition. A second word reads as a second thing.
- Do not translate a domain term into a general one to be helpful. A consignment does not become a shipment, a package, or a delivery.
- Do not invent a term that the domain does not have. Where there is no word for something, say there is no word for it and describe it. An invented term puts a word into circulation that no expert will recognize.
- Keep technical talk technical. A database index, a retry, and a deploy are not domain concepts, and dressing them in business language is worse than plain speech. Where the register is ambiguous, say which one is in use.

## Auditing drift

An audit reports. It does not rewrite. Look for:

- A term the code uses that the business does not.
- A concept the business names that the code has no word for. This is usually the more interesting half, because a missing word is often a missing model.
- One concept carrying several names across the codebase.
- One name covering several concepts.
- A term that has crossed a bounded context.

Anchor every finding to `file:line`. Never report drift in code that was not read. Do not rename anything: a rename is a refactor with real blast radius, and an audit did not ask for one.

## Asking well

- Ask once, batched. Do not spread questions across turns.
- Ask about the specific terms found, not about the domain in the abstract. "The code says `ShipmentRecord`. Does the business call that a consignment, a shipment, or something else?" is answerable. "What is your domain?" makes the user do the work.
- Ask at most three or four questions. Take what comes back.
- If the user will not or cannot answer, continue on the evidence and name the terms that stayed unconfirmed.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/bluf`.** No conflict. This supplies the vocabulary. BLUF supplies the order.
- **`/ste`.** No conflict, and the two reinforce each other. Both give one word to each concept. Domain terms count as technical names under STE, so they survive its vocabulary limit intact and must not be swapped for a simpler word.

## Output

- **Mode.** One short confirmation naming the domain and the bounded context, plus any term that could not be confirmed. Then speak it, with no further commentary.
- **Glossary.** One line for each term: the term, its definition, its tag. Only terms that earned a place. A short glossary of real terms beats a long one padded with `Manager` and `Payload`.
- **Audit.** Findings anchored to `file:line`, most significant first.
- Do not tag terms in ordinary running prose. Tags belong in a glossary and an audit.
- The language lives in this session. Do not create or update a glossary file unless the user asks for one in that turn.
