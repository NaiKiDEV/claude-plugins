'use strict';

// Renders a vertical timeline from JSON on stdin. Zero dependencies.
// Schema: { title?: string, events: { date: string, label: string, time?: string }[] }
// events is rendered in the order given; it is never sorted.
// Consecutive events sharing the same date are grouped under one date heading;
// the input must already list same-day events back to back for that to apply.
// Glyphs: U+2502 (box drawings light vertical) for the spine,
// U+25CF (black circle) for the event marker. Both are single UTF-16 code units.

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function fail(message) {
  process.stderr.write(message + '\n');
  process.exit(1);
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

async function main() {
  const raw = await readStdin();
  if (raw.trim().length === 0) {
    fail('No input on stdin: expected a JSON object');
    return;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    fail('Invalid JSON on stdin: ' + err.message);
    return;
  }

  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    fail('Invalid input: root must be a JSON object');
    return;
  }
  if (data.title !== undefined && typeof data.title !== 'string') {
    fail('Invalid input: "title" must be a string');
    return;
  }
  if (!Array.isArray(data.events)) {
    fail('Invalid input: "events" must be an array');
    return;
  }

  for (let i = 0; i < data.events.length; i++) {
    const event = data.events[i];
    if (event === null || typeof event !== 'object' || Array.isArray(event)) {
      fail(`Invalid input: events[${i}] must be an object`);
      return;
    }
    if (typeof event.date !== 'string' || event.date.length === 0) {
      fail(`Invalid input: events[${i}].date must be a non-empty string`);
      return;
    }
    if (typeof event.label !== 'string' || event.label.length === 0) {
      fail(`Invalid input: events[${i}].label must be a non-empty string`);
      return;
    }
    if (event.time !== undefined && (typeof event.time !== 'string' || !TIME_RE.test(event.time))) {
      fail(`Invalid input: events[${i}].time must match HH:MM (24-hour), got ${JSON.stringify(event.time)}`);
      return;
    }
  }

  const lines = [];
  if (data.title) {
    lines.push(data.title);
    lines.push('');
  }

  if (data.events.length === 0) {
    lines.push('(no events)');
  } else {
    const dateWidth = Math.max(...data.events.map((event) => event.date.length));
    const blankDate = ' '.repeat(dateWidth);
    const spine = blankDate + '  │';
    data.events.forEach((event, i) => {
      const continuesDate = i > 0 && event.date === data.events[i - 1].date;
      const dateCol = continuesDate ? blankDate : event.date.padEnd(dateWidth);
      const timePart = event.time ? `${event.time}  ` : '';
      lines.push(`${dateCol}  ●-- ${timePart}${event.label}`);
      if (i < data.events.length - 1) {
        lines.push(spine);
      }
    });
  }

  process.stdout.write(lines.join('\n') + '\n');
}

main();
