'use strict';

// Renders a nested checklist from JSON on stdin. Zero dependencies.
// Schema: { title?: string, items: Item[], showProgress?: boolean }
// Item: { text: string, state: 'done' | 'pending' | 'blocked' | 'in-progress', children?: Item[] }

const STATE_MARKS = {
  done: '[x]',
  pending: '[ ]',
  blocked: '[!]',
  'in-progress': '[~]',
};

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
  if (!Object.prototype.hasOwnProperty.call(STATE_MARKS, item.state)) {
    fail(`Invalid item at ${path}: "state" must be one of done, pending, blocked, in-progress`);
  }
  if (item.children === undefined) {
    item.children = [];
  }
  if (!Array.isArray(item.children)) {
    fail(`Invalid item at ${path}: "children" must be an array`);
  }
  item.children.forEach((child, i) => validateItem(child, `${path}.children[${i}]`));
}

function renderItems(items, depth, lines) {
  for (const item of items) {
    const indent = '  '.repeat(depth);
    const mark = STATE_MARKS[item.state];
    lines.push(`${indent}${mark} ${item.text}`);
    if (item.children.length > 0) {
      renderItems(item.children, depth + 1, lines);
    }
  }
}

function countLeaves(items, counts) {
  for (const item of items) {
    if (item.children.length === 0) {
      counts.total += 1;
      if (item.state === 'done') {
        counts.done += 1;
      }
    } else {
      countLeaves(item.children, counts);
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
  if (data.showProgress !== undefined && typeof data.showProgress !== 'boolean') {
    fail('Invalid input: "showProgress" must be a boolean');
  }

  data.items.forEach((item, i) => validateItem(item, `items[${i}]`));

  const lines = [];
  if (data.title) {
    lines.push(data.title);
    lines.push('='.repeat(data.title.length));
  }
  renderItems(data.items, 0, lines);

  if (data.showProgress) {
    const counts = { done: 0, total: 0 };
    countLeaves(data.items, counts);
    const percent = counts.total === 0 ? 0 : Math.round((counts.done / counts.total) * 100);
    lines.push('');
    lines.push(`${counts.done}/${counts.total} done (${percent}%)`);
  }

  process.stdout.write(lines.join('\n') + '\n');
}

main();
