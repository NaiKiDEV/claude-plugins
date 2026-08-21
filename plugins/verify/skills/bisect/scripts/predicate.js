#!/usr/bin/env node
'use strict';

// A predicate harness for `git bisect run`.
//
// Runs a command repeatedly at the current commit and collapses the runs
// into the exit codes git bisect expects:
//
//   0    good (old)
//   1    bad  (new)
//   125  untestable, skip this commit
//
// The point is flake tolerance. A single run of a noisy test sends the
// binary search down the wrong half without reporting anything, and the
// result of that is a confident, wrong commit.

const { spawnSync } = require('child_process');

const DEFAULT_TIMEOUT_MS = 300000;
const EXIT_GOOD = 0;
const EXIT_BAD = 1;
const EXIT_SKIP = 125;

function fail(message) {
  process.stderr.write(message + '\n');
  process.exit(EXIT_SKIP);
}

function sanitize(value) {
  return String(value).replace(/\s+/g, ' ');
}

function usage() {
  return [
    'usage: predicate.js --run <command> [options]',
    '',
    '  --run <command>      command to evaluate at this commit (required)',
    '  --repeat <n>         run it n times (default 1)',
    '  --bad-if <mode>      any | majority | all (default any)',
    '  --bad-on <code>      exit code that means bad (default: any non-zero)',
    '  --expect <string>    treat output containing this string as bad',
    '  --setup <command>    run before each attempt, e.g. a dependency install',
    '                       a failing setup reports 125, so the commit is skipped',
    '  --timeout <ms>       per-run timeout (default 300000)',
    '  --shell <path>       shell to run in (default $SHELL, then platform)',
    '  --invert             swap good and bad, to bisect a fix rather than a break',
  ].join('\n');
}

function parseArgs(argv) {
  const opts = {
    run: null,
    repeat: 1,
    badIf: 'any',
    badOn: null,
    expect: null,
    setup: null,
    timeout: DEFAULT_TIMEOUT_MS,
    shell: null,
    invert: false,
  };
  const flags = {
    '--run': 'run',
    '--repeat': 'repeat',
    '--bad-if': 'badIf',
    '--bad-on': 'badOn',
    '--expect': 'expect',
    '--setup': 'setup',
    '--timeout': 'timeout',
    '--shell': 'shell',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--invert') {
      opts.invert = true;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      process.stdout.write(usage() + '\n');
      process.exit(EXIT_GOOD);
    }
    const key = flags[arg];
    if (!key) return { error: 'unknown argument: ' + sanitize(arg) };
    if (i + 1 >= argv.length) return { error: 'missing value for ' + sanitize(arg) };
    i += 1;
    opts[key] = argv[i];
  }

  if (!opts.run) return { error: 'missing required --run <command>\n\n' + usage() };

  opts.repeat = Number(opts.repeat);
  if (!Number.isInteger(opts.repeat) || opts.repeat < 1) {
    return { error: '--repeat must be a positive integer' };
  }
  opts.timeout = Number(opts.timeout);
  if (!Number.isFinite(opts.timeout) || opts.timeout <= 0) {
    return { error: '--timeout must be a positive number of milliseconds' };
  }
  if (['any', 'majority', 'all'].indexOf(opts.badIf) === -1) {
    return { error: '--bad-if must be one of: any, majority, all' };
  }
  if (opts.badOn !== null) {
    opts.badOn = Number(opts.badOn);
    if (!Number.isInteger(opts.badOn)) {
      return { error: '--bad-on must be an integer exit code' };
    }
  }
  return { opts };
}

// Node's shell:true resolves to cmd.exe on Windows, which does not expand
// POSIX variables and has none of the usual tools. Prefer $SHELL.
function shellFor(opts) {
  return opts.shell || process.env.SHELL || true;
}

function run(command, opts) {
  return spawnSync(command, {
    shell: shellFor(opts),
    timeout: opts.timeout,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
}

// One attempt. Returns 'bad', 'good', or 'untestable'.
function attempt(opts) {
  if (opts.setup) {
    const setup = run(opts.setup, opts);
    if (setup.status !== 0) return 'untestable';
  }

  const result = run(opts.run, opts);

  if (result.error && result.error.code === 'ETIMEDOUT') return 'untestable';
  if (result.error) return 'untestable';

  // A signalled process (segfault, OOM kill) is a real outcome, not an
  // untestable commit, so it counts as bad unless --bad-on says otherwise.
  if (opts.expect !== null) {
    const output = (result.stdout || '') + (result.stderr || '');
    return output.indexOf(opts.expect) !== -1 ? 'bad' : 'good';
  }
  if (opts.badOn !== null) {
    return result.status === opts.badOn ? 'bad' : 'good';
  }
  if (result.status === null) return 'bad';
  return result.status === 0 ? 'good' : 'bad';
}

function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.error) fail(parsed.error);
  const opts = parsed.opts;

  let bad = 0;
  let good = 0;
  let untestable = 0;

  for (let i = 0; i < opts.repeat; i += 1) {
    const outcome = attempt(opts);
    if (outcome === 'bad') bad += 1;
    else if (outcome === 'good') good += 1;
    else untestable += 1;

    // Short-circuit once the verdict cannot change, to keep the search cheap.
    if (opts.badIf === 'any' && bad > 0) break;
    if (opts.badIf === 'all' && good > 0) break;
  }

  const tested = bad + good;
  if (tested === 0) {
    process.stderr.write('predicate: no run produced a verdict, skipping this commit\n');
    process.exit(EXIT_SKIP);
  }

  let isBad;
  if (opts.badIf === 'any') isBad = bad > 0;
  else if (opts.badIf === 'all') isBad = good === 0;
  else isBad = bad > tested / 2;

  if (opts.invert) isBad = !isBad;

  process.stderr.write(
    'predicate: ' + bad + ' bad, ' + good + ' good, ' + untestable + ' untestable' +
      ' -> ' + (isBad ? 'bad' : 'good') + '\n'
  );
  process.exit(isBad ? EXIT_BAD : EXIT_GOOD);
}

main();
