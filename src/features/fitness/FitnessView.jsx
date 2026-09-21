import { useState } from 'react'
import { confirmDelete } from '../../lib/confirmDelete'
import { formatDuration } from '../../lib/format'
import { useCollection } from '../../lib/useCollection'

const today = () => new Date().toISOString().slice(0, 10)
const SPORTS = ['Fußball', 'Laufen', 'Radfahren', 'Schwimmen', 'Sonstiges']

const emptyForm = {
  type: 'kraft',
  exercise: '',
  sets: '',
  reps: '',
  weight: '',
  sport: SPORTS[0],
  sportCustom: '',
  hours: '',
  minutes: '',
  date: today(),
}

export default function FitnessView() {
  const { items, add, update, remove } = useCollection('workouts')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [historyFilter, setHistoryFilter] = useState('all')

  const exerciseNames = []
  const seenNames = new Set()
  for (const w of items) {
    if (!seenNames.has(w.exercise)) {
      seenNames.add(w.exercise)
      exerciseNames.push(w.exercise)
    }
  }
  const filteredItems = historyFilter === 'all' ? items : items.filter((w) => w.exercise === historyFilter)

  const recentExercises = []
  const seenExercises = new Set()
  for (const w of items) {
    if (w.type === 'ausdauer') continue
    if (!seenExercises.has(w.exercise)) {
      seenExercises.add(w.exercise)
      recentExercises.push(w)
    }
    if (recentExercises.length >= 5) break
  }

  const personalBests = {}
  for (const w of items) {
    if (w.type === 'ausdauer') continue
    if (!personalBests[w.exercise] || w.weight > personalBests[w.exercise].weight) {
      personalBests[w.exercise] = w
    }
  }
  const bestsList = Object.values(personalBests)
    .filter((w) => w.weight > 0)
    .sort((a, b) => b.date.localeCompare(a.date))

  function applyRecentExercise(w) {
    setForm({
      ...form,
      type: 'kraft',
      exercise: w.exercise,
      sets: String(w.sets),
      reps: String(w.reps),
      weight: String(w.weight),
    })
  }

  function startEdit(w) {
    if (w.type === 'ausdauer') {
      const isKnownSport = SPORTS.slice(0, -1).includes(w.exercise)
      setForm({
        ...emptyForm,
        type: 'ausdauer',
        sport: isKnownSport ? w.exercise : 'Sonstiges',
        sportCustom: isKnownSport ? '' : w.exercise,
        hours: String(Math.floor(w.durationMin / 60)),
        minutes: String(w.durationMin % 60),
        date: w.date,
      })
    } else {
      setForm({
        ...emptyForm,
        type: 'kraft',
        exercise: w.exercise,
        sets: String(w.sets),
        reps: String(w.reps),
        weight: String(w.weight),
        date: w.date,
      })
    }
    setEditingId(w.id)
  }

  function cancelEdit() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function handleSubmit(e) {
    e.preventDefault()

    let payload
    if (form.type === 'kraft') {
      if (!form.exercise.trim()) return
      payload = {
        type: 'kraft',
        exercise: form.exercise.trim(),
        sets: Number(form.sets) || 0,
        reps: Number(form.reps) || 0,
        weight: Number(form.weight) || 0,
        date: form.date,
      }
    } else {
      const exercise = form.sport === 'Sonstiges' ? form.sportCustom.trim() : form.sport
      const durationMin = (Number(form.hours) || 0) * 60 + (Number(form.minutes) || 0)
      if (!exercise || durationMin <= 0) return
      payload = { type: 'ausdauer', exercise, durationMin, date: form.date }
    }

    if (editingId) {
      update(editingId, payload)
      setEditingId(null)
      setForm(emptyForm)
    } else {
      add(payload)
      setForm({ ...emptyForm, type: form.type, date: today() })
    }
  }

  return (
    <section className="view">
      <h1>Fitness</h1>

      <form className="card form" onSubmit={handleSubmit}>
        <div className="segmented">
          <button
            type="button"
            className={form.type === 'kraft' ? 'active' : ''}
            onClick={() => setForm({ ...form, type: 'kraft' })}
          >
            Krafttraining
          </button>
          <button
            type="button"
            className={form.type === 'ausdauer' ? 'active' : ''}
            onClick={() => setForm({ ...form, type: 'ausdauer' })}
          >
            Ausdauer/Sport
          </button>
        </div>

        {form.type === 'kraft' ? (
          <>
            {recentExercises.length > 0 && (
              <div className="chip-row">
                {recentExercises.map((w) => (
                  <button type="button" key={w.id} className="chip" onClick={() => applyRecentExercise(w)}>
                    {w.exercise}
                  </button>
                ))}
              </div>
            )}
            <input
              placeholder="Übung (z.B. Bankdrücken)"
              value={form.exercise}
              onChange={(e) => setForm({ ...form, exercise: e.target.value })}
            />
            <div className="form-row">
              <input
                type="number"
                min="0"
                placeholder="Sätze"
                value={form.sets}
                onChange={(e) => setForm({ ...form, sets: e.target.value })}
              />
              <input
                type="number"
                min="0"
                placeholder="Wdh."
                value={form.reps}
                onChange={(e) => setForm({ ...form, reps: e.target.value })}
              />
              <input
                type="number"
                min="0"
                placeholder="Gewicht (kg)"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
              />
            </div>
          </>
        ) : (
          <>
            <select value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })}>
              {SPORTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {form.sport === 'Sonstiges' && (
              <input
                placeholder="Sportart"
                value={form.sportCustom}
                onChange={(e) => setForm({ ...form, sportCustom: e.target.value })}
              />
            )}
            <div className="form-row">
              <input
                type="number"
                min="0"
                placeholder="Stunden"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
              />
              <input
                type="number"
                min="0"
                max="59"
                placeholder="Minuten"
                value={form.minutes}
                onChange={(e) => setForm({ ...form, minutes: e.target.value })}
              />
            </div>
          </>
        )}

        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />

        <div className="form-row">
          <button type="submit">{editingId ? 'Workout aktualisieren' : 'Workout eintragen'}</button>
          {editingId && (
            <button type="button" className="secondary-btn" onClick={cancelEdit}>
              Abbrechen
            </button>
          )}
        </div>
      </form>

      {bestsList.length > 0 && (
        <>
          <h2>Bestleistungen</h2>
          <ul className="list">
            {bestsList.map((w) => (
              <li key={w.exercise} className="card list-item">
                <div>
                  <strong>{w.exercise}</strong>
                  <div className="meta">🏆 {w.weight}kg · {w.sets}×{w.reps} · {w.date}</div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>Verlauf</h2>
      {exerciseNames.length > 1 && (
        <select
          value={historyFilter}
          onChange={(e) => setHistoryFilter(e.target.value)}
          style={{ marginBottom: '0.6rem' }}
        >
          <option value="all">Alle Übungen</option>
          {exerciseNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      )}
      <ul className="list">
        {items.length === 0 && <p className="empty">Noch keine Workouts eingetragen.</p>}
        {items.length > 0 && filteredItems.length === 0 && (
          <p className="empty">Keine Einträge für diese Übung.</p>
        )}
        {filteredItems.map((w) => (
          <li key={w.id} className="card list-item">
            <div onClick={() => startEdit(w)} style={{ cursor: 'pointer', flex: 1 }}>
              <strong>{w.exercise}</strong>
              <div className="meta">
                {w.date} ·{' '}
                {w.type === 'ausdauer' ? formatDuration(w.durationMin) : `${w.sets}×${w.reps} @ ${w.weight}kg`}
              </div>
            </div>
            <button
              className="icon-btn"
              onClick={(e) => {
                e.stopPropagation()
                if (confirmDelete(w.exercise)) remove(w.id)
              }}
              aria-label="Löschen"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
