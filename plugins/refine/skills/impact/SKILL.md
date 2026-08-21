---
name: impact
description: Connect what is being built to the reason anyone wanted it. Adzic's impact mapping - goal, actors, behaviour changes, then deliverables treated as hypotheses about producing those changes rather than as commitments.
argument-hint: [the goal, feature, or backlog to map, or nothing to use what is on the table]
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit
---

Map this to its impacts: $ARGUMENTS

Gojko Adzic published impact mapping in 2012 as a four-level structure: the goal, the actors who can affect it, the changes in their behaviour that would move it, and the deliverables that might produce those changes. The levels answer why, who, how, and what, in that order, and the order is load bearing because each level is only meaningful as an answer to the one above it.

The failure it addresses is the backlog nobody can cut. Every item on it looks equally necessary, because none of them carries a stated purpose, so the only available argument for dropping one is that somebody likes it less. Work gets prioritised by who asked, and a feature that would not have moved anything ships because it was already on the list.

The reframe that does the work: a deliverable is a **hypothesis** about producing a behaviour change, not a promise to build something. That makes it falsifiable, which makes it cuttable, which is the entire point.

## Resolve what is being mapped

- **An argument naming a goal.** Map from there.
- **An argument naming a feature or a backlog.** Work upward first. Ask what it is for, get to the goal, then come back down. A map built from the deliverables up is the backlog with a diagram on it.
- **Nothing.** Take the objective on the table and state it in one line for confirmation before starting.
- **Nothing on the table.** Say so and stop.

## Check before you map

This is for work whose purpose is genuinely contested or unstated. Where the goal is obvious and the deliverable is one thing, mapping it is ceremony.

Look for what is already written down. A product brief, an issue description, a ticket's parent epic, a `README` stating what the project is for, a commit message explaining why an earlier version shipped. Read those before generating anything, and quote them rather than paraphrasing.

Where you find that the goal is already stated and measurable and the deliverable already traces to it, say so in a sentence and stop.

## 1. Fix the goal

One goal. Measurable, with a number and a date, and phrased so that something other than the planned work could achieve it.

The test: could this goal be met without building the thing? If not, it is a deliverable wearing a goal's clothes, and the real goal is one level above it.

- "Ship the new onboarding flow" is a deliverable.
- "Cut the share of new accounts that never complete setup from 40% to under 20% by the end of Q3" is a goal.

Requirements for the goal line:

- **A metric that exists or can be observed.** Where nothing measures it today, say that explicitly, because it means nobody will be able to tell whether the work succeeded. Naming the missing measurement is often the most valuable output of the whole map.
- **A number and a direction.** Not "improve", not "reduce", not "better".
- **A date or a horizon.** A goal with no horizon cannot fail, which means it cannot be tested.
- **No solution in it.** The moment the goal names a technology or a screen, it has stopped being a goal.

Where the stated objective decomposes into several unrelated goals, say so and map one. A map with two goals is two maps sharing a page, and the deliverables under it will be argued for against whichever goal suits them.

## 2. Name the actors

Who can affect the goal. Specific enough to picture one, and specific enough that you could name a real person or a real system.

- "Users" is not an actor. "A developer evaluating the tool for the first time" is.
- Include the actors who are not the target: the person who has to approve it, the team who maintains the thing it depends on, the support engineer who takes the calls.
- **Include the actors who can obstruct.** This is the level most often truncated to the happy path, and the obstructing actor is usually the one who decides whether the goal is actually met.
- Include the non-human actors where they behave: the scheduler, the upstream API, the client that has not been updated.

Between three and seven. Below three, the map is almost certainly missing whoever would push back. Above seven, the actors are categories rather than actors and need collapsing.

## 3. State the impacts

What each actor does differently. This is the level the whole method exists to insert, and the one that gets skipped.

An impact is a **change in behaviour**, stated from the actor's side, in the actor's terms. It is not a feature, not a benefit, and not a capability.

- "Add SSO" is a deliverable.
- "The evaluating developer gets to a working call without contacting anyone" is an impact.
- "The security reviewer stops blocking the trial on the auth question" is an impact, and it is the kind that only appears once obstructing actors are on the map.

Rules:

- **Include impacts you want to prevent.** An actor doing more of something can be as damaging as doing less. The support engineer receiving more tickets is an impact of most shipping.
- **An impact must be observable in the actor**, not in the system. If you can only tell it happened by reading a log the actor never touches, it is a system behaviour, and it belongs one level down.
- **Impacts can compete.** Two actors wanting opposite behaviour is a real finding and belongs on the map rather than being smoothed. Note which one the goal favours.
- Do not force an impact under every actor. An actor with no impact is a signal that they do not affect this goal, which is worth knowing and worth saying.

## 4. Propose deliverables as hypotheses

Under each impact, what could produce it. Several, not one.

Write each as a hypothesis and keep the hypothesis grammar, because the grammar is what preserves the ability to cut it:

> We believe **&lt;deliverable&gt;** will cause **&lt;actor&gt;** to **&lt;impact&gt;**. We will know we are right when **&lt;observation&gt;**.

- **Generate at least two per impact you intend to pursue.** One deliverable under an impact means the deliverable was decided first and the impact was written to justify it.
- **Include the cheap ones and the non-software ones.** Change the default. Delete the step. Write the documentation. Send an email. These lose to features by default because they feel like less work, which is exactly backwards.
- **Smallest first.** The question is not what would fully solve it, but what is the smallest thing that would tell you whether the impact moves at all.
- **The observation clause is mandatory.** A deliverable whose success cannot be observed is not a hypothesis, it is a plan, and it will be completed rather than evaluated.

## 5. Cut

The map is only worth building if things come off it.

- **A deliverable with no impact above it is cut.** Say what it was. This is the most common finding and the one people most want to soften. If it survives, it survives as a stated exception with a named reason, not by being quietly left on.
- **An impact that would not move the goal is cut**, with its deliverables.
- **An actor with no impacts is dropped from the map** and noted, since it may mean the actor was miscast rather than irrelevant.
- **Rank what is left by impact per cost**, not by cost alone and not by sequence. Name the one deliverable you would build first and the impact it is testing.
- **Name the deliverable most likely to be wrong.** Where a hypothesis is both expensive and weakly connected to its impact, that is the one to shrink or to test cheaply before committing.

Do not rank by confidence in delivery. That reliably promotes the well-understood work over the work that matters.

## Output

- **The goal**, one line, with its metric, number, and horizon, and an explicit note where nothing currently measures it.
- **The map**, four levels, goal to actors to impacts to deliverables. Use `/tree` if the `visualize` plugin is installed, since the structure is a single-rooted hierarchy and reads far better drawn.
- **The hypotheses** for the deliverables that survived, each with its observation clause.
- **What was cut**, and why, listed rather than omitted.
- **The first deliverable**, in one line, with the impact it tests.
- **The weakest link**, being the deliverable whose connection to its impact you would least want to bet on.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/wbs`.** Sequential, and this comes first. This decides which deliverables are worth having. That decomposes a deliverable into the work that produces it. Running the breakdown first produces a complete decomposition of something nobody needed.
- **`/options`.** Reinforcing, if the `decide` plugin is installed. The deliverables under one impact are an option set, and widening them there is the same operation with a better generator.
- **`/tradeoff`.** Sequential, if the `decide` plugin is installed. Where two deliverables under one impact are both plausible and expensive, the impact is the criterion the matrix was missing.
- **`/fermi`.** Reinforcing, if the `decide` plugin is installed. The goal needs a number, and where none is measured today, an order-of-magnitude estimate with a stated range beats leaving the metric blank.
- **`/premortem`.** Complementary, if the `decide` plugin is installed. That assumes the deliverable shipped and failed. This asks whether shipping it would have mattered, which is the second failure branch that premortem names and this one generates properly.
- **`/quit`.** Reinforcing, if the `decide` plugin is installed. An impact that has not moved after the first deliverable is a kill criterion that was set in advance without anyone having to call it that.

## Before you send

- Is there exactly one goal, and could it be achieved without building the planned thing?
- Does the goal carry a metric, a number, and a horizon, and is it stated where nothing measures it today?
- Is any actor a category rather than someone you could picture?
- Are the obstructing actors on the map, not just the beneficiaries?
- Is every impact a behaviour change in the actor rather than a system capability?
- Are the impacts you want to prevent included?
- Does every pursued impact carry at least two deliverables?
- Does every deliverable carry an observation clause that could come back negative?
- Were the cheap and non-software deliverables generated, or did this become a feature list?
- Is every cut listed, including the ones that were uncomfortable?
- Is the first deliverable named, along with the impact it tests?
