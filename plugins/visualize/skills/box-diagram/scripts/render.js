'use strict';

// Renders a left-to-right box diagram from JSON on stdin, using Unicode
// single-line box-drawing characters. Zero dependencies.
// Schema:
// {
//   "nodes": [{"id": "A", "label": "API Gateway"}, {"id": "B", "label": "Auth Service"}],
//   "edges": [{"from": "A", "to": "B", "label": "optional"}]
// }
//
// Layout: nodes are drawn strictly in the given order, left to right. An edge
// only becomes an arrow between two boxes when its "from" is the node
// immediately before its "to" in that same order. Every other edge (reversed,
// skipping a node, or a duplicate of an arrow already drawn) is listed as
// plain text below the diagram instead, so no edge is ever silently dropped.

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
  if (!Array.isArray(data.nodes) || data.nodes.length === 0) {
    return '"nodes" must be a non-empty array';
  }
  const ids = new Set();
  for (let i = 0; i < data.nodes.length; i++) {
    const node = data.nodes[i];
    if (!isPlainObject(node) || typeof node.id !== 'string' || node.id.length === 0) {
      return `nodes[${i}] must be an object with a non-empty string "id"`;
    }
    if (typeof node.label !== 'string' || node.label.length === 0) {
      return `nodes[${i}] ("${sanitize(node.id)}") is missing a non-empty string "label"`;
    }
    if (ids.has(node.id)) {
      return `duplicate node id "${sanitize(node.id)}"`;
    }
    ids.add(node.id);
  }
  if (data.edges === undefined) {
    data.edges = [];
  }
  if (!Array.isArray(data.edges)) {
    return '"edges" must be an array when present';
  }
  for (let i = 0; i < data.edges.length; i++) {
    const edge = data.edges[i];
    if (!isPlainObject(edge) || typeof edge.from !== 'string' || typeof edge.to !== 'string') {
      return `edges[${i}] must be an object with string "from" and "to"`;
    }
    if (!ids.has(edge.from)) {
      return `edges[${i}] references unknown node id "${sanitize(edge.from)}"`;
    }
    if (!ids.has(edge.to)) {
      return `edges[${i}] references unknown node id "${sanitize(edge.to)}"`;
    }
    if (edge.label !== undefined && typeof edge.label !== 'string') {
      return `edges[${i}] "label" must be a string when present`;
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

function nodeBlock(label) {
  const top = '┌' + '─'.repeat(label.length + 2) + '┐';
  const mid = '│ ' + label + ' │';
  const bottom = '└' + '─'.repeat(label.length + 2) + '┘';
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

function render(nodes, edges) {
  const usedEdges = new Set();
  const blocks = [];

  nodes.forEach((node, i) => {
    blocks.push(nodeBlock(node.label));
    if (i === nodes.length - 1) return;
    const next = nodes[i + 1];
    const edgeIndex = edges.findIndex(
      (e, idx) => !usedEdges.has(idx) && e.from === node.id && e.to === next.id
    );
    if (edgeIndex === -1) {
      blocks.push(gapBlock());
    } else {
      usedEdges.add(edgeIndex);
      blocks.push(connectorBlock(edges[edgeIndex].label));
    }
  });

  const lines = [0, 1, 2].map((row) => blocks.map((b) => b[row]).join(' '));

  const leftover = edges.filter((e, idx) => !usedEdges.has(idx));
  const extra = leftover.map((e) =>
    e.label ? `${e.from} → ${e.to}: ${e.label}` : `${e.from} → ${e.to}`
  );

  return { diagram: lines.join('\n'), extra };
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

  const { diagram, extra } = render(data.nodes, data.edges);

  let out = diagram;
  if (extra.length > 0) {
    out += '\n\n' + extra.join('\n');
  }

  process.stdout.write(out + '\n');
}

main();
