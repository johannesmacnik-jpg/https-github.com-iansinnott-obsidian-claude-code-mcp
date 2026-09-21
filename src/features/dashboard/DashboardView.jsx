import { useCollection } from '../../lib/useCollection'

const today = () => new Date().toISOString().slice(0, 10)

export default function DashboardView({ onNavigate }) {
  const { items: workouts } = useCollection('workouts')
  const { items: meals } = useCollection('meals')
  const { items: tasks } = useCollection('tasks')

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

  return (
    <section className="view">
      <h1>Übersicht</h1>

      <div className="stat-grid">
        <button className="card stat" onClick={() => onNavigate('fitness')}>
          <span className="stat-label">Workouts diese Woche</span>
          <span className="stat-value">{workoutsThisWeek}</span>
        </button>
        <button className="card stat" onClick={() => onNavigate('nutrition')}>
          <span className="stat-label">Kalorien heute</span>
          <span className="stat-value">{todaysCalories}</span>
        </button>
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
    </section>
  )
}
