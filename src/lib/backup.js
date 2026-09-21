const PREFIX = 'life-tracker:'
const COLLECTIONS = ['workouts', 'meals', 'tasks', 'bodyMetrics']

// Lädt ein JSON-Backup aller Daten herunter (alle Collections + Ziele).
export function exportBackup() {
  const data = {}
  for (const c of COLLECTIONS) {
    data[c] = JSON.parse(localStorage.getItem(PREFIX + c) || '[]')
  }
  data.goals = JSON.parse(localStorage.getItem(PREFIX + 'goals') || 'null')

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `life-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Stellt Daten aus einer zuvor exportierten JSON-Datei wieder her.
// Überschreibt bestehende Daten für die enthaltenen Collections.
export async function importBackup(file) {
  const text = await file.text()
  const data = JSON.parse(text)

  for (const c of COLLECTIONS) {
    if (Array.isArray(data[c])) {
      localStorage.setItem(PREFIX + c, JSON.stringify(data[c]))
    }
  }
  if (data.goals) {
    localStorage.setItem(PREFIX + 'goals', JSON.stringify(data.goals))
  }
}
