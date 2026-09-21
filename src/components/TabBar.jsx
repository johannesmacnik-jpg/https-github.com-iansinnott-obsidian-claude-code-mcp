const TABS = [
  { id: 'dashboard', label: 'Übersicht', icon: '🏠' },
  { id: 'fitness', label: 'Fitness', icon: '💪' },
  { id: 'nutrition', label: 'Ernährung', icon: '🍎' },
  { id: 'study', label: 'Studium', icon: '📚' },
  { id: 'progress', label: 'Fortschritt', icon: '📈' },
]

export default function TabBar({ active, onChange }) {
  return (
    <nav className="tab-bar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`tab-btn ${active === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
