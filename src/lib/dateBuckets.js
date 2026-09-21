// Kleine Helfer um Tages-/Wochen-"Buckets" für Charts zu bauen,
// z.B. "die letzten 14 Tage" oder "die letzten 8 Wochen".

function isoDate(d) {
  return d.toISOString().slice(0, 10)
}

function daysAgo(n) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - n)
  return d
}

export function formatShort(dateStr) {
  const [, m, d] = dateStr.split('-')
  return `${d}.${m}`
}

// Array von ISO-Datums-Strings, älteste zuerst, heute zuletzt.
export function lastNDays(n) {
  const days = []
  for (let i = n - 1; i >= 0; i--) days.push(isoDate(daysAgo(i)))
  return days
}

// Array von {start, end} ISO-Datums-Strings für rollierende 7-Tage-Wochen,
// älteste zuerst, aktuelle Woche zuletzt.
export function lastNWeeks(n) {
  const weeks = []
  for (let w = n - 1; w >= 0; w--) {
    weeks.push({
      start: isoDate(daysAgo(w * 7 + 6)),
      end: isoDate(daysAgo(w * 7)),
    })
  }
  return weeks
}

// Zählt aufeinanderfolgende Tage mit mindestens einem Eintrag, rückwärts
// von heute. Heute zählt nicht als "gebrochen", solange gestern noch
// vorhanden ist - so bricht die Serie nicht einfach weil du die App noch
// nicht geöffnet hast.
export function computeStreak(dates) {
  const dateSet = new Set(dates)
  let cursor = daysAgo(0)
  if (!dateSet.has(isoDate(cursor))) {
    cursor = daysAgo(1)
  }
  let streak = 0
  while (dateSet.has(isoDate(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
