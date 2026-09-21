import { useState } from 'react'
import BarChart from '../../components/charts/BarChart'
import LineChart from '../../components/charts/LineChart'
import { formatShort, lastNDays, lastNWeeks } from '../../lib/dateBuckets'
import { useCollection } from '../../lib/useCollection'

// Farben aus dem validierten Kategorial-Set (Dark-Mode-Stufen), konsistent
// pro Metrik: Kalorien immer blau, Workouts immer orange, Gewicht aqua.
const CALORIES_COLOR = '#3987e5'
const WORKOUTS_COLOR = '#d95926'
const WEIGHT_COLOR = '#199e70'

const today = () => new Date().toISOString().slice(0, 10)

export default function ProgressView() {
  const { items: meals } = useCollection('meals')
  const { items: workouts } = useCollection('workouts')
  const { items: bodyMetrics, add: addBodyMetric, remove: removeBodyMetric } = useCollection('bodyMetrics')

  const [weightForm, setWeightForm] = useState({ date: today(), weight: '' })

  const days = lastNDays(14)
  const caloriesData = days.map((date) => ({
    label: formatShort(date),
    value: meals.filter((m) => m.date === date).reduce((sum, m) => sum + m.calories, 0),
  }))

  const weeks = lastNWeeks(8)
  const workoutsData = weeks.map((w) => ({
    label: formatShort(w.end),
    value: workouts.filter((wo) => wo.date >= w.start && wo.date <= w.end).length,
  }))

  const weightHistory = [...bodyMetrics].sort((a, b) => a.date.localeCompare(b.date)).slice(-20)
  const weightData = weightHistory.map((m) => ({ label: formatShort(m.date), value: m.weight }))
  const recentWeightEntries = [...bodyMetrics].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  function handleWeightSubmit(e) {
    e.preventDefault()
    const weight = Number(weightForm.weight)
    if (!weight) return
    addBodyMetric({ date: weightForm.date, weight })
    setWeightForm({ date: today(), weight: '' })
  }

  return (
    <section className="view">
      <h1>Fortschritt</h1>

      {meals.length === 0 ? (
        <div className="card empty-chart">
          <p className="empty">Noch keine Mahlzeiten eingetragen – trag ein paar in "Ernährung" ein, dann siehst du hier deinen Kalorienverlauf.</p>
        </div>
      ) : (
        <LineChart title="Kalorien · letzte 14 Tage" data={caloriesData} color={CALORIES_COLOR} formatValue={(v) => `${v} kcal`} />
      )}

      {workouts.length === 0 ? (
        <div className="card empty-chart">
          <p className="empty">Noch keine Workouts eingetragen – trag welche in "Fitness" ein, dann siehst du hier deinen Trainings-Rhythmus.</p>
        </div>
      ) : (
        <BarChart title="Workouts · letzte 8 Wochen" data={workoutsData} color={WORKOUTS_COLOR} formatValue={(v) => `${v} Workout${v === 1 ? '' : 's'}`} />
      )}

      <h2>Körperwerte</h2>

      <form className="card form" onSubmit={handleWeightSubmit}>
        <div className="form-row">
          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="Gewicht (kg)"
            value={weightForm.weight}
            onChange={(e) => setWeightForm({ ...weightForm, weight: e.target.value })}
          />
          <input
            type="date"
            value={weightForm.date}
            onChange={(e) => setWeightForm({ ...weightForm, date: e.target.value })}
          />
        </div>
        <button type="submit">Gewicht eintragen</button>
      </form>

      {bodyMetrics.length === 0 ? (
        <div className="card empty-chart">
          <p className="empty">Noch keine Gewichtseinträge – trag oben dein aktuelles Gewicht ein, dann siehst du hier den Verlauf.</p>
        </div>
      ) : (
        <>
          <LineChart
            title="Gewicht"
            data={weightData}
            color={WEIGHT_COLOR}
            formatValue={(v) => `${v} kg`}
            zeroBased={false}
            axisFormat={(v) => v.toFixed(1)}
          />
          <ul className="list">
            {recentWeightEntries.map((m) => (
              <li key={m.id} className="card list-item">
                <div>
                  <strong>{m.weight} kg</strong>
                  <div className="meta">{m.date}</div>
                </div>
                <button className="icon-btn" onClick={() => removeBodyMetric(m.id)} aria-label="Löschen">
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
