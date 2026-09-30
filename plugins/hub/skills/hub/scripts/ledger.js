#!/usr/bin/env node
'use strict'

// Keeps the ledger for one /hub run, its plan and each row's status, as JSON
// at <os.tmpdir()>/claude-hub-ledger/<run>.json, never in the repo.
//
// Usage: node ledger.js --run <id> [--width N] <command> [args]
//   init    rows on stdin replace the state; prints the plan view
//   add     rows on stdin are appended; prints one line
//   set <#>[,<#>...] <status> [note...]   prints one line
//   show    prints the status view; plan prints the plan view again
// Rows: an optional `title: <text>` line, then `<#> | <kind> | <spoke> |
// <scope> | <after>`, where <after> lists row ids and spoke `hub` is a hub step.
//
// Views draw one lane per stage, a text Gantt, and group rows under stage
// lines instead past MAX_LANES or when the lanes leave scope too narrow.
// Output is ASCII plus RULE, SEP and the title mark, with no colour. Widths
// are code points, so wide East Asian characters in user text will misalign.

const fs = require('fs')
const os = require('os')
const path = require('path')

const STATUSES = ['done', 'running', 'retry', 'waiting', 'failed', 'dropped']
const BARS = { plan: '===', done: '===', running: '>>>', retry: '>>>', waiting: '...', failed: 'xxx', dropped: '---' }
const STATUS_WIDTH = Math.max(...STATUSES.map((s) => s.length))
const RUN_ID = /^[A-Za-z0-9_-]{1,128}$/
const ROW_ID = /^[A-Za-z0-9+]{1,4}$/
const DEFAULT_WIDTH = 100
const MIN_WIDTH = 40
const MAX_LANES = 6
const MIN_SCOPE = 16
const MIN_WRAP = 8
const LANE = 4
const LEAD = ' '
const INDENT = '  '
const GAP = '  '
const SEP = ' · '
const RULE = '─'
// Wrapping prefers spaces and commas, then slashes, then a hard break.
const BREAKS = [/[^ ,]*[ ,]+|[^ ,]+/g, /[^/]*\/+|[^/]+/g]

function fail(message) {
  throw new Error(message)
}

const len = (text) => Array.from(text).length
const padEnd = (text, width) => text + ' '.repeat(Math.max(0, width - len(text)))
const clean = (text) => String(text).replace(/\s+/g, ' ').trim()
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`
const label = (ids) => (ids.length === 1 ? `row ${ids[0]}` : `rows ${ids.join(',')}`)
const strip = ({ line, ...row }) => row

function readStdin() {
  if (process.stdin.isTTY) fail('this command reads rows on stdin')
  const chunks = []
  process.stdin.on('data', (chunk) => chunks.push(chunk))
  return new Promise((resolve) => {
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  })
}

function parseArgs(argv) {
  const isFlag = (a) => a === '--run' || a === '--width'
  const value = (name, fallback) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : fallback)
  const [command, ...args] = argv.filter((a, i) => !isFlag(a) && !isFlag(argv[i - 1]))
  const run = value('--run', '')
  const width = Number(value('--width', DEFAULT_WIDTH))
  if (!RUN_ID.test(run || '')) fail(`bad or missing --run id '${run || ''}': use 1-128 letters, digits, _ or -`)
  if (!Number.isInteger(width) || width < MIN_WIDTH) fail(`--width must be a whole number of at least ${MIN_WIDTH}`)
  return { file: path.join(os.tmpdir(), 'claude-hub-ledger', `${run}.json`), width, command, args }
}

function loadState(file) {
  if (!fs.existsSync(file)) fail('no ledger for this run: run init first')
  try {
    const state = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (state && Array.isArray(state.rows)) return state
  } catch (err) {
    fail(`ledger state is unreadable (${err.message}): run init again`)
  }
  return fail('ledger state is malformed: run init again')
}

// Writes a temp file and renames it over the state, so no reader sees half a file.
function saveState(file, state) {
  const tmp = `${file}.${process.pid}.tmp`
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2) + '\n')
  fs.renameSync(tmp, file)
  return state
}

function parseRow(text, n) {
  const fields = text.split('|').map(clean)
  if (fields.length < 4 || fields.length > 5) fail(`line ${n}: expected '<#> | <kind> | <spoke> | <scope> | <after>'`)
  const [id, kind, spoke, scope, after = ''] = fields
  if (!ROW_ID.test(id)) fail(`line ${n}: bad row id '${id}': use 1-4 letters, digits or +`)
  if (!kind || !spoke || !scope) fail(`line ${n}: kind, spoke and scope must not be empty`)
  const deps = [...new Set(after.split(',').map(clean).filter(Boolean))]
  const bad = deps.find((d) => !ROW_ID.test(d))
  if (bad !== undefined) fail(`line ${n}: bad row id '${bad}' in after`)
  return { id, kind, spoke, scope, after: deps, status: 'waiting', note: '', line: n }
}

function parseInput(text, allowTitle) {
  let title = ''
  const rows = []
  text.split(/\r?\n/).forEach((raw, i) => {
    const heading = /^title:(.*)$/i.exec(raw.trim())
    if (heading && !allowTitle) fail(`line ${i + 1}: title belongs to init`)
    if (heading) title = clean(heading[1])
    else if (raw.trim()) rows.push(parseRow(raw, i + 1))
  })
  if (!rows.length) fail('no rows on stdin')
  return { title, rows }
}

// Checks incoming rows against those already held: unique ids, known
// predecessors, no cycles. Held rows never wait on new ones, so any cycle
// runs through incoming rows and has a line to name.
function checkRows(held, incoming) {
  const seen = new Set(held.map((r) => r.id))
  incoming.forEach((row) => {
    if (seen.has(row.id)) fail(`line ${row.line}: duplicate row id ${row.id}`)
    seen.add(row.id)
  })
  incoming.forEach((row) => {
    const unknown = row.after.find((d) => !seen.has(d))
    if (unknown !== undefined) fail(`line ${row.line}: row ${row.id} waits on unknown row ${unknown}`)
  })
  const byId = new Map([...held, ...incoming].map((r) => [r.id, r]))
  const marks = new Map()
  const visit = (id, trail) => {
    if (marks.get(id) === 'done') return
    if (marks.get(id) === 'open') {
      const loop = [...trail.slice(trail.indexOf(id)), id].join(' -> ')
      fail(`line ${byId.get(trail[trail.length - 1]).line}: cycle in after: ${loop}`)
    }
    marks.set(id, 'open')
    byId.get(id).after.forEach((d) => visit(d, [...trail, id]))
    marks.set(id, 'done')
  }
  incoming.forEach((r) => visit(r.id, []))
}

// A row's stage is its dependency depth plus one: 1 for a row that waits on
// nothing, otherwise one more than the latest stage it waits on.
function stagesOf(rows) {
  const byId = new Map(rows.map((r) => [r.id, r]))
  const memo = new Map()
  const stage = (id) => {
    if (!memo.has(id)) memo.set(id, 1 + Math.max(0, ...byId.get(id).after.map(stage)))
    return memo.get(id)
  }
  return rows.map((r) => stage(r.id))
}

function planSummary(rows) {
  const stages = stagesOf(rows)
  const count = Math.max(...stages)
  const most = Math.max(...stages.map((s) => stages.filter((t) => t === s).length))
  const hubSteps = rows.filter((r) => r.spoke.toLowerCase() === 'hub').length
  const steps = hubSteps ? ` + ${plural(hubSteps, 'hub step')}` : ''
  return [plural(rows.length - hubSteps, 'spoke') + steps, plural(count, 'stage'), `up to ${most} at once`].join(SEP)
}

function countsText(rows, joiner) {
  const tally = STATUSES.map((s) => [s, rows.filter((r) => r.status === s).length]).filter(([, n]) => n)
  if (tally.length === 1 && tally[0][0] === 'done') return `all ${rows.length} done`
  return tally.map(([s, n]) => `${n} ${s}`).join(joiner)
}

const hardBreak = (text, width) => text.match(new RegExp(`.{1,${width}}`, 'gu')) || ['']

function wrap(text, width, breaks = BREAKS) {
  const [pattern, ...finer] = breaks
  const lines = []
  let line = ''
  for (const chunk of text.match(pattern) || []) {
    if (len((line + chunk).trimEnd()) <= width) {
      line += chunk
      continue
    }
    if (line.trim()) lines.push(line.trimEnd())
    line = chunk.trimStart()
    if (len(line.trimEnd()) > width) {
      const pieces = finer.length ? wrap(line.trimEnd(), width, finer) : hardBreak(line.trimEnd(), width)
      lines.push(...pieces.slice(0, -1))
      line = pieces[pieces.length - 1] + line.slice(line.trimEnd().length)
    }
  }
  if (line.trim()) lines.push(line.trimEnd())
  return lines.length ? lines : ['']
}

// Splits the room among wrapping columns, narrowest first: each takes its
// natural width or an even share of what is left, whichever is smaller.
function share(naturals, room) {
  const widths = naturals.slice()
  const order = naturals.map((_, i) => i).sort((a, b) => naturals[a] - naturals[b])
  order.reduce((left, i, k) => {
    const even = Math.floor(left / (order.length - k))
    widths[i] = Math.max(Math.min(MIN_WRAP, naturals[i]), Math.min(naturals[i], even))
    return left - widths[i]
  }, room)
  return widths
}

// Fixed columns keep their natural width; wrapping columns share what is left.
// Returns the column header line and each row's lines, continuations included.
function renderTable(allCols, maxWidth) {
  const cols = allCols.filter((c) => c.head || c.cells.some(Boolean))
  const gaps = cols.map((c, i) => (c.tight || i === cols.length - 1 ? '' : GAP))
  const natural = cols.map((c) => Math.max(len(c.head), ...c.cells.map(len)))
  const fixed = cols.reduce((sum, c, i) => sum + len(gaps[i]) + (c.wrap ? 0 : natural[i]), 0)
  const wrapping = cols.map((_, i) => i).filter((i) => cols[i].wrap)
  const shared = share(wrapping.map((i) => natural[i]), maxWidth - len(INDENT) - fixed)
  const widths = natural.map((w, i) => (cols[i].wrap ? shared[wrapping.indexOf(i)] : w))
  const line = (cells) => (INDENT + cells.map((c, i) => padEnd(c, widths[i]) + gaps[i]).join('')).trimEnd()
  const rows = cols[0].cells.map((_, r) => {
    const parts = cols.map((c, i) => (c.wrap ? wrap(c.cells[r], widths[i]) : [c.cells[r]]))
    return Array.from({ length: Math.max(...parts.map((p) => p.length)) }, (_, k) => line(parts.map((p) => p[k] || '')))
  })
  return { head: line(cols.map((c) => c.head)), rows, widths }
}

function lanes(stages, bar) {
  const slots = (fill) => Array.from({ length: Math.max(...stages) }, (_, s) => padEnd(fill(s + 1), LANE)).join('')
  return { head: slots(String), cells: stages.map((st, i) => slots((s) => (s === st ? bar(i) : ''))), tight: true }
}

// Lanes while they fit with scope at MIN_SCOPE or wider; otherwise the same
// columns grouped under stage lines.
function body(rows, tail, bar, maxWidth) {
  const stages = stagesOf(rows)
  const base = [
    { head: '#', cells: rows.map((r) => r.id) },
    { head: 'kind', cells: rows.map((r) => r.kind) },
    { head: 'spoke', cells: rows.map((r) => r.spoke) },
    { head: 'scope', cells: rows.map((r) => r.scope), wrap: true },
  ]
  const scopeFloor = Math.min(MIN_SCOPE, Math.max(...rows.map((r) => len(r.scope))))
  if (Math.max(...stages) <= MAX_LANES) {
    const table = renderTable([...base, lanes(stages, bar), ...tail], maxWidth)
    const lines = [table.head, ...table.rows.flat()]
    if (table.widths[3] >= scopeFloor && lines.every((l) => len(l) <= maxWidth)) return lines
  }
  const table = renderTable([...base, ...tail], maxWidth)
  const groups = Array.from({ length: Math.max(...stages) }, (_, s) => rows.map((_, i) => i).filter((i) => stages[i] === s + 1))
  const grouped = groups.flatMap((members, s) => [
    `${LEAD}stage ${s + 1}${SEP}${members.length} at once`,
    ...members.flatMap((i) => table.rows[i]),
  ])
  return [table.head, ...grouped]
}

// Title on the left and summary right-aligned to the rule, on one line when
// both fit and wrapped onto their own lines when they do not.
function frame(title, right, lines, maxWidth) {
  const left = `hub${title ? ` › ${title}` : ''}`
  const natural = len(LEAD) + len(left) + len(GAP) + len(right)
  const width = Math.min(maxWidth, Math.max(...lines.map(len), natural))
  const toRight = (text) => ' '.repeat(Math.max(0, width - len(text))) + text
  const head =
    natural <= width
      ? [LEAD + left + ' '.repeat(width - natural + len(GAP)) + right]
      : [...wrap(left, width - len(LEAD)).map((l) => LEAD + l), ...wrap(right, width - len(LEAD)).map(toRight)]
  return [...head, LEAD + RULE.repeat(width - len(LEAD)), ...lines].join('\n')
}

function planView({ title, rows }, width) {
  const needs = { head: 'needs', cells: rows.map((r) => r.after.join(',')) }
  return frame(title, planSummary(rows), body(rows, [needs], () => BARS.plan, width), width)
}

// A waiting row with no note shows what it waits on.
function statusView({ title, rows }, width) {
  const status = { head: 'status', cells: rows.map((r) => padEnd(r.status, STATUS_WIDTH)) }
  const notes = rows.map((r) => r.note || (r.status === 'waiting' && r.after.length ? `after ${r.after.join(',')}` : ''))
  const tail = [status, { head: '', cells: notes, wrap: true }]
  return frame(title, countsText(rows, SEP), body(rows, tail, (i) => BARS[rows[i].status], width), width)
}

function cmdInit({ file, width }, input) {
  const { title, rows } = parseInput(input, true)
  checkRows([], rows)
  return planView(saveState(file, { title, rows: rows.map(strip) }), width)
}

function cmdAdd({ file }, input) {
  const state = loadState(file)
  const { rows } = parseInput(input, false)
  checkRows(state.rows, rows)
  const next = saveState(file, { ...state, rows: [...state.rows, ...rows.map(strip)] })
  return `added ${label(rows.map((r) => r.id))} | ${countsText(next.rows, ', ')}`
}

function cmdSet({ file, args }) {
  const [idArg = '', status, ...words] = args
  const ids = [...new Set(idArg.split(',').map(clean).filter(Boolean))]
  if (!ids.length || !status) fail('usage: set <#> <status> [note]')
  if (!STATUSES.includes(status)) fail(`bad status '${status}': use one of ${STATUSES.join(', ')}`)
  const state = loadState(file)
  const unknown = ids.find((id) => !state.rows.some((r) => r.id === id))
  if (unknown !== undefined) fail(`unknown row ${unknown}`)
  const note = clean(words.join(' '))
  const rows = state.rows.map((r) => (ids.includes(r.id) ? { ...r, status, note } : r))
  saveState(file, { ...state, rows })
  return `${label(ids)}: ${status}${note ? ` (${note})` : ''} | ${countsText(rows, ', ')}`
}

const COMMANDS = {
  init: cmdInit,
  add: cmdAdd,
  set: cmdSet,
  show: (opts) => statusView(loadState(opts.file), opts.width),
  plan: (opts) => planView(loadState(opts.file), opts.width),
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  const command = Object.prototype.hasOwnProperty.call(COMMANDS, opts.command) && COMMANDS[opts.command]
  if (!command) fail(`unknown command '${opts.command || ''}': use init, add, set, show or plan`)
  const input = opts.command === 'init' || opts.command === 'add' ? await readStdin() : ''
  process.stdout.write(command(opts, input) + '\n')
}

main().catch((err) => {
  process.stderr.write(String(err && err.message ? err.message : err).split('\n')[0] + '\n')
  process.exitCode = 1
})
