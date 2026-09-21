import { Suspense, lazy, useState } from 'react'
import { confirmDelete } from '../../lib/confirmDelete'
import { lookupProductByBarcode } from '../../lib/openFoodFacts'
import { ACTIVITY_LEVELS, GOALS, computeTarget, computeTdee } from '../../lib/tdee'
import { useCollection } from '../../lib/useCollection'
import { useGoals } from '../../lib/useGoals'
import { useTdeeInputs } from '../../lib/useTdeeInputs'

// Lazy geladen, weil html5-qrcode recht groß ist - soll nicht den
// normalen App-Start verlangsamen, nur wenn der Scanner wirklich genutzt wird.
const BarcodeScanner = lazy(() => import('../../components/BarcodeScanner'))

const today = () => new Date().toISOString().slice(0, 10)
const emptyForm = { name: '', calories: '', protein: '', carbs: '', fat: '', date: today(), autoCalc: true }

function caloriesFromMacros(protein, carbs, fat) {
  return Math.round((Number(protein) || 0) * 4 + (Number(carbs) || 0) * 4 + (Number(fat) || 0) * 9)
}

export default function NutritionView() {
  const { items, add, update, remove } = useCollection('meals')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const { values: tdee, setValues: setTdee } = useTdeeInputs()
  const { setGoals } = useGoals()
  const [goalApplied, setGoalApplied] = useState(false)

  const [showScanner, setShowScanner] = useState(false)
  const [manualBarcode, setManualBarcode] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState(null)
  const [lookupResult, setLookupResult] = useState(null)
  const [amountGrams, setAmountGrams] = useState('100')

  async function runLookup(barcode) {
    setShowScanner(false)
    setLookupLoading(true)
    setLookupError(null)
    setLookupResult(null)
    try {
      const product = await lookupProductByBarcode(barcode)
      if (!product) {
        setLookupError('Produkt nicht gefunden. Manuell eintragen oder anderen Barcode versuchen.')
      } else {
        setLookupResult(product)
        setAmountGrams('100')
      }
    } catch {
      setLookupError('Abfrage fehlgeschlagen – prüf deine Internetverbindung.')
    } finally {
      setLookupLoading(false)
    }
  }

  function applyLookupResult() {
    if (!lookupResult) return
    const factor = (Number(amountGrams) || 0) / 100
    setForm({
      ...form,
      name: lookupResult.name,
      calories: String(Math.round(lookupResult.kcal100 * factor)),
      protein: String(Math.round(lookupResult.protein100 * factor)),
      carbs: String(Math.round(lookupResult.carbs100 * factor)),
      fat: String(Math.round(lookupResult.fat100 * factor)),
      autoCalc: false,
    })
    setLookupResult(null)
    setManualBarcode('')
  }

  const hasTdeeInputs = tdee.weight && tdee.height && tdee.age
  const tdeeValue = hasTdeeInputs ? Math.round(computeTdee(tdee)) : null
  const targetValue = hasTdeeInputs ? computeTarget(tdee) : null

  function applyTargetAsGoal() {
    if (targetValue == null) return
    setGoals({ dailyCalories: targetValue })
    setGoalApplied(true)
    setTimeout(() => setGoalApplied(false), 2000)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    const payload = {
      name: form.name.trim(),
      calories: form.autoCalc ? caloriesFromMacros(form.protein, form.carbs, form.fat) : Number(form.calories) || 0,
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
      autoCalc: false,
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
      autoCalc: false,
    })
  }

  return (
    <section className="view">
      <h1>Ernährung</h1>

      <div className="card stat">
        <span className="stat-label">Heute</span>
        <span className="stat-value">{todaysTotal} kcal</span>
      </div>

      {showScanner && (
        <Suspense fallback={<div className="scanner-overlay" />}>
          <BarcodeScanner onScan={runLookup} onClose={() => setShowScanner(false)} />
        </Suspense>
      )}

      <div className="card">
        <div className="form-row" style={{ marginBottom: '0.5rem' }}>
          <button type="button" className="secondary-btn" onClick={() => setShowScanner(true)}>
            📷 Barcode scannen
          </button>
        </div>
        <div className="form-row">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Barcode manuell eingeben"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
          />
          <button
            type="button"
            className="secondary-btn"
            onClick={() => manualBarcode.trim() && runLookup(manualBarcode.trim())}
          >
            Suchen
          </button>
        </div>

        {lookupLoading && <p className="empty" style={{ marginTop: '0.6rem' }}>Suche Produkt …</p>}
        {lookupError && (
          <p className="empty" style={{ marginTop: '0.6rem', color: 'var(--danger)' }}>
            {lookupError}
          </p>
        )}
        {lookupResult && (
          <div className="card lookup-card" style={{ marginTop: '0.6rem' }}>
            <strong>{lookupResult.name}</strong>
            <div className="meta" style={{ marginBottom: '0.5rem' }}>
              pro 100g: {lookupResult.kcal100} kcal · {lookupResult.protein100}g Protein · {lookupResult.carbs100}g KH
              · {lookupResult.fat100}g Fett
            </div>
            <div className="form-row" style={{ marginBottom: '0.5rem' }}>
              <input
                type="number"
                min="0"
                placeholder="Menge (g)"
                value={amountGrams}
                onChange={(e) => setAmountGrams(e.target.value)}
              />
            </div>
            <div className="chart-active-value" style={{ marginBottom: '0.5rem' }}>
              {Math.round(lookupResult.kcal100 * ((Number(amountGrams) || 0) / 100))} kcal für {amountGrams || 0}g
            </div>
            <button
              type="button"
              className="secondary-btn"
              style={{ width: '100%', background: 'var(--accent)', color: '#0f172a', fontWeight: 600 }}
              onClick={applyLookupResult}
            >
              Ins Formular übernehmen
            </button>
          </div>
        )}
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
            value={form.autoCalc ? caloriesFromMacros(form.protein, form.carbs, form.fat) : form.calories}
            disabled={form.autoCalc}
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
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.autoCalc}
            onChange={(e) => setForm({ ...form, autoCalc: e.target.checked })}
          />
          <span>Kalorien automatisch aus Makros berechnen (4 kcal/g Protein & KH, 9 kcal/g Fett)</span>
        </label>
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

      <h2>Kalorienbedarf-Rechner</h2>
      <div className="card">
        <div className="segmented" style={{ marginBottom: '0.6rem' }}>
          <button
            type="button"
            className={tdee.gender === 'm' ? 'active' : ''}
            onClick={() => setTdee({ gender: 'm' })}
          >
            Männlich
          </button>
          <button
            type="button"
            className={tdee.gender === 'w' ? 'active' : ''}
            onClick={() => setTdee({ gender: 'w' })}
          >
            Weiblich
          </button>
        </div>
        <div className="form-row" style={{ marginBottom: '0.5rem' }}>
          <input
            type="number"
            min="0"
            placeholder="Gewicht (kg)"
            value={tdee.weight}
            onChange={(e) => setTdee({ weight: e.target.value })}
          />
          <input
            type="number"
            min="0"
            placeholder="Größe (cm)"
            value={tdee.height}
            onChange={(e) => setTdee({ height: e.target.value })}
          />
          <input
            type="number"
            min="0"
            placeholder="Alter"
            value={tdee.age}
            onChange={(e) => setTdee({ age: e.target.value })}
          />
        </div>
        <select
          value={tdee.activity}
          onChange={(e) => setTdee({ activity: e.target.value })}
          style={{ marginBottom: '0.5rem' }}
        >
          {ACTIVITY_LEVELS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
        <select value={tdee.goal} onChange={(e) => setTdee({ goal: e.target.value })}>
          {GOALS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>

        {hasTdeeInputs ? (
          <>
            <div className="progress-caption" style={{ marginTop: '0.7rem' }}>
              Erhaltungsbedarf (TDEE): {tdeeValue} kcal
            </div>
            <div className="chart-active-value" style={{ margin: '0.2rem 0 0.7rem' }}>
              Kalorienziel: {targetValue} kcal
            </div>
            <button type="button" className="secondary-btn" style={{ width: '100%' }} onClick={applyTargetAsGoal}>
              {goalApplied ? '✓ Als Tagesziel übernommen' : 'Als Tagesziel übernehmen'}
            </button>
          </>
        ) : (
          <p className="empty" style={{ marginTop: '0.7rem' }}>
            Gewicht, Größe und Alter eintragen, um deinen Kalorienbedarf zu sehen.
          </p>
        )}
      </div>

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
