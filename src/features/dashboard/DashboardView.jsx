import { useRef } from 'react'
import ProgressBar from '../../components/ProgressBar'
import { exportBackup, importBackup } from '../../lib/backup'
import { lastNDays } from '../../lib/dateBuckets'
import { useCollection } from '../../lib/useCollection'
import { useGoals } from '../../lib/useGoals'

const today = () => new Date().toISOString().slice(0, 10)

export default function DashboardView({ onNavigate }) {
  const { items: workouts } = useCollection('workouts')
  const { items: meals } = useCollection('meals')
  const { items: tasks } = useCollection('tasks')
  const { goals, setGoals } = useGoals()
  const fileInputRef = useRef(null)

  const openTasks = tasks
    .filter((t) => !t.done)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3)

  const todaysCalories = meals
    .filter((m) => m.date === today())
    .reduce((sum, m) => sum + m.calories, 0)

  const now = Date.now()
  const workoutsThisWeek = workouts.filter((w) => {
    const diffDays = (now - new Date(w.date).getTime()) / 86400000
    return diffDays <= 7
  }).length

  const week = lastNDays(7)
  const caloriesThisWeek = week.reduce(
    (sum, date) => sum + meals.filter((m) => m.date === date).reduce((s, m) => s + m.calories, 0),
    0,
  )
  const avgCaloriesPerDay = Math.round(caloriesThisWeek / 7)
  const openTasksCount = tasks.filter((t) => !t.done).length

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleImportChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const ok = window.confirm('Das überschreibt deine aktuellen Daten in der App mit dem Backup. Fortfahren?')
    if (ok) {
      await importBackup(file)
      window.location.reload()
    }
    e.target.value = ''
  }

  return (
    <section className="view">
      <h1>Übersicht</h1>

      <div className="stat-grid">
        <button className="card stat" onClick={() => onNavigate('fitness')}>
          <span className="stat-label">Workouts diese Woche</span>
          <span className="stat-value">{workoutsThisWeek}</span>
        </button>
        <button className="card stat" onClick={() => onNavigate('study')}>
          <span className="stat-label">Offene Aufgaben</span>
          <span className="stat-value">{openTasksCount}</span>
        </button>
        <button className="card stat" onClick={() => onNavigate('nutrition')}>
          <span className="stat-label">Kalorien heute</span>
          <span className="stat-value">{todaysCalories}</span>
        </button>
        <button className="card stat" onClick={() => onNavigate('progress')}>
          <span className="stat-label">Ø kcal/Tag (7 Tage)</span>
          <span className="stat-value">{avgCaloriesPerDay}</span>
        </button>
      </div>

      <h2>Ziele</h2>
      <div className="card">
        <div className="goal-row">
          <span>Workouts pro Woche</span>
          <input
            type="number"
            min="0"
            className="goal-input"
            value={goals.weeklyWorkouts}
            onChange={(e) => setGoals({ weeklyWorkouts: Number(e.target.value) || 0 })}
          />
        </div>
        <ProgressBar value={workoutsThisWeek} max={goals.weeklyWorkouts} />
        <div className="progress-caption">
          {workoutsThisWeek} / {goals.weeklyWorkouts}
        </div>

        <div className="goal-row" style={{ marginTop: '0.7rem' }}>
          <span>Kalorien pro Tag</span>
          <input
            type="number"
            min="0"
            className="goal-input"
            value={goals.dailyCalories}
            onChange={(e) => setGoals({ dailyCalories: Number(e.target.value) || 0 })}
          />
        </div>
        <ProgressBar value={todaysCalories} max={goals.dailyCalories} color="#d95926" />
        <div className="progress-caption">
          {todaysCalories} / {goals.dailyCalories} kcal heute
        </div>
      </div>

      <h2>Nächste Termine</h2>
      {openTasks.length === 0 && <p className="empty">Keine offenen Erinnerungen 🎉</p>}
      <ul className="list">
        {openTasks.map((t) => {
          const overdue = t.dueDate < today()
          return (
            <li key={t.id} className="card list-item" onClick={() => onNavigate('study')}>
              <div>
                <strong>{t.title}</strong>
                <div className={`meta ${overdue ? 'overdue' : ''}`}>
                  {t.type} · fällig {t.dueDate}
                  {overdue ? ' · überfällig' : ''}
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <h2>Daten sichern</h2>
      <div className="card">
        <p className="empty" style={{ marginBottom: '0.7rem' }}>
          Alles wird nur in diesem Browser gespeichert. Regelmäßig sichern, falls du das Gerät wechselst oder
          Browser-Daten gelöscht werden.
        </p>
        <div className="form-row">
          <button type="button" className="secondary-btn" onClick={exportBackup}>
            Backup herunterladen
          </button>
          <button type="button" className="secondary-btn" onClick={handleImportClick}>
            Backup wiederherstellen
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleImportChange}
          style={{ display: 'none' }}
        />
      </div>
    </section>
  )
}
