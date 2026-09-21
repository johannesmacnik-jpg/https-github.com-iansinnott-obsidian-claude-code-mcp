import { useState } from 'react'
import { getPermission, requestPermission } from '../../lib/notifications'
import { useCollection } from '../../lib/useCollection'

const TYPES = ['Prüfung', 'Abgabe', 'Lernsession', 'Sonstiges']
const today = () => new Date().toISOString().slice(0, 10)

export default function StudyView() {
  const { items, add, update, remove } = useCollection('tasks')
  const [form, setForm] = useState({ title: '', type: TYPES[0], dueDate: today() })
  const [notifPerm, setNotifPerm] = useState(getPermission())

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    add({ title: form.title.trim(), type: form.type, dueDate: form.dueDate, done: false })
    setForm({ title: '', type: TYPES[0], dueDate: today() })
  }

  const sorted = [...items].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    return a.dueDate.localeCompare(b.dueDate)
  })

  return (
    <section className="view">
      <h1>Studium</h1>

      {notifPerm === 'default' && (
        <button
          type="button"
          className="secondary-btn"
          style={{ width: '100%', marginBottom: '0.6rem' }}
          onClick={async () => setNotifPerm(await requestPermission())}
        >
          🔔 Erinnerung beim Öffnen der App aktivieren
        </button>
      )}
      {notifPerm === 'denied' && (
        <p className="empty" style={{ marginBottom: '0.6rem' }}>
          Benachrichtigungen sind blockiert – in den Browser-Einstellungen für diese Seite erlauben, um erinnert zu
          werden.
        </p>
      )}

      <form className="card form" onSubmit={handleSubmit}>
        <input
          placeholder="Was steht an? (z.B. Anatomie-Klausur)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <div className="form-row">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
        </div>
        <button type="submit">Erinnerung hinzufügen</button>
      </form>

      <ul className="list">
        {sorted.length === 0 && <p className="empty">Noch keine Erinnerungen.</p>}
        {sorted.map((t) => {
          const overdue = !t.done && t.dueDate < today()
          return (
            <li key={t.id} className={`card list-item ${t.done ? 'done' : ''}`}>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={(e) => update(t.id, { done: e.target.checked })}
                />
                <div>
                  <strong>{t.title}</strong>
                  <div className={`meta ${overdue ? 'overdue' : ''}`}>
                    {t.type} · fällig {t.dueDate}
                    {overdue ? ' · überfällig' : ''}
                  </div>
                </div>
              </label>
              <button className="icon-btn" onClick={() => remove(t.id)} aria-label="Löschen">
                ✕
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
