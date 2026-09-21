// Einfache Datenschicht über localStorage.
// Jede "collection" (z.B. "workouts") wird als eigener Key gespeichert.
// Später kann man diese Funktionen 1:1 durch API-Aufrufe ersetzen, ohne
// dass sich die Views (Fitness/Ernährung/Studium) ändern müssen.

const PREFIX = 'life-tracker:'

function readCollection(collection) {
  try {
    const raw = localStorage.getItem(PREFIX + collection)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeCollection(collection, items) {
  localStorage.setItem(PREFIX + collection, JSON.stringify(items))
}

export function list(collection) {
  return readCollection(collection)
}

export function addItem(collection, item) {
  const items = readCollection(collection)
  const newItem = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...item,
  }
  writeCollection(collection, [newItem, ...items])
  return newItem
}

export function updateItem(collection, id, patch) {
  const items = readCollection(collection)
  const updated = items.map((item) => (item.id === id ? { ...item, ...patch } : item))
  writeCollection(collection, updated)
}

export function removeItem(collection, id) {
  const items = readCollection(collection)
  writeCollection(
    collection,
    items.filter((item) => item.id !== id),
  )
}
