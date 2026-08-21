#!/usr/bin/env node
'use strict';

// Mutation testing for C-family syntax.
//
// Introduces one small fault at a time into a source file, runs the tests,
// and records whether they noticed. A mutant the suite fails to detect is
// a specific, located gap in the assertions.
//
// This is the only script in the plugin that modifies a tracked file, so
// the safety contract matters more than the feature set:
//
//   - it refuses to run unless the target file is clean in git
//   - it refuses to run unless the suite passes before any mutation
//   - it keeps an on-disk backup and recovers from one left by a run that
//     was killed outright, which a finally block cannot protect against
//   - it restores the original bytes after every mutant, in a finally
//   - it restores on SIGINT, SIGTERM, SIGHUP, and on any thrown error
//   - it verifies the file is byte-identical before reporting
//
// Timeouts are derived from the measured baseline rather than fixed,
// because mutating a loop counter or a loop condition routinely produces
// an infinite loop. That is an expected outcome, not an error.
//
// Operators are applied by token position, with comments and string
// literals masked out, so a mutation never lands inside text.

const fs = require('fs');
const { spawnSync } = require('child_process');

const DEFAULT_TIMEOUT_MS = 300000;

function fail(message) {
  process.stderr.write(message + '\n');
  process.exit(1);
}

function sanitize(value) {
  return String(value).replace(/\s+/g, ' ');
}

// Token-level operators. Each is a literal swap, so the result stays
// syntactically valid wherever the original was.
const OPERATORS = [
  { name: 'conditional-boundary', from: '<=', to: '<' },
  { name: 'conditional-boundary', from: '>=', to: '>' },
  { name: 'negate-conditional', from: '==', to: '!=' },
  { name: 'negate-conditional', from: '!=', to: '==' },
  { name: 'logical-connector', from: '&&', to: '||' },
  { name: 'logical-connector', from: '||', to: '&&' },
  { name: 'increment', from: '++', to: '--' },
  { name: 'increment', from: '--', to: '++' },
  { name: 'conditional-boundary', from: '<', to: '<=' },
  { name: 'conditional-boundary', from: '>', to: '>=' },
  { name: 'arithmetic', from: '+', to: '-' },
  { name: 'arithmetic', from: '-', to: '+' },
  { name: 'arithmetic', from: '*', to: '/' },
  { name: 'boolean-literal', from: 'true', to: 'false' },
  { name: 'boolean-literal', from: 'false', to: 'true' },
];

const WORD_OPERATORS = new Set(['true', 'false']);

// Marks every character that sits inside a comment or a string literal, so
// operators are never applied to text. Handles //, /* */, and single,
// double, and backtick quoted strings with backslash escapes.
function maskCode(src) {
  const mask = new Uint8Array(src.length);
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];

    if (c === '/' && next === '/') {
      while (i < src.length && src[i] !== '\n') mask[i++] = 1;
      continue;
    }
    if (c === '/' && next === '*') {
      mask[i++] = 1;
      mask[i++] = 1;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) mask[i++] = 1;
      if (i < src.length) {
        mask[i++] = 1;
        mask[i++] = 1;
      }
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      const quote = c;
      mask[i++] = 1;
      while (i < src.length) {
        if (src[i] === '\\') {
          mask[i++] = 1;
          if (i < src.length) mask[i++] = 1;
          continue;
        }
        const done = src[i] === quote;
        mask[i++] = 1;
        if (done) break;
      }
      continue;
    }
    i += 1;
  }
  return mask;
}

function isWordChar(ch) {
  return ch !== undefined && /[A-Za-z0-9_$]/.test(ch);
}

function lineOf(src, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) if (src[i] === '\n') line += 1;
  return line;
}

function lineTextAt(src, index) {
  let start = index;
  while (start > 0 && src[start - 1] !== '\n') start -= 1;
  let end = index;
  while (end < src.length && src[end] !== '\n') end += 1;
  return src.slice(start, end).trim();
}

// Finds every applicable mutation site. Longer operators are matched first
// so that <= is never mutated as <.
function findMutants(src, enabled) {
  const mask = maskCode(src);
  const mutants = [];
  const claimed = new Uint8Array(src.length);

  for (const op of OPERATORS) {
    if (enabled && !enabled.has(op.name)) continue;
    let from = 0;
    for (;;) {
      const at = src.indexOf(op.from, from);
      if (at === -1) break;
      from = at + 1;

      let free = true;
      for (let k = at; k < at + op.from.length; k += 1) {
        if (mask[k] || claimed[k]) {
          free = false;
          break;
        }
      }
      if (!free) continue;

      if (WORD_OPERATORS.has(op.from)) {
        if (isWordChar(src[at - 1]) || isWordChar(src[at + op.from.length])) continue;
      } else {
        // Skip an operator that is part of a longer one we do not handle,
        // such as the = in += or the > in =>.
        const before = src[at - 1];
        const after = src[at + op.from.length];
        if ('=<>!+-*/&|'.indexOf(before) !== -1 && op.from !== before + op.from) continue;
        if (after === '=' && op.from !== '==' && op.from !== '!=') continue;
        if (op.from === '/' && (after === '/' || after === '*')) continue;
        if (op.from === '-' && after === '>') continue;
        if (op.from === '<' && after === '/') continue;
      }

      for (let k = at; k < at + op.from.length; k += 1) claimed[k] = 1;
      mutants.push({
        index: at,
        operator: op.name,
        from: op.from,
        to: op.to,
        line: lineOf(src, at),
        context: lineTextAt(src, at),
      });
    }
  }

  mutants.sort((a, b) => a.index - b.index);
  return mutants;
}

function apply(src, mutant) {
  return src.slice(0, mutant.index) + mutant.to + src.slice(mutant.index + mutant.from.length);
}

function shellFor(opts) {
  return opts.shell || process.env.SHELL || true;
}

function runTests(opts, timeoutMs) {
  const started = Date.now();
  const result = spawnSync(opts.test, {
    shell: shellFor(opts),
    timeout: timeoutMs === undefined ? opts.timeout : timeoutMs,
    stdio: 'ignore',
  });
  const elapsed = Date.now() - started;
  if (result.error && result.error.code === 'ETIMEDOUT') return { outcome: 'timeout', elapsed };
  return { outcome: result.status === 0 ? 'pass' : 'fail', elapsed };
}

function git(args) {
  return spawnSync('git', args, { encoding: 'utf8' });
}

function parseArgs(argv) {
  const opts = {
    file: null,
    test: null,
    timeout: DEFAULT_TIMEOUT_MS,
    limit: 0,
    operators: null,
    shell: null,
    dryRun: false,
    allowDirty: false,
    timeoutExplicit: false,
  };
  const flags = {
    '--file': 'file',
    '--test': 'test',
    '--timeout': 'timeout',
    '--limit': 'limit',
    '--operators': 'operators',
    '--shell': 'shell',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      opts.dryRun = true;
      continue;
    }
    if (arg === '--allow-dirty') {
      opts.allowDirty = true;
      continue;
    }
    const key = flags[arg];
    if (!key) return { error: 'unknown argument: ' + sanitize(arg) };
    if (i + 1 >= argv.length) return { error: 'missing value for ' + sanitize(arg) };
    i += 1;
    opts[key] = argv[i];
    if (key === 'timeout') opts.timeoutExplicit = true;
  }

  if (!opts.file) return { error: 'missing required --file <path>' };
  if (!opts.dryRun && !opts.test) return { error: 'missing required --test <command>' };
  if (!fs.existsSync(opts.file)) {
    return { error: 'file does not exist: ' + sanitize(opts.file) };
  }
  opts.timeout = Number(opts.timeout);
  if (!Number.isFinite(opts.timeout) || opts.timeout <= 0) {
    return { error: '--timeout must be a positive number of milliseconds' };
  }
  opts.limit = Number(opts.limit);
  if (!Number.isInteger(opts.limit) || opts.limit < 0) {
    return { error: '--limit must be a non-negative integer' };
  }
  if (opts.operators) {
    opts.operators = new Set(String(opts.operators).split(',').map((s) => s.trim()));
  }
  return { opts };
}

function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.error) fail(parsed.error);
  const opts = parsed.opts;

  const backupPath = opts.file + '.mutate-backup';

  // A run killed outright (SIGKILL, a harness timeout, a power loss) cannot
  // run a finally block, so recovery has to be possible from disk alone.
  if (fs.existsSync(backupPath) && !opts.dryRun) {
    const backup = fs.readFileSync(backupPath, 'utf8');
    fs.writeFileSync(opts.file, backup);
    fs.unlinkSync(backupPath);
    process.stderr.write(
      'recovered ' + opts.file + ' from a backup left by an interrupted run\n'
    );
  }

  const original = fs.readFileSync(opts.file, 'utf8');
  const mutants = findMutants(original, opts.operators);

  if (opts.dryRun) {
    process.stdout.write(
      JSON.stringify({ file: opts.file, mutantCount: mutants.length, mutants }, null, 2) + '\n'
    );
    return;
  }

  // Precondition 1: the file must be clean, so restoration is provable and
  // an interrupted run cannot destroy uncommitted work.
  if (!opts.allowDirty) {
    const status = git(['status', '--porcelain', '--', opts.file]);
    if (status.status !== 0) {
      fail('git is unavailable or this is not a repository, so a safe restore cannot be guaranteed');
    }
    if (status.stdout.trim() !== '') {
      fail(
        'the target file has uncommitted changes. Mutation testing rewrites it in place, ' +
          'so commit or stash first. Refusing to run.'
      );
    }
  }

  if (!mutants.length) {
    process.stdout.write(
      JSON.stringify({ file: opts.file, mutantCount: 0, note: 'no mutation sites found' }, null, 2) + '\n'
    );
    return;
  }

  // Precondition 2: a suite that is already failing cannot tell you
  // anything about whether it detects a fault.
  const baseline = runTests(opts);
  if (baseline.outcome !== 'pass') {
    fail(
      'the test command does not pass on the unmutated file (' + baseline.outcome + '). ' +
        'A red or flaky suite makes a mutation score meaningless. Refusing to run.'
    );
  }

  // Mutating a loop counter or a loop condition routinely produces an
  // infinite loop, so a fixed generous timeout stalls the whole run. Ten
  // times the measured baseline is long enough for a slower path and short
  // enough that a non-terminating mutant is cut off quickly.
  const perMutantTimeout = opts.timeoutExplicit
    ? opts.timeout
    : Math.min(60000, Math.max(5000, baseline.elapsed * 10));

  const selected = opts.limit ? mutants.slice(0, opts.limit) : mutants;
  const killed = [];
  const survived = [];

  let restored = false;
  const restore = () => {
    if (restored) return;
    try {
      fs.writeFileSync(opts.file, original);
      restored = true;
      if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
    } catch (e) {
      process.stderr.write(
        'CRITICAL: could not restore ' + opts.file + '. The original is at ' + backupPath + '\n'
      );
    }
  };

  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) {
    process.on(signal, () => {
      restore();
      process.exit(130);
    });
  }
  process.on('uncaughtException', (err) => {
    restore();
    process.stderr.write(String((err && err.stack) || err) + '\n');
    process.exit(1);
  });

  fs.writeFileSync(backupPath, original);

  try {
    for (const mutant of selected) {
      fs.writeFileSync(opts.file, apply(original, mutant));
      const result = runTests(opts, perMutantTimeout);
      const record = {
        line: mutant.line,
        operator: mutant.operator,
        change: mutant.from + ' -> ' + mutant.to,
        context: mutant.context,
      };
      // A mutant that never terminates has been detected by the timeout,
      // which counts as killed: the fault did not go unnoticed.
      if (result.outcome === 'fail') killed.push(record);
      else if (result.outcome === 'timeout') {
        killed.push(Object.assign({ detectedBy: 'timeout' }, record));
      } else survived.push(record);
    }
  } finally {
    restore();
  }

  // Precondition 3, checked after the fact: prove the file came back.
  const onDisk = fs.readFileSync(opts.file, 'utf8');
  const clean = onDisk === original;
  if (!clean) {
    process.stderr.write('CRITICAL: ' + opts.file + ' does not match its original bytes\n');
  }

  const scored = killed.length + survived.length;
  const report = {
    file: opts.file,
    restored: clean,
    mutantsFound: mutants.length,
    mutantsRun: selected.length,
    perMutantTimeoutMs: perMutantTimeout,
    killed: killed.length,
    killedByTimeout: killed.filter((m) => m.detectedBy === 'timeout').length,
    survived: survived.length,
    mutationScore: scored ? Number((killed.length / scored).toFixed(3)) : null,
    survivors: survived,
  };
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  process.exit(clean ? 0 : 1);
}

main();
