#!/usr/bin/env node
'use strict'

// Renders a bordered ASCII table from a JSON payload on stdin.
// Schema:
// {
//   "title": "optional string",
//   "columns": ["Name", "Status", "Owner"],
//   "align": ["left","left","left"],   // optional, per column: left|right|center
//   "rows": [["Apples","done","alice"]],
//   "totals": ["", "3 done", ""]        // optional footer row
// }

const ALIGN_VALUES = ['left', 'right', 'center']

function fail(message) {
  process.stderr.write(message + '\n')
  process.exit(1)
}

function readStdin() {
  const chunks = []
  process.stdin.on('data', (chunk) => chunks.push(chunk))
  return new Promise((resolve) => {
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  })
}

function cellText(value) {
  if (value === null || value === undefined) return ''
  return String(value)
}

function validate(data) {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return 'input must be a JSON object'
  }
  if (!Array.isArray(data.columns) || data.columns.length === 0) {
    return 'columns must be a non-empty array of strings'
  }
  if (data.columns.some((c) => typeof c !== 'string')) {
    return 'columns must contain only strings'
  }
  if (data.title !== undefined && typeof data.title !== 'string') {
    return 'title must be a string when present'
  }
  if (!Array.isArray(data.rows)) {
    return 'rows is required and must be an array'
  }
  for (let i = 0; i < data.rows.length; i++) {
    if (!Array.isArray(data.rows[i])) {
      return `row ${i} must be an array`
    }
    if (data.rows[i].length !== data.columns.length) {
      return `row ${i} has ${data.rows[i].length} cells, expected ${data.columns.length} (columns.length)`
    }
  }
  if (data.align !== undefined) {
    if (!Array.isArray(data.align) || data.align.length !== data.columns.length) {
      return `align must be an array with ${data.columns.length} entries (columns.length)`
    }
    if (data.align.some((a) => !ALIGN_VALUES.includes(a))) {
      return 'align entries must be one of left, right, center'
    }
  }
  if (data.totals !== undefined) {
    if (!Array.isArray(data.totals) || data.totals.length !== data.columns.length) {
      return `totals must be an array with ${data.columns.length} entries (columns.length)`
    }
  }
  return null
}

function pad(text, width, align) {
  const diff = width - text.length
  if (diff <= 0) return text
  if (align === 'right') return ' '.repeat(diff) + text
  if (align === 'center') {
    const left = Math.floor(diff / 2)
    const right = diff - left
    return ' '.repeat(left) + text + ' '.repeat(right)
  }
  return text + ' '.repeat(diff)
}

// Single-line box-drawing borders. Every internal divider (after the
// header, before totals) shares the same mid-row junction style; only the
// very top and very bottom rows use their own corner glyphs.
const BORDERS = {
  top: { left: '┌', mid: '┬', right: '┐' },
  mid: { left: '├', mid: '┼', right: '┤' },
  bottom: { left: '└', mid: '┴', right: '┘' },
}

function buildSeparator(widths, style) {
  const b = BORDERS[style]
  return b.left + widths.map((w) => '─'.repeat(w + 2)).join(b.mid) + b.right
}

function buildRow(cells, widths, align) {
  return (
    '│' +
    cells.map((c, i) => ' ' + pad(cellText(c), widths[i], align[i]) + ' ').join('│') +
    '│'
  )
}

async function main() {
  const raw = await readStdin()
  let data
  try {
    data = JSON.parse(raw)
  } catch (err) {
    fail('invalid JSON on stdin: ' + err.message)
    return
  }

  const problem = validate(data)
  if (problem) {
    fail(problem)
    return
  }

  const columns = data.columns
  const rows = data.rows
  const align = data.align || columns.map(() => 'left')
  const totals = data.totals

  const widths = columns.map((col, i) => {
    let w = col.length
    for (const row of rows) w = Math.max(w, cellText(row[i]).length)
    if (totals) w = Math.max(w, cellText(totals[i]).length)
    return w
  })

  const topSeparator = buildSeparator(widths, 'top')
  const midSeparator = buildSeparator(widths, 'mid')
  const bottomSeparator = buildSeparator(widths, 'bottom')
  const lines = []

  if (data.title) lines.push(data.title)
  lines.push(topSeparator)
  lines.push(buildRow(columns, widths, align))
  lines.push(midSeparator)
  for (const row of rows) lines.push(buildRow(row, widths, align))
  if (totals) {
    lines.push(midSeparator)
    lines.push(buildRow(totals, widths, align))
  }
  lines.push(bottomSeparator)

  process.stdout.write(lines.join('\n') + '\n')
}

main()
