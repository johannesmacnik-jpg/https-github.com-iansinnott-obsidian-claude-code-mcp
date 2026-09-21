import { useState } from 'react'
import { useCollection } from '../../lib/useCollection'

const today = () => new Date().toISOString().slice(0, 10)

export default function FitnessView() {
  const { items, add, remove } = useCollection('workouts')
  const [form, setForm] = useState({
    exercise: '',
    sets: '',
    reps: '',
    weight: '',
    date: today(),
  })

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.exercise.trim()) return
    add({
      exercise: form.exercise.trim(),
      sets: Number(form.sets) || 0,
      reps: Number(form.reps) || 0,
      weight: Number(form.weight) || 0,
      date: form.date,
    })
    setForm({ exercise: '', sets: '', reps: '', weight: '', date: today() })
  }

  return (
    <section className="view">
      <h1>Fitness</h1>

      <form className="card form" onSubmit={handleSubmit}>
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
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <button type="submit">Workout eintragen</button>
      </form>

      <ul className="list">
        {items.length === 0 && <p className="empty">Noch keine Workouts eingetragen.</p>}
        {items.map((w) => (
          <li key={w.id} className="card list-item">
            <div>
              <strong>{w.exercise}</strong>
              <div className="meta">
                {w.date} · {w.sets}×{w.reps} @ {w.weight}kg
              </div>
            </div>
            <button className="icon-btn" onClick={() => remove(w.id)} aria-label="Löschen">
              ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
