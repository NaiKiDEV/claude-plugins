#!/usr/bin/env node
'use strict';

// Implements Zeller and Hildebrandt's ddmin over the lines of a file.
//
// Given an input file that triggers a failure and an oracle command that
// exits 0 when the failure still reproduces, this removes lines until no
// single remaining line can be removed without the failure disappearing.
//
// The oracle receives the path of the candidate under test in the
// CANDIDATE environment variable. Candidates are written under a scratch
// directory; nothing else on disk is touched.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const DEFAULT_TIMEOUT_MS = 30000;

function fail(message) {
  process.stderr.write(message + '\n');
  process.exit(1);
}

// Collapses whitespace in a raw user-supplied value before it is
// interpolated into an error message, so stderr always stays one line.
function sanitize(value) {
  return String(value).replace(/\s+/g, ' ');
}

function parseArgs(argv) {
  const opts = {
    input: null,
    test: null,
    out: null,
    repeat: 1,
    timeout: DEFAULT_TIMEOUT_MS,
    scratch: null,
    shell: null,
    keep: false,
  };
  const flags = {
    '--input': 'input',
    '--test': 'test',
    '--out': 'out',
    '--repeat': 'repeat',
    '--timeout': 'timeout',
    '--scratch': 'scratch',
    '--shell': 'shell',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--keep') {
      opts.keep = true;
      continue;
    }
    const key = flags[arg];
    if (!key) {
      return { error: 'unknown argument: ' + sanitize(arg) };
    }
    if (i + 1 >= argv.length) {
      return { error: 'missing value for ' + sanitize(arg) };
    }
    i += 1;
    opts[key] = argv[i];
  }

  if (!opts.input) return { error: 'missing required --input <file>' };
  if (!opts.test) return { error: 'missing required --test <command>' };

  opts.repeat = Number(opts.repeat);
  if (!Number.isInteger(opts.repeat) || opts.repeat < 1) {
    return { error: '--repeat must be a positive integer' };
  }
  opts.timeout = Number(opts.timeout);
  if (!Number.isFinite(opts.timeout) || opts.timeout <= 0) {
    return { error: '--timeout must be a positive number of milliseconds' };
  }
  if (!fs.existsSync(opts.input)) {
    return { error: 'input file does not exist: ' + sanitize(opts.input) };
  }
  if (!opts.out) {
    opts.out = opts.input + '.min';
  }
  return { opts };
}

// Runs the oracle against one candidate. Returns true when the failure
// still reproduces. With --repeat > 1 a single reproducing run is enough,
// which matches how a flaky oracle has to be read.
function reproduces(state, lines) {
  // The input was split on newlines, so no element can contain one. That
  // makes a newline join a collision-free cache key for a set of lines.
  const key = lines.join('\n');
  if (state.cache.has(key)) {
    return state.cache.get(key);
  }

  const candidate = path.join(state.scratch, 'candidate-' + state.runs + state.ext);
  fs.writeFileSync(candidate, lines.length ? lines.join('\n') + '\n' : '');

  let hit = false;
  for (let attempt = 0; attempt < state.repeat; attempt += 1) {
    state.runs += 1;
    const result = spawnSync(state.test, {
      shell: state.shell,
      timeout: state.timeout,
      stdio: 'ignore',
      env: Object.assign({}, process.env, { CANDIDATE: candidate }),
    });
    if (result.error && result.error.code === 'ETIMEDOUT') {
      state.timeouts += 1;
      continue;
    }
    if (result.status === 0) {
      hit = true;
      break;
    }
  }

  state.cache.set(key, hit);
  return hit;
}

// Returns n contiguous, near-equal [start, end) ranges covering a list of
// the given length. Ranges rather than copies, so a chunk's complement is
// exact even when the list contains duplicate lines.
function ranges(length, n) {
  const out = [];
  const size = length / n;
  for (let i = 0; i < n; i += 1) {
    const start = Math.floor(i * size);
    const end = Math.floor((i + 1) * size);
    if (end > start) out.push([start, end]);
  }
  return out;
}

// ddmin. Narrows to a chunk that still reproduces, else to a complement
// with one chunk removed, else increases granularity. Stops once the
// granularity has reached the size of what is left, at which point the
// result is 1-minimal: no single remaining line can be dropped without
// losing the failure.
function ddmin(state, input) {
  let current = input;
  let n = 2;

  while (current.length >= 2) {
    const parts = ranges(current.length, n);

    let narrowed = null;
    for (const [start, end] of parts) {
      const subset = current.slice(start, end);
      if (reproduces(state, subset)) {
        narrowed = subset;
        break;
      }
    }
    if (narrowed) {
      current = narrowed;
      n = 2;
      continue;
    }

    let trimmed = null;
    for (const [start, end] of parts) {
      const complement = current.slice(0, start).concat(current.slice(end));
      if (complement.length && reproduces(state, complement)) {
        trimmed = complement;
        break;
      }
    }
    if (trimmed) {
      current = trimmed;
      n = Math.max(n - 1, 2);
      continue;
    }

    if (n < current.length) {
      n = Math.min(n * 2, current.length);
      continue;
    }
    break;
  }

  return current;
}

function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.error) fail(parsed.error);
  const opts = parsed.opts;

  const raw = fs.readFileSync(opts.input, 'utf8');
  const lines = raw.split('\n');
  if (lines.length && lines[lines.length - 1] === '') lines.pop();
  if (!lines.length) fail('input file is empty, there is nothing to reduce');

  const scratch = opts.scratch || fs.mkdtempSync(path.join(os.tmpdir(), 'ddmin-'));
  fs.mkdirSync(scratch, { recursive: true });

  const state = {
    test: opts.test,
    repeat: opts.repeat,
    timeout: opts.timeout,
    // Node's shell:true resolves to cmd.exe on Windows, which does not
    // expand $CANDIDATE and has no grep. Prefer the caller's shell, then
    // $SHELL, and fall back to the platform default.
    shell: opts.shell || process.env.SHELL || true,
    scratch,
    ext: path.extname(opts.input),
    cache: new Map(),
    runs: 0,
    timeouts: 0,
  };

  // Two sanity checks. Without both, a reduction can report a confident
  // minimal case for a failure the oracle was never detecting.
  if (!reproduces(state, lines)) {
    fail(
      'the unreduced input does not reproduce: the oracle exited non-zero on the full input. ' +
        'Fix the oracle or the input before reducing.'
    );
  }
  if (reproduces(state, [])) {
    fail(
      'the oracle reports the failure on empty input, so it is not testing this input. ' +
        'Match on the specific failure signal rather than on any non-zero exit.'
    );
  }

  const minimal = ddmin(state, lines);
  fs.writeFileSync(opts.out, minimal.length ? minimal.join('\n') + '\n' : '');

  if (!opts.keep && !opts.scratch) {
    fs.rmSync(scratch, { recursive: true, force: true });
  }

  const report = {
    input: opts.input,
    output: opts.out,
    linesBefore: lines.length,
    linesAfter: minimal.length,
    oracleRuns: state.runs,
    timeouts: state.timeouts,
    repeat: opts.repeat,
  };
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
}

main();
