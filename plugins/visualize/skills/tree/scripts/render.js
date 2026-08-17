#!/usr/bin/env node
'use strict';

// Renders a {root: {label, children}} JSON payload as a tree, using the same
// Unicode box-drawing glyphs the standard `tree` command uses by default.
// Connector rules:
//   - non-last child at a depth: "├── <label>" (vertical-and-right)
//   - last child at a depth:     "└── <label>" (up-and-right)
//   - descendants of a non-last child carry a "│   " column (vertical bar)
//   - descendants of a last child carry "    " (four spaces, no bar)

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

function fail(message) {
  process.stderr.write(message + '\n');
  process.exit(1);
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Validates one node and fills in a default "children" array. Returns an
// error string on the first problem found, or null when the node is valid.
function validateNode(node, path) {
  if (!isPlainObject(node)) {
    return `node at ${path} must be an object`;
  }
  if (typeof node.label !== 'string' || node.label.length === 0) {
    return `node at ${path} is missing a non-empty string "label"`;
  }
  if (node.children === undefined) {
    node.children = [];
  }
  if (!Array.isArray(node.children)) {
    return `node at ${path}.children must be an array`;
  }
  for (let i = 0; i < node.children.length; i++) {
    const err = validateNode(node.children[i], `${path}.children[${i}]`);
    if (err) return err;
  }
  return null;
}

function renderChildren(nodes, prefix, lines) {
  nodes.forEach((node, i) => {
    const isLast = i === nodes.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    lines.push(prefix + connector + node.label);
    const childPrefix = prefix + (isLast ? '    ' : '│   ');
    renderChildren(node.children, childPrefix, lines);
  });
}

async function main() {
  const raw = await readStdin();

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    fail('invalid JSON input: ' + e.message.replace(/\s+/g, ' '));
    return;
  }

  if (!isPlainObject(data)) {
    fail('root JSON value must be an object');
    return;
  }
  if (!isPlainObject(data.root)) {
    fail('"root" must be an object');
    return;
  }

  const err = validateNode(data.root, 'root');
  if (err) {
    fail(err);
    return;
  }

  const lines = [data.root.label];
  renderChildren(data.root.children, '', lines);
  process.stdout.write(lines.join('\n') + '\n');
}

main();
