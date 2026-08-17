#!/usr/bin/env node
'use strict'

// Renders a bordered ASCII table with labeled row groups from a JSON payload on stdin.
// Schema:
// {
//   "title": "optional string",
//   "columns": ["Item","Qty","Price"],
//   "groups": [
//     {"label": "Produce", "rows": [["Apples","10","$5"]], "subtotal": ["","","$32"]},
//     {"label": "Dairy", "rows": [["Milk","4","$12"]], "subtotal": ["","","$12"]}
//   ],
//   "grandTotal": ["","","$120"]   // optional
// }

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
  if (!Array.isArray(data.groups)) {
    return 'groups is required and must be an array'
  }
  const n = data.columns.length
  for (let gi = 0; gi < data.groups.length; gi++) {
    const group = data.groups[gi]
    if (typeof group !== 'object' || group === null || Array.isArray(group)) {
      return `group ${gi} must be an object`
    }
    if (typeof group.label !== 'string' || group.label.length === 0) {
      return `group ${gi} is missing a non-empty "label" string`
    }
    if (!Array.isArray(group.rows)) {
      return `group ${gi} is missing a "rows" array`
    }
    for (let ri = 0; ri < group.rows.length; ri++) {
      if (!Array.isArray(group.rows[ri])) {
        return `group ${gi} row ${ri} must be an array`
      }
      if (group.rows[ri].length !== n) {
        return `group ${gi} row ${ri} has ${group.rows[ri].length} cells, expected ${n} (columns.length)`
      }
    }
    if (group.subtotal !== undefined) {
      if (!Array.isArray(group.subtotal) || group.subtotal.length !== n) {
        return `group ${gi} subtotal must be an array with ${n} entries (columns.length)`
      }
    }
  }
  if (data.grandTotal !== undefined) {
    if (!Array.isArray(data.grandTotal) || data.grandTotal.length !== n) {
      return `grandTotal must be an array with ${n} entries (columns.length)`
    }
  }
  return null
}

function pad(text, width) {
  const diff = width - text.length
  if (diff <= 0) return text
  return text + ' '.repeat(diff)
}

// Single-line box-drawing borders. Every internal divider (after the
// header, before/after each group label, before a subtotal, before the
// grand total) shares the same mid-row junction style; only the very top
// and very bottom rows use their own corner glyphs.
const BORDERS = {
  top: { left: '┌', mid: '┬', right: '┐' },
  mid: { left: '├', mid: '┼', right: '┤' },
  bottom: { left: '└', mid: '┴', right: '┘' },
}

function buildSeparator(widths, style) {
  const b = BORDERS[style]
  return b.left + widths.map((w) => '─'.repeat(w + 2)).join(b.mid) + b.right
}

function buildRow(cells, widths) {
  return '│' + cells.map((c, i) => ' ' + pad(cellText(c), widths[i]) + ' ').join('│') + '│'
}

function subtotalCells(subtotal) {
  const cells = subtotal.map(cellText)
  cells[0] = cells[0] ? '~ ' + cells[0] : '~'
  return cells
}

function main() {
  readStdin().then((raw) => {
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
    const groups = data.groups
    const grandTotal = data.grandTotal

    const widths = columns.map((col, i) => {
      let w = col.length
      for (const group of groups) {
        for (const row of group.rows) w = Math.max(w, cellText(row[i]).length)
        if (group.subtotal) w = Math.max(w, subtotalCells(group.subtotal)[i].length)
      }
      if (grandTotal) w = Math.max(w, cellText(grandTotal[i]).length)
      return w
    })

    // A group label spans the full table width, padded like a normal cell
    // (one leading and one trailing space). Widen the last column, if
    // needed, so the widest label still fits without breaking alignment.
    let innerWidth = buildSeparator(widths, 'mid').length - 2
    const maxLabelLen = groups.reduce((m, g) => Math.max(m, g.label.length), 0)
    const neededInnerWidth = maxLabelLen + 2
    if (neededInnerWidth > innerWidth) {
      widths[widths.length - 1] += neededInnerWidth - innerWidth
      innerWidth = buildSeparator(widths, 'mid').length - 2
    }

    const topSeparator = buildSeparator(widths, 'top')
    const midSeparator = buildSeparator(widths, 'mid')
    const bottomSeparator = buildSeparator(widths, 'bottom')

    const lines = []
    if (data.title) lines.push(data.title)
    lines.push(topSeparator)
    lines.push(buildRow(columns, widths))
    lines.push(midSeparator)

    groups.forEach((group, gi) => {
      lines.push('│' + ' ' + pad(group.label, innerWidth - 2) + ' ' + '│')
      lines.push(midSeparator)
      for (const row of group.rows) lines.push(buildRow(row, widths))
      if (group.subtotal) {
        lines.push(midSeparator)
        lines.push(buildRow(subtotalCells(group.subtotal), widths))
      }
      if (gi < groups.length - 1) lines.push(midSeparator)
    })

    if (grandTotal) {
      lines.push(midSeparator)
      lines.push(buildRow(grandTotal, widths))
      lines.push(bottomSeparator)
    } else {
      lines.push(bottomSeparator)
    }

    process.stdout.write(lines.join('\n') + '\n')
  })
}

main()
