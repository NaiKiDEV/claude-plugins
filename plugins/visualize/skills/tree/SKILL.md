---
name: tree
description: Render any single-rooted hierarchy, such as an org chart, taxonomy, or decision tree, using the same Unicode box-drawing connectors as the standard tree command.
argument-hint: [content to visualize, or nothing to use the last output]
disable-model-invocation: true
allowed-tools: Bash(node *) Read Grep Glob
disallowed-tools: Edit Write NotebookEdit
---

Render $ARGUMENTS as a tree using standard Unicode box-drawing connectors.

## Resolve what was asked

- No argument: the target is the last substantive assistant message in the conversation, not this invocation. Pull whatever single-rooted hierarchy fits out of it: an org chart, a taxonomy, a decision tree, a category breakdown.
- The argument is the content itself, such as a pasted outline, a typed description, or a list with implied nesting. Use it directly.
- The argument names something else, such as "the module structure" or "the team org chart". Locate it first with Read, Grep, or Glob, then extract the hierarchy.
- Never invent nodes to fill the shape. If the source does not map cleanly onto a single-rooted hierarchy, say what was inferred, or say the fit is poor and point at a better-suited visualize skill instead of forcing it. A real directory on disk is served better by `/visualize:file-tree`, which walks the filesystem directly.

## Schema

`scripts/render.js` reads this JSON on stdin:

```json
{
  "root": {"label": "CEO", "children": [{"label": "VP Eng", "children": []}, {"label": "VP Sales", "children": []}]}
}
```

- `root` (object, required): a single node with `label` (string, required) and `children` (array, optional, defaults to empty).
- Each entry in `children` has the same shape as `root`, recursed to any depth.
- Applies generically: org charts, taxonomies, decision trees, category breakdowns, any hierarchy with one root.
- The script renders connectors with Unicode box-drawing glyphs, matching the default output of the standard `tree` command: `├── ` for a non-last child, `└── ` for the last child, `│   ` as the continuation column under a non-last child, and four spaces under a last child.

## Render

Build the JSON from what was resolved above, then pipe it through the script, resolved relative to this skill's own base directory:

```
node scripts/render.js <<'JSON'
{ ... }
JSON
```

Relay stdout verbatim. Do not retype it or adjust its spacing. On a non-zero exit, stderr names the problem: fix the JSON once and retry. If it still fails, say so rather than hand-drawing a fallback.

## Output

- The rendered tree, exactly as returned by the script.
- One line naming the source used (the last message, the pasted content, or the path walked) and anything inferred to make it fit.
