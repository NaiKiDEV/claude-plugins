#!/usr/bin/env node
'use strict';

// Renders a {title?, bars: [{label, value}], unit?} JSON payload as a
// horizontal bar chart built from solid block characters. The largest
// value's bar is a fixed max width of 40 characters; every other bar is
// scaled proportionally against it.

const MAX_BAR_WIDTH = 40;

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

// Collapses whitespace (including embedded newlines) in a raw user-supplied
// value before it's interpolated into an error message, so stderr always
// stays exactly one line even when the input tries to break that contract.
function sanitize(value) {
  return String(value).replace(/\s+/g, ' ');
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Validates the payload shape. Returns an error string on the first problem
// found, or null when the payload is valid.
function validate(data) {
  if (!isPlainObject(data)) {
    return 'root JSON value must be an object';
  }
  if (data.title !== undefined && typeof data.title !== 'string') {
    return '"title" must be a string when present';
  }
  if (data.unit !== undefined && typeof data.unit !== 'string') {
    return '"unit" must be a string when present';
  }
  if (!Array.isArray(data.bars) || data.bars.length === 0) {
    return '"bars" must be a non-empty array';
  }
  for (let i = 0; i < data.bars.length; i++) {
    const bar = data.bars[i];
    if (!isPlainObject(bar)) {
      return `bars[${i}] must be an object`;
    }
    if (typeof bar.label !== 'string' || bar.label.length === 0) {
      return `bars[${i}] is missing a non-empty string "label"`;
    }
    if (typeof bar.value !== 'number' || !Number.isFinite(bar.value)) {
      return `bars[${i}] ("${sanitize(bar.label)}") is missing a finite numeric "value"`;
    }
    if (bar.value < 0) {
      return `bars[${i}] ("${sanitize(bar.label)}") has a negative value (${bar.value}); bar-chart supports non-negative values only`;
    }
  }
  return null;
}

function barWidth(value, maxValue) {
  if (value === 0 || maxValue === 0) return 0;
  return Math.max(1, Math.round((value / maxValue) * MAX_BAR_WIDTH));
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

  const bars = data.bars;
  const unit = data.unit || '';
  const labelWidth = Math.max(...bars.map((b) => b.label.length));
  const maxValue = Math.max(...bars.map((b) => b.value));

  const lines = [];
  if (data.title) lines.push(data.title);
  for (const bar of bars) {
    const label = bar.label.padEnd(labelWidth);
    const width = barWidth(bar.value, maxValue);
    const fill = '█'.repeat(width);
    lines.push(`${label} ${fill} ${bar.value}${unit}`);
  }

  process.stdout.write(lines.join('\n') + '\n');
}

main();
