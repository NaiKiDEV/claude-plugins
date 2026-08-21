---
name: file-tree
description: Render a directory listing or file structure as a Unicode tree, using the same box-drawing connectors as the standard tree command, for showing project layout without a live tree command.
argument-hint: [content to visualize, or nothing to use the last output]
disable-model-invocation: true
allowed-tools: Bash(node *) Read Grep Glob
disallowed-tools: Edit Write NotebookEdit
---

Render $ARGUMENTS as a file tree using standard Unicode box-drawing connectors.

## Resolve what was asked

- No argument: the target is the last substantive assistant message in the conversation, not this invocation. Pull whatever file or directory structure fits out of it.
- The argument is the content itself, such as pasted output, a typed description, or a directory listing. Use it directly.
- The argument names something else, such as an actual directory in the project or "the module structure". Locate it first with Read, Grep, or Glob, then extract the structure. When the argument names a real path in the project, walking the actual directory rather than guessing at its contents is strongly preferred.
- Never invent entries to fill the shape. If the source does not map cleanly onto a file tree, say what was inferred, or say the fit is poor and point at a better-suited visualize skill instead of forcing it.

## Schema

`scripts/render.js` reads this JSON on stdin:

```json
{
  "root": "project/",
  "entries": [
    {"name": "src/", "children": [{"name": "index.js", "children": []}, {"name": "utils.js", "children": []}]},
    {"name": "README.md", "children": []}
  ]
}
```

- `root` (string, required): printed as the first line verbatim.
- `entries` (array, optional, defaults to empty): each entry has `name` (string, required) and `children` (array, optional, defaults to empty, same shape recursively).
- No semantic distinction between files and directories beyond the trailing `/` already present in `name`. Do not invent icons or markers.
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
