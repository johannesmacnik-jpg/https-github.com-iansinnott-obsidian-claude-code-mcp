import BarChart from '../../components/charts/BarChart'
import LineChart from '../../components/charts/LineChart'
import { formatShort, lastNDays, lastNWeeks } from '../../lib/dateBuckets'
import { useCollection } from '../../lib/useCollection'

// Farben aus dem validierten Kategorial-Set (Dark-Mode-Stufen), konsistent
// pro Metrik: Kalorien immer blau, Workouts immer orange.
const CALORIES_COLOR = '#3987e5'
const WORKOUTS_COLOR = '#d95926'

export default function ProgressView() {
  const { items: meals } = useCollection('meals')
  const { items: workouts } = useCollection('workouts')

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
    </section>
  )
}
