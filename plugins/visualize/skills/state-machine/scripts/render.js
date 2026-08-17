'use strict';

// Renders a left-to-right state machine from JSON on stdin, using Unicode
// box-drawing characters. Zero dependencies.
// Schema:
// {
//   "states": [
//     {"id": "idle", "label": "Idle", "start": true},
//     {"id": "running", "label": "Running"},
//     {"id": "done", "label": "Done", "accept": true}
//   ],
//   "transitions": [
//     {"from": "idle", "to": "running", "label": "start()"},
//     {"from": "running", "to": "done", "label": "complete()"}
//   ]
// }
//
// Layout: states are drawn strictly in the given order, left to right. A
// transition only becomes an arrow between two boxes when its "from" is the
// state immediately before its "to" in that same order, so a back-edge or a
// cycle cannot be drawn spatially. A "(start) →" marker is printed before a
// start state's box; an accept state's box uses a double-line border instead
// of single-line. Every transition, drawable or not, is also listed in a
// table below the diagram, which is the only place a back-edge or cycle is
// guaranteed to show up.

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

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validate(data) {
  if (!isPlainObject(data)) {
    return 'input must be a JSON object';
  }
  if (!Array.isArray(data.states) || data.states.length === 0) {
    return '"states" must be a non-empty array';
  }
  const ids = new Set();
  for (let i = 0; i < data.states.length; i++) {
    const state = data.states[i];
    if (!isPlainObject(state) || typeof state.id !== 'string' || state.id.length === 0) {
      return `states[${i}] must be an object with a non-empty string "id"`;
    }
    if (typeof state.label !== 'string' || state.label.length === 0) {
      return `states[${i}] ("${sanitize(state.id)}") is missing a non-empty string "label"`;
    }
    if (state.start !== undefined && typeof state.start !== 'boolean') {
      return `states[${i}] ("${sanitize(state.id)}") "start" must be a boolean when present`;
    }
    if (state.accept !== undefined && typeof state.accept !== 'boolean') {
      return `states[${i}] ("${sanitize(state.id)}") "accept" must be a boolean when present`;
    }
    if (ids.has(state.id)) {
      return `duplicate state id "${sanitize(state.id)}"`;
    }
    ids.add(state.id);
  }
  if (data.transitions === undefined) {
    data.transitions = [];
  }
  if (!Array.isArray(data.transitions)) {
    return '"transitions" must be an array when present';
  }
  for (let i = 0; i < data.transitions.length; i++) {
    const t = data.transitions[i];
    if (!isPlainObject(t) || typeof t.from !== 'string' || typeof t.to !== 'string') {
      return `transitions[${i}] must be an object with string "from" and "to"`;
    }
    if (!ids.has(t.from)) {
      return `transitions[${i}] references unknown state id "${sanitize(t.from)}"`;
    }
    if (!ids.has(t.to)) {
      return `transitions[${i}] references unknown state id "${sanitize(t.to)}"`;
    }
    if (t.label !== undefined && typeof t.label !== 'string') {
      return `transitions[${i}] "label" must be a string when present`;
    }
  }
  return null;
}

function center(text, width) {
  const diff = width - text.length;
  if (diff <= 0) return text;
  const left = Math.floor(diff / 2);
  const right = diff - left;
  return ' '.repeat(left) + text + ' '.repeat(right);
}

const START_MARKER = '(start) →';

function startMarkerBlock() {
  const width = START_MARKER.length;
  return [' '.repeat(width), START_MARKER, ' '.repeat(width)];
}

function stateBlock(label, doubled) {
  const top = doubled
    ? '╔' + '═'.repeat(label.length + 2) + '╗'
    : '┌' + '─'.repeat(label.length + 2) + '┐';
  const mid = doubled ? '║ ' + label + ' ║' : '│ ' + label + ' │';
  const bottom = doubled
    ? '╚' + '═'.repeat(label.length + 2) + '╝'
    : '└' + '─'.repeat(label.length + 2) + '┘';
  return [top, mid, bottom];
}

function gapBlock() {
  return ['   ', '   ', '   '];
}

function connectorBlock(label) {
  const width = Math.max((label || '').length, 2) + 2;
  const arrow = '─'.repeat(width - 1) + '→';
  const labelLine = label ? center(label, width) : ' '.repeat(width);
  return [labelLine, arrow, ' '.repeat(width)];
}

function buildTable(transitions) {
  if (transitions.length === 0) return [];
  const fromWidth = Math.max(...transitions.map((t) => t.from.length));
  const toWidth = Math.max(...transitions.map((t) => t.to.length));
  return transitions.map((t) => {
    const row = `${t.from.padEnd(fromWidth)} → ${t.to.padEnd(toWidth)}`;
    return t.label ? `${row} : ${t.label}` : row;
  });
}

function render(states, transitions) {
  const usedTransitions = new Set();
  const blocks = [];

  states.forEach((state, i) => {
    if (state.start) blocks.push(startMarkerBlock());
    blocks.push(stateBlock(state.label, Boolean(state.accept)));
    if (i === states.length - 1) return;
    const next = states[i + 1];
    const idx = transitions.findIndex(
      (t, ti) => !usedTransitions.has(ti) && t.from === state.id && t.to === next.id
    );
    if (idx === -1) {
      blocks.push(gapBlock());
    } else {
      usedTransitions.add(idx);
      blocks.push(connectorBlock(transitions[idx].label));
    }
  });

  const lines = [0, 1, 2].map((row) => blocks.map((b) => b[row]).join(' '));
  const table = buildTable(transitions);

  return { diagram: lines.join('\n'), table };
}

async function main() {
  const raw = await readStdin();
  if (raw.trim().length === 0) {
    fail('no input on stdin: expected a JSON object');
    return;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    fail('invalid JSON on stdin: ' + err.message);
    return;
  }

  const problem = validate(data);
  if (problem) {
    fail(problem);
    return;
  }

  const { diagram, table } = render(data.states, data.transitions);

  let out = diagram;
  if (table.length > 0) {
    out += '\n\n' + table.join('\n');
  }

  process.stdout.write(out + '\n');
}

main();
