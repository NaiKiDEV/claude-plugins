'use strict';

// Renders a nested bullet list from JSON on stdin. Zero dependencies.
// Schema: { title?: string, items: Item[], marker?: '-' | '*' | '+' }
// Item: { text: string, children?: Item[] }

const MARKER_CYCLE = ['-', '*', '+'];

function fail(message) {
  process.stderr.write(message + '\n');
  process.exit(1);
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

function validateItem(item, path) {
  if (item === null || typeof item !== 'object' || Array.isArray(item)) {
    fail(`Invalid item at ${path}: expected an object`);
  }
  if (typeof item.text !== 'string') {
    fail(`Invalid item at ${path}: "text" must be a string`);
  }
  if (item.children === undefined) {
    item.children = [];
  }
  if (!Array.isArray(item.children)) {
    fail(`Invalid item at ${path}: "children" must be an array`);
  }
  item.children.forEach((child, i) => validateItem(child, `${path}.children[${i}]`));
}

function renderItems(items, depth, startIndex, lines) {
  for (const item of items) {
    const marker = MARKER_CYCLE[(startIndex + depth) % MARKER_CYCLE.length];
    const indent = '  '.repeat(depth);
    lines.push(`${indent}${marker} ${item.text}`);
    if (item.children.length > 0) {
      renderItems(item.children, depth + 1, startIndex, lines);
    }
  }
}

async function main() {
  const raw = await readStdin();
  if (raw.trim().length === 0) {
    fail('No input on stdin: expected a JSON object');
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    fail('Invalid JSON on stdin: ' + err.message);
  }

  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    fail('Invalid input: root must be a JSON object');
  }
  if (!Array.isArray(data.items)) {
    fail('Invalid input: "items" must be an array');
  }
  if (data.title !== undefined && typeof data.title !== 'string') {
    fail('Invalid input: "title" must be a string');
  }

  let startIndex = 0;
  if (data.marker !== undefined) {
    const idx = MARKER_CYCLE.indexOf(data.marker);
    if (idx === -1) {
      fail('Invalid input: "marker" must be one of - * +');
    }
    startIndex = idx;
  }

  data.items.forEach((item, i) => validateItem(item, `items[${i}]`));

  const lines = [];
  if (data.title) {
    lines.push(data.title);
    lines.push('='.repeat(data.title.length));
  }
  renderItems(data.items, 0, startIndex, lines);

  process.stdout.write(lines.join('\n') + '\n');
}

main();
