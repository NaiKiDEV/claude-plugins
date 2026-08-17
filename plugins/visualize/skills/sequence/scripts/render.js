#!/usr/bin/env node
'use strict';

// Renders a sequence diagram from JSON on stdin using box-drawing characters.
// Zero dependencies.
// Schema: { participants: string[], messages: Message[] }
// Message: { from: string, to: string, label: string }  // from/to must match participants, and differ
//
// Arrow direction follows the two participants' column order, not which field is
// "from" and which is "to": left column to right column ends in a right-pointing
// arrowhead, right to left ends in a left-pointing arrowhead. Column gaps grow to
// fit the widest name or label touching them, including a label whose message
// spans more than one gap.

const MIN_GAP = 3;
const ARROW_PAD = 4;

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

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

function validate(data) {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    fail('Invalid input: root must be a JSON object');
  }
  if (!Array.isArray(data.participants) || data.participants.length < 2) {
    fail('Invalid input: "participants" must be an array of at least two names');
  }

  const seen = new Set();
  data.participants.forEach((name, i) => {
    if (typeof name !== 'string' || name.length === 0) {
      fail(`Invalid input: participants[${i}] must be a non-empty string`);
    }
    if (seen.has(name)) {
      fail(`Invalid input: duplicate participant "${sanitize(name)}"`);
    }
    seen.add(name);
  });

  if (!Array.isArray(data.messages) || data.messages.length === 0) {
    fail('Invalid input: "messages" must be a non-empty array');
  }

  data.messages.forEach((message, i) => {
    if (message === null || typeof message !== 'object' || Array.isArray(message)) {
      fail(`Invalid message at messages[${i}]: expected an object`);
    }
    if (typeof message.from !== 'string' || !seen.has(message.from)) {
      fail(`Invalid message at messages[${i}]: "from" references unknown participant "${sanitize(message.from)}"`);
    }
    if (typeof message.to !== 'string' || !seen.has(message.to)) {
      fail(`Invalid message at messages[${i}]: "to" references unknown participant "${sanitize(message.to)}"`);
    }
    if (message.from === message.to) {
      fail(`Invalid message at messages[${i}]: "from" and "to" must be different participants`);
    }
    if (typeof message.label !== 'string' || message.label.length === 0) {
      fail(`Invalid message at messages[${i}]: "label" must be a non-empty string`);
    }
  });
}

function placeAt(buffer, pos, char) {
  if (pos < 0) return;
  while (buffer.length <= pos) buffer.push(' ');
  buffer[pos] = char;
}

function placeText(buffer, start, text) {
  for (let i = 0; i < text.length; i++) placeAt(buffer, start + i, text[i]);
}

function placeCentered(buffer, center, text) {
  placeText(buffer, center - Math.floor(text.length / 2), text);
}

function lineFrom(buffer) {
  return buffer.join('').replace(/\s+$/, '');
}

function layoutColumns(participants, messages, index) {
  const n = participants.length;
  const slotWidth = participants.map((name) => name.length);
  const gap = new Array(n - 1).fill(MIN_GAP);

  function centers() {
    const positions = [Math.floor(slotWidth[0] / 2)];
    for (let i = 1; i < n; i++) {
      positions.push(
        positions[i - 1] + Math.ceil(slotWidth[i - 1] / 2) + gap[i - 1] + Math.floor(slotWidth[i] / 2)
      );
    }
    return positions;
  }

  messages.forEach((message) => {
    const lo = Math.min(index.get(message.from), index.get(message.to));
    const hi = Math.max(index.get(message.from), index.get(message.to));
    if (hi - lo === 1) {
      gap[lo] = Math.max(gap[lo], message.label.length + ARROW_PAD);
    }
  });

  messages.forEach((message) => {
    const lo = Math.min(index.get(message.from), index.get(message.to));
    const hi = Math.max(index.get(message.from), index.get(message.to));
    if (hi - lo <= 1) return;
    const positions = centers();
    const span = positions[hi] - positions[lo];
    const needed = message.label.length + ARROW_PAD;
    if (needed > span) {
      const add = Math.ceil((needed - span) / (hi - lo));
      for (let i = lo; i < hi; i++) gap[i] += add;
    }
  });

  return centers();
}

function render(data) {
  const participants = data.participants;
  const messages = data.messages;
  const index = new Map(participants.map((name, i) => [name, i]));
  const centers = layoutColumns(participants, messages, index);

  const lines = [];

  const header = [];
  participants.forEach((name, i) => placeCentered(header, centers[i], name));
  lines.push(lineFrom(header));

  const lifeline = [];
  centers.forEach((pos) => placeAt(lifeline, pos, '│'));
  lines.push(lineFrom(lifeline));

  messages.forEach((message) => {
    const a = index.get(message.from);
    const b = index.get(message.to);
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const pointsRight = a < b;

    const labelRow = [];
    centers.forEach((pos) => placeAt(labelRow, pos, '│'));
    placeCentered(labelRow, Math.round((centers[lo] + centers[hi]) / 2), message.label);
    lines.push(lineFrom(labelRow));

    const arrowRow = [];
    centers.forEach((pos) => placeAt(arrowRow, pos, '│'));
    for (let pos = centers[lo]; pos <= centers[hi]; pos++) placeAt(arrowRow, pos, '─');
    placeAt(arrowRow, pointsRight ? centers[hi] : centers[lo], pointsRight ? '→' : '←');
    lines.push(lineFrom(arrowRow));
  });

  return lines.join('\n') + '\n';
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

  validate(data);
  process.stdout.write(render(data));
}

main();
