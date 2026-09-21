import { useState } from 'react'
import CalendarMonth from '../../components/CalendarMonth'
import { confirmDelete } from '../../lib/confirmDelete'
import { getPermission, requestPermission } from '../../lib/notifications'
import { useCollection } from '../../lib/useCollection'

const TYPES = ['Prüfung', 'Abgabe', 'Lernsession', 'Sonstiges']
const today = () => new Date().toISOString().slice(0, 10)
const emptyForm = { title: '', type: TYPES[0], dueDate: today(), recurring: false }

function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function StudyView() {
  const { items, add, update, remove } = useCollection('tasks')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [notifPerm, setNotifPerm] = useState(getPermission())
  const [viewMode, setViewMode] = useState('list')
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })
  const [selectedDate, setSelectedDate] = useState(null)

  function changeMonth(delta) {
    setCalendarMonth((prev) => {
      const next = new Date(prev)
      next.setMonth(next.getMonth() + delta)
      return next
    })
  }

  const markedDates = new Set(items.map((t) => t.dueDate))

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    const payload = {
      title: form.title.trim(),
      type: form.type,
      dueDate: form.dueDate,
      recurring: form.recurring,
    }
    if (editingId) {
      update(editingId, payload)
      setEditingId(null)
    } else {
      add({ ...payload, done: false })
    }
    setForm(emptyForm)
  }

  function startEdit(t) {
    setForm({ title: t.title, type: t.type, dueDate: t.dueDate, recurring: !!t.recurring })
    setEditingId(t.id)
  }

  function cancelEdit() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function handleDoneChange(t, done) {
    update(t.id, { done })
    if (done && t.recurring) {
      add({ title: t.title, type: t.type, dueDate: addDays(t.dueDate, 7), recurring: true, done: false })
    }
  }

  const sorted = [...items]
    .filter((t) => !selectedDate || t.dueDate === selectedDate)
    .sort((a, b) => {
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

      <div className="segmented" style={{ marginBottom: '0.6rem' }}>
        <button type="button" className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
          Liste
        </button>
        <button
          type="button"
          className={viewMode === 'calendar' ? 'active' : ''}
          onClick={() => setViewMode('calendar')}
        >
          Kalender
        </button>
      </div>

      {viewMode === 'calendar' && (
        <CalendarMonth
          month={calendarMonth}
          markedDates={markedDates}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onChangeMonth={changeMonth}
        />
      )}
      {selectedDate && (
        <p className="empty" style={{ marginBottom: '0.6rem' }}>
          Zeige Erinnerungen für {selectedDate} ·{' '}
          <span style={{ color: 'var(--accent-text)', cursor: 'pointer' }} onClick={() => setSelectedDate(null)}>
            Alle anzeigen
          </span>
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
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.recurring}
            onChange={(e) => setForm({ ...form, recurring: e.target.checked })}
          />
          <span>Wiederholt sich wöchentlich</span>
        </label>
        <div className="form-row">
          <button type="submit">{editingId ? 'Erinnerung aktualisieren' : 'Erinnerung hinzufügen'}</button>
          {editingId && (
            <button type="button" className="secondary-btn" onClick={cancelEdit}>
              Abbrechen
            </button>
          )}
        </div>
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
                  onChange={(e) => handleDoneChange(t, e.target.checked)}
                />
                <div onClick={() => startEdit(t)} style={{ cursor: 'pointer' }}>
                  <strong>{t.title}</strong>
                  <div className={`meta ${overdue ? 'overdue' : ''}`}>
                    {t.type} · fällig {t.dueDate}
                    {overdue ? ' · überfällig' : ''}
                    {t.recurring ? ' · 🔁 wöchentlich' : ''}
                  </div>
                </div>
              </label>
              <button
                className="icon-btn"
                onClick={() => {
                  if (confirmDelete(t.title)) remove(t.id)
                }}
                aria-label="Löschen"
              >
                ✕
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
