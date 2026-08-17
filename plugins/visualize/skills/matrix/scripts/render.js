#!/usr/bin/env node
'use strict';

// Renders a {rowLabels, colLabels, cells} JSON payload as a bordered
// comparison matrix using single-line Unicode box-drawing characters.
// Reuses the table skill's border-building shape (corner, separator, row),
// with an extra top-left corner cell and rowLabels as a leading column.

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

function cellText(value) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function isStringArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === 'string');
}

// Validates the payload shape. Returns an error string on the first problem
// found, or null when the payload is valid.
function validate(data) {
  if (!isPlainObject(data)) {
    return 'root JSON value must be an object';
  }
  if (!isStringArray(data.rowLabels)) {
    return '"rowLabels" must be a non-empty array of strings';
  }
  if (!isStringArray(data.colLabels)) {
    return '"colLabels" must be a non-empty array of strings';
  }
  if (!Array.isArray(data.cells)) {
    return '"cells" must be an array';
  }
  if (data.cells.length !== data.rowLabels.length) {
    return `cells has ${data.cells.length} rows, expected ${data.rowLabels.length} (rowLabels.length)`;
  }
  for (let i = 0; i < data.cells.length; i++) {
    if (!Array.isArray(data.cells[i])) {
      return `cells[${i}] must be an array`;
    }
    if (data.cells[i].length !== data.colLabels.length) {
      return `cells[${i}] has ${data.cells[i].length} cells, expected ${data.colLabels.length} (colLabels.length)`;
    }
  }
  return null;
}

function pad(text, width) {
  const diff = width - text.length;
  return diff > 0 ? text + ' '.repeat(diff) : text;
}

// Builds a horizontal divider using the given corner/tee glyphs for the
// left edge, the joints between columns, and the right edge.
function buildDivider(widths, left, joint, right) {
  return left + widths.map((w) => '─'.repeat(w + 2)).join(joint) + right;
}

function buildRow(cells, widths) {
  return '│' + cells.map((c, i) => ' ' + pad(cellText(c), widths[i]) + ' ').join('│') + '│';
}

async function main() {
  const raw = await readStdin();

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    fail('invalid JSON input: ' + e.message);
    return;
  }

  const err = validate(data);
  if (err) {
    fail(err);
    return;
  }

  const header = ['', ...data.colLabels];
  const rows = data.rowLabels.map((label, i) => [label, ...data.cells[i]]);

  const widths = header.map((h, i) => {
    let w = cellText(h).length;
    for (const row of rows) w = Math.max(w, cellText(row[i]).length);
    return w;
  });

  const topDivider = buildDivider(widths, '┌', '┬', '┐');
  const headerDivider = buildDivider(widths, '├', '┼', '┤');
  const bottomDivider = buildDivider(widths, '└', '┴', '┘');

  const lines = [topDivider, buildRow(header, widths), headerDivider];
  for (const row of rows) lines.push(buildRow(row, widths));
  lines.push(bottomDivider);

  process.stdout.write(lines.join('\n') + '\n');
}

main();
