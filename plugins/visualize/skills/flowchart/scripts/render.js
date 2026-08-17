#!/usr/bin/env node
'use strict';

// Renders a top-to-bottom flowchart from JSON on stdin using box-drawing
// characters. Zero dependencies.
// Schema: { steps: Step[] }
// Step: { id: string, type: 'start'|'process'|'decision'|'end', label: string, branches?: Branch[] }
// Branch (decision steps only): { label: string, to: string }  // "to" must match another step's id
//
// Steps reached only through a decision's branch leave the main vertical spine:
// they render as that branch's own labeled line instead of a second box further down.

const STEP_TYPES = ['start', 'process', 'decision', 'end'];
const BOX_PADDING = 2;

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
  if (!Array.isArray(data.steps) || data.steps.length === 0) {
    fail('Invalid input: "steps" must be a non-empty array');
  }

  const ids = new Set();
  data.steps.forEach((step, i) => {
    if (step === null || typeof step !== 'object' || Array.isArray(step)) {
      fail(`Invalid step at steps[${i}]: expected an object`);
    }
    if (typeof step.id !== 'string' || step.id.length === 0) {
      fail(`Invalid step at steps[${i}]: "id" must be a non-empty string`);
    }
    if (ids.has(step.id)) {
      fail(`Invalid input: duplicate step id "${sanitize(step.id)}"`);
    }
    ids.add(step.id);
    if (!STEP_TYPES.includes(step.type)) {
      fail(`Invalid step "${sanitize(step.id)}": "type" must be one of ${STEP_TYPES.join(' ')}`);
    }
    if (typeof step.label !== 'string' || step.label.length === 0) {
      fail(`Invalid step "${sanitize(step.id)}": "label" must be a non-empty string`);
    }
    if (step.type === 'decision' && (!Array.isArray(step.branches) || step.branches.length === 0)) {
      fail(`Invalid step "${sanitize(step.id)}": decision steps require a non-empty "branches" array`);
    }
  });

  data.steps.forEach((step) => {
    if (step.type !== 'decision') return;
    step.branches.forEach((branch, i) => {
      if (branch === null || typeof branch !== 'object' || Array.isArray(branch)) {
        fail(`Invalid branch at "${sanitize(step.id)}".branches[${i}]: expected an object`);
      }
      if (typeof branch.label !== 'string' || branch.label.length === 0) {
        fail(`Invalid branch at "${sanitize(step.id)}".branches[${i}]: "label" must be a non-empty string`);
      }
      if (typeof branch.to !== 'string' || !ids.has(branch.to)) {
        fail(`Invalid branch at "${sanitize(step.id)}".branches[${i}]: "to" references unknown step id "${sanitize(branch.to)}"`);
      }
    });
  });
}

function buildBox(label, corners) {
  const width = label.length + BOX_PADDING;
  const top = corners.tl + '─'.repeat(width) + corners.tr;
  const bottom = corners.bl + '─'.repeat(width) + corners.br;
  return [top, '│ ' + label + ' │', bottom];
}

function renderBox(step) {
  if (step.type === 'start' || step.type === 'end') {
    return buildBox(step.label, { tl: '╭', tr: '╮', bl: '╰', br: '╯' });
  }
  if (step.type === 'decision') {
    return [`⟨ ${step.label} ⟩`];
  }
  return buildBox(step.label, { tl: '┌', tr: '┐', bl: '└', br: '┘' });
}

function render(data) {
  const byId = new Map(data.steps.map((step) => [step.id, step]));
  const branchTargets = new Set();
  data.steps.forEach((step) => {
    if (step.type === 'decision') {
      step.branches.forEach((branch) => branchTargets.add(branch.to));
    }
  });

  const spine = data.steps.filter((step) => !branchTargets.has(step.id));
  const lines = [];
  let prevWidth = null;

  spine.forEach((step) => {
    const box = renderBox(step);
    const width = Math.max(...box.map((line) => line.length));
    if (prevWidth !== null) {
      const col = Math.floor(prevWidth / 2);
      lines.push(' '.repeat(col) + '│');
      lines.push(' '.repeat(col) + '▼');
    }
    lines.push(...box);
    if (step.type === 'decision') {
      step.branches.forEach((branch) => {
        const target = byId.get(branch.to);
        lines.push(`  ── ${branch.label} ──→ ${target.label}`);
      });
    }
    prevWidth = width;
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
