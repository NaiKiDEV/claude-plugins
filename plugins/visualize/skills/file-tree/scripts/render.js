#!/usr/bin/env node
'use strict';

// Renders a {root, entries} JSON payload as a file tree, using the same
// Unicode box-drawing glyphs the standard `tree` command uses by default.
// Connector rules:
//   - non-last child at a depth: "├── <name>" (vertical-and-right)
//   - last child at a depth:     "└── <name>" (up-and-right)
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

// Validates one entry and fills in a default "children" array. Returns an
// error string on the first problem found, or null when the entry is valid.
function validateEntry(entry, path) {
  if (!isPlainObject(entry)) {
    return `entry at ${path} must be an object`;
  }
  if (typeof entry.name !== 'string' || entry.name.length === 0) {
    return `entry at ${path} is missing a non-empty string "name"`;
  }
  if (entry.children === undefined) {
    entry.children = [];
  }
  if (!Array.isArray(entry.children)) {
    return `entry at ${path}.children must be an array`;
  }
  for (let i = 0; i < entry.children.length; i++) {
    const err = validateEntry(entry.children[i], `${path}.children[${i}]`);
    if (err) return err;
  }
  return null;
}

function renderChildren(entries, prefix, lines) {
  entries.forEach((entry, i) => {
    const isLast = i === entries.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    lines.push(prefix + connector + entry.name);
    const childPrefix = prefix + (isLast ? '    ' : '│   ');
    renderChildren(entry.children, childPrefix, lines);
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
  if (typeof data.root !== 'string' || data.root.length === 0) {
    fail('"root" must be a non-empty string');
    return;
  }
  if (data.entries === undefined) {
    data.entries = [];
  }
  if (!Array.isArray(data.entries)) {
    fail('"entries" must be an array');
    return;
  }
  for (let i = 0; i < data.entries.length; i++) {
    const err = validateEntry(data.entries[i], `entries[${i}]`);
    if (err) {
      fail(err);
      return;
    }
  }

  const lines = [data.root];
  renderChildren(data.entries, '', lines);
  process.stdout.write(lines.join('\n') + '\n');
}

main();
