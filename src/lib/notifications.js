// Erinnerungen beim Öffnen der App - kein echtes Hintergrund-Push (das würde
// einen eigenen Server brauchen), sondern eine Browser-Notification, wenn du
// die App öffnest und etwas fällig/überfällig ist.

export function isSupported() {
  return typeof Notification !== 'undefined'
}

export function getPermission() {
  return isSupported() ? Notification.permission : 'unsupported'
}

export async function requestPermission() {
  if (!isSupported()) return 'unsupported'
  return Notification.requestPermission()
}

export function notifyDueTasks(tasks) {
  if (!isSupported() || Notification.permission !== 'granted') return

  const today = new Date().toISOString().slice(0, 10)
  const due = tasks.filter((t) => !t.done && t.dueDate <= today)
  if (due.length === 0) return

  const body = due.length === 1 ? `Fällig: ${due[0].title}` : `${due.length} Erinnerungen fällig oder überfällig`

  new Notification('Life Tracker', { body, icon: './pwa-192.png' })
}
