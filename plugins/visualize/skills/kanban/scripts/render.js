'use strict';

// Renders a side-by-side kanban board from JSON on stdin. Zero dependencies.
// Schema: { columns: { name: string, cards: string[] }[] }
// All columns render at the same width and the same height.
// Glyphs: U+250C U+2500 U+2510 U+2502 U+2514 U+2518 U+251C U+2524 (light
// box-drawing set), each a single UTF-16 code unit. Each column is its own
// self-contained box, drawn side by side with a space gap, so there is no
// shared-junction risk between columns; the tee glyphs (U+251C, U+2524) are
// only used for the header/body divider inside a single box, the same way
// table's internal row dividers work.

const EMPTY_LABEL = '(empty)';

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

async function main() {
  const raw = await readStdin();
  if (raw.trim().length === 0) {
    fail('No input on stdin: expected a JSON object');
    return;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    fail('Invalid JSON on stdin: ' + err.message);
    return;
  }

  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    fail('Invalid input: root must be a JSON object');
    return;
  }
  if (!Array.isArray(data.columns) || data.columns.length === 0) {
    fail('Invalid input: "columns" must be a non-empty array');
    return;
  }

  for (let i = 0; i < data.columns.length; i++) {
    const column = data.columns[i];
    if (column === null || typeof column !== 'object' || Array.isArray(column)) {
      fail(`Invalid input: columns[${i}] must be an object`);
      return;
    }
    if (typeof column.name !== 'string' || column.name.length === 0) {
      fail(`Invalid input: columns[${i}].name must be a non-empty string`);
      return;
    }
    if (!Array.isArray(column.cards)) {
      fail(`Invalid input: columns[${i}].cards must be an array`);
      return;
    }
    for (let j = 0; j < column.cards.length; j++) {
      if (typeof column.cards[j] !== 'string') {
        fail(`Invalid input: columns[${i}].cards[${j}] must be a string`);
        return;
      }
    }
  }

  let width = EMPTY_LABEL.length;
  for (const column of data.columns) {
    width = Math.max(width, column.name.length);
    for (const card of column.cards) {
      width = Math.max(width, card.length);
    }
  }

  const contentRows = data.columns.map((column) =>
    column.cards.length > 0 ? column.cards.slice() : [EMPTY_LABEL]
  );
  const height = Math.max(...contentRows.map((rows) => rows.length));
  for (const rows of contentRows) {
    while (rows.length < height) {
      rows.push('');
    }
  }

  const topBorder = data.columns.map(() => '┌' + '─'.repeat(width + 2) + '┐').join(' ');
  const divider = data.columns.map(() => '├' + '─'.repeat(width + 2) + '┤').join(' ');
  const bottomBorder = data.columns.map(() => '└' + '─'.repeat(width + 2) + '┘').join(' ');
  const headerRow = data.columns
    .map((column) => '│ ' + column.name.padEnd(width) + ' │')
    .join(' ');

  const lines = [topBorder, headerRow, divider];
  for (let r = 0; r < height; r++) {
    lines.push(contentRows.map((rows) => '│ ' + rows[r].padEnd(width) + ' │').join(' '));
  }
  lines.push(bottomBorder);

  process.stdout.write(lines.join('\n') + '\n');
}

main();
