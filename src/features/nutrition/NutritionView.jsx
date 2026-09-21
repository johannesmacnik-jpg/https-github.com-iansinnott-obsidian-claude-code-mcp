import { useState } from 'react'
import { confirmDelete } from '../../lib/confirmDelete'
import { useCollection } from '../../lib/useCollection'

const today = () => new Date().toISOString().slice(0, 10)
const emptyForm = { name: '', calories: '', protein: '', carbs: '', fat: '', date: today() }

export default function NutritionView() {
  const { items, add, update, remove } = useCollection('meals')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    const payload = {
      name: form.name.trim(),
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
      date: form.date,
    }
    if (editingId) {
      update(editingId, payload)
      setEditingId(null)
    } else {
      add(payload)
    }
    setForm({ ...emptyForm, date: today() })
  }

  function startEdit(m) {
    setForm({
      name: m.name,
      calories: String(m.calories),
      protein: String(m.protein),
      carbs: String(m.carbs || 0),
      fat: String(m.fat || 0),
      date: m.date,
    })
    setEditingId(m.id)
  }

  function cancelEdit() {
    setForm({ ...emptyForm, date: today() })
    setEditingId(null)
  }

  const todaysTotal = items
    .filter((m) => m.date === today())
    .reduce((sum, m) => sum + m.calories, 0)

  const recentMeals = []
  const seenMeals = new Set()
  for (const m of items) {
    if (!seenMeals.has(m.name)) {
      seenMeals.add(m.name)
      recentMeals.push(m)
    }
    if (recentMeals.length >= 5) break
  }

  function applyRecentMeal(m) {
    setForm({
      ...form,
      name: m.name,
      calories: String(m.calories),
      protein: String(m.protein),
      carbs: String(m.carbs || 0),
      fat: String(m.fat || 0),
    })
  }

  return (
    <section className="view">
      <h1>Ernährung</h1>

      <div className="card stat">
        <span className="stat-label">Heute</span>
        <span className="stat-value">{todaysTotal} kcal</span>
      </div>

      <form className="card form" onSubmit={handleSubmit}>
        {recentMeals.length > 0 && (
          <div className="chip-row">
            {recentMeals.map((m) => (
              <button type="button" key={m.id} className="chip" onClick={() => applyRecentMeal(m)}>
                {m.name}
              </button>
            ))}
          </div>
        )}
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
        <div className="form-row">
          <input
            type="number"
            min="0"
            placeholder="Kohlenhydrate (g)"
            value={form.carbs}
            onChange={(e) => setForm({ ...form, carbs: e.target.value })}
          />
          <input
            type="number"
            min="0"
            placeholder="Fett (g)"
            value={form.fat}
            onChange={(e) => setForm({ ...form, fat: e.target.value })}
          />
        </div>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <div className="form-row">
          <button type="submit">{editingId ? 'Mahlzeit aktualisieren' : 'Mahlzeit eintragen'}</button>
          {editingId && (
            <button type="button" className="secondary-btn" onClick={cancelEdit}>
              Abbrechen
            </button>
          )}
        </div>
      </form>

      <ul className="list">
        {items.length === 0 && <p className="empty">Noch keine Mahlzeiten eingetragen.</p>}
        {items.map((m) => (
          <li key={m.id} className="card list-item">
            <div onClick={() => startEdit(m)} style={{ cursor: 'pointer', flex: 1 }}>
              <strong>{m.name}</strong>
              <div className="meta">
                {m.date} · {m.calories} kcal · {m.protein}g Protein
                {m.carbs ? ` · ${m.carbs}g KH` : ''}
                {m.fat ? ` · ${m.fat}g Fett` : ''}
              </div>
            </div>
            <button
              className="icon-btn"
              onClick={(e) => {
                e.stopPropagation()
                if (confirmDelete(m.name)) remove(m.id)
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
