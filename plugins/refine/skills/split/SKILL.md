---
name: split
description: Cut an item that is too big into pieces that are each independently deliverable. Lawrence's splitting patterns and Cohn's SPIDR, applied to find a vertical seam, never a horizontal one.
argument-hint: [the item to split, or nothing to use what is on the table]
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit
---

Split this: $ARGUMENTS

Richard Lawrence published a catalogue of splitting patterns and an accompanying flowchart in 2009, after observing that teams asked to split work reached for the same unhelpful cut every time. Mike Cohn later compressed the useful ones into SPIDR: spike, path, interface, data, rule. Both exist because splitting is a skill with known-good moves, and without them people improvise.

The improvised cut is almost always horizontal. The database piece, the API piece, the interface piece. It feels like a decomposition because the parts are genuinely different work, and it fails for one reason: no piece delivers anything alone, so no piece can be verified alone, and the whole set has to land before anybody learns whether the idea worked. The work was divided. The risk was not.

The rule this skill enforces: **every slice is a vertical slice**. It goes through however many layers it needs to, and when it is done, something is observably different.

## Resolve what is being split

- **An argument.** Split that.
- **Nothing.** Take the item on the table and restate it in one line before starting.
- **A whole project.** Stop, and say so. This splits one item along one seam. A project decomposes structurally first, which is `/wbs`.
- **Nothing on the table.** Say so and stop.

## Check before you split

**Check that it needs splitting at all.** This is the most important gate in the skill, because a split has a real cost: a seam to reconcile, and a piece that has to be integrated with a piece that came later.

Do not split when:

- One owner finishes it in one pass. Three slices of one file is slower than the file, and it produces a merge nobody asked for.
- The parts share so much state that each slice would have to be rewritten by the next one.
- The only available seams are horizontal. That is a signal the item is already the smallest vertical unit, and the answer is to accept its size, not to cut it badly.

Then read before cutting. The seams that actually exist are in the code, not in the description: an existing feature flag, a branch already in the request handler, a config key that already varies behaviour, a table column that is already nullable. A split that follows a seam the code already has costs a fraction of one that introduces a seam.

## 1. Find the seam

Work the patterns in this order. The order is by yield: the first ones produce independently valuable slices most often.

- **Workflow steps.** The item covers a sequence, and the sequence has stages. Ship the stages. The first slice is usually a crude end-to-end path, and the later slices replace the crude parts. Do not ship the middle step first.
- **Business rule variations.** The item states a rule with cases. One slice per case, or one slice for the common case and one for the rest. This is the highest-yield pattern in practice, because most items that feel large are one behaviour with several conditions attached.
- **Happy path first.** Slice one is the path where nothing goes wrong. Later slices are the specific failures. Each failure slice is independently valuable because handling it is observably different from not handling it. This is the pattern people most often reach for and most often apply wrongly, by treating "error handling" as one slice. It is not one slice, it is several, and they are not equally worth doing.
- **Data variations.** The item handles several kinds of input, several formats, several locales, several currencies, several sources. Take one kind.
- **Interface variations.** The same capability, reached several ways: the CLI, the API, the UI, the batch job. Take one, and take the one that lets somebody use it soonest.
- **Operations.** A CRUD-shaped item is up to four items. Read is usually shippable long before write, and delete is usually the one nobody specified.
- **Effort asymmetry.** Part of the item is nearly free and part is expensive. Cut there, ship the free part, and let the expensive part be argued about with the cheap part already in production.
- **Simple against complex.** Build the simplest version that does something real, then treat every complication as its own slice. Where the complications turn out to be the item, this pattern surfaces that early rather than at the end.
- **Defer the qualities.** Make it correct first. Performance, scale, concurrency, and hardening are later slices with their own thresholds. Only use this where shipping the slow version is genuinely acceptable, and say so if it is not.
- **Break out a spike.** The item is unsplittable because it is not understood. The first slice is the investigation, timeboxed, whose deliverable is an answer and whose output is a better split. This is the last resort and the most abused: a spike that produces no decision is a slice that delivered nothing.

Where two patterns both apply, prefer the one whose first slice is most useful on its own.

## 2. Cut vertically

Every slice, tested against three questions. A slice failing any of them is not a slice.

- **Could this ship alone?** Not would you ship it, but could you, without any other slice from this set. If it needs a sibling to be observable, the cut was horizontal.
- **Is something different afterwards?** Someone can do something they could not, or the system behaves differently in a case you can name. "The schema now has a column" is not a difference. "An account with no verified email can now be exported" is.
- **Can it be verified on its own terms?** There is a check that passes for this slice and would have failed before it. Where the only available check requires a later slice, the slice is not independent whatever the description says.

Slices that fail these are the recognisable anti-patterns, and each has a repair:

| Bad slice | Why it fails | Repair |
| --- | --- | --- |
| "Add the database table" | Nothing observable | Fold into the first slice that uses it |
| "Build the API endpoint" | Not reachable by anyone | Slice by what the endpoint does, through to a caller |
| "Write the tests" | Not a slice, a part of every slice | Delete it; tests belong inside their slice |
| "Refactor first" | Not independently valuable | Either it enables slice one, and belongs in it, or it is separate work |
| "Error handling" | Several unrelated behaviours in a bag | One slice per failure worth handling, ranked |
| "Frontend" and "backend" | The horizontal cut | Re-cut on a rule, a case, or a workflow step |

## 3. Test the set

Slices are checked individually above. The set has its own properties.

- **Do the slices sum to the original?** Anything the item covered that no slice covers is a gap, and it is the thing that gets discovered in the last week. Name it rather than assuming it will be absorbed.
- **Does anything appear twice?** Overlapping slices mean two owners in the same file, which for parallel work is a hard constraint rather than an inconvenience.
- **Is the count sane?** Two to five is usual. One means it did not split. More than about six means the seam was too fine, and the reconciliation will cost more than the item.
- **Would you stop after slice one?** Ask directly. If the answer is yes, that is the finding, and the rest of the set is work that was about to be done for no reason.

## 4. Rank

Order the slices, and say why the first one is first. Only one of these reasons is usually right at a time:

- **It resolves the most uncertainty.** Correct when the item is risky, and the usual right answer.
- **It delivers the most on its own.** Correct when the item is understood and the value is front-loaded.
- **It unblocks the most other work.** Correct when other people are waiting.

Do not rank by ease. The easy slice first is how a set of slices becomes a horizontal split in slow motion, with the hard vertical part left as a single lump at the end.

Say explicitly which slices could be dropped entirely if the first one goes well. That list is the actual output of splitting, and it is what the exercise is worth.

## Output

- **The item**, restated in one line, with its size problem named.
- **The pattern used**, by name, and one line on why that seam and not another.
- **The slices**, in ranked order. For each: what it delivers, what is observably different afterwards, and its check.
- **The first slice**, with the reason it is first.
- **What could be dropped** if the first slice succeeds.
- **Gaps and overlaps**, where the set did not sum or the slices collided.

## Punctuation

Write the hyphen `-` only. Do not write the em dash or the en dash. Where an em dash would join two clauses, use a full stop, a comma, a colon, or parentheses.

## Composes with

- **`/invest`.** Sequential in both directions, and this is the repair for one letter. An item failing **S** comes here. Every slice produced here goes back through the rubric, because a slice that is small and untestable has traded one failure for another.
- **`/wbs`.** Sequential. That decomposes structurally, by deliverable. This cuts one node that came out too big. Using this on a whole project produces slices of something that was never bounded.
- **`/examples`.** Reinforcing, and it often finds the seam for you. The rules that come out of an example mapping session are usually the business rule variations this splits on, and a story with more than about six rules is telling you to split before mapping further.
- **`/boundary`.** Reinforcing, if the `verify` plugin is installed. Where the seam is data variations, the equivalence classes are the slices, already derived.
- **`/fermi`.** Complementary, if the `decide` plugin is installed. Where the argument is about whether the item is too big at all, an estimate with a stated range settles it faster than the split does.
- **`/hub`.** Sequential, if the `hub` plugin is installed. Vertical slices with disjoint file sets are what can be dispatched concurrently. Horizontal ones cannot, which is the same failure showing up one stage later and more expensively.

## Before you send

- Was it established that the item actually needs splitting?
- Was the code read for seams that already exist, before a seam was invented?
- Is the pattern named, rather than the split being improvised?
- Could every slice ship alone, with nothing else from this set?
- Is something observably different after each slice, stated in terms someone outside the code would recognise?
- Does every slice carry a check that passes for it and would have failed before it?
- Is any slice a layer, a task, a refactor, or a bag labelled error handling?
- Do the slices sum to the original, and was any gap named?
- Do any two slices write the same files?
- Is the count between two and about six?
- Is the reason the first slice is first stated, and is that reason something other than it being easiest?
- Is it said which slices could be dropped if the first one goes well?
