import { useState } from 'react'
import { useCollection } from '../../lib/useCollection'

const today = () => new Date().toISOString().slice(0, 10)

export default function NutritionView() {
  const { items, add, remove } = useCollection('meals')
  const [form, setForm] = useState({
    name: '',
    calories: '',
    protein: '',
    date: today(),
  })

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    add({
      name: form.name.trim(),
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      date: form.date,
    })
    setForm({ name: '', calories: '', protein: '', date: today() })
  }

  const todaysTotal = items
    .filter((m) => m.date === today())
    .reduce((sum, m) => sum + m.calories, 0)

  return (
    <section className="view">
      <h1>Ernährung</h1>

      <div className="card stat">
        <span className="stat-label">Heute</span>
        <span className="stat-value">{todaysTotal} kcal</span>
      </div>

      <form className="card form" onSubmit={handleSubmit}>
        <input
          placeholder="Mahlzeit (z.B. Haferflocken mit Beeren)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <div className="form-row">
          <input
            type="number"
            min="0"
            placeholder="Kalorien"
            value={form.calories}
            onChange={(e) => setForm({ ...form, calories: e.target.value })}
          />
          <input
            type="number"
            min="0"
            placeholder="Protein (g)"
            value={form.protein}
            onChange={(e) => setForm({ ...form, protein: e.target.value })}
          />
        </div>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <button type="submit">Mahlzeit eintragen</button>
      </form>

      <ul className="list">
        {items.length === 0 && <p className="empty">Noch keine Mahlzeiten eingetragen.</p>}
        {items.map((m) => (
          <li key={m.id} className="card list-item">
            <div>
              <strong>{m.name}</strong>
              <div className="meta">
                {m.date} · {m.calories} kcal · {m.protein}g Protein
              </div>
            </div>
            <button className="icon-btn" onClick={() => remove(m.id)} aria-label="Löschen">
              ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
