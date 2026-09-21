import { useState } from 'react'
import TabBar from './components/TabBar'
import DashboardView from './features/dashboard/DashboardView'
import FitnessView from './features/fitness/FitnessView'
import NutritionView from './features/nutrition/NutritionView'
import StudyView from './features/study/StudyView'

const VIEWS = {
  dashboard: DashboardView,
  fitness: FitnessView,
  nutrition: NutritionView,
  study: StudyView,
}

export default function App() {
  const [active, setActive] = useState('dashboard')
  const ActiveView = VIEWS[active]

  return (
    <div className="app">
      <main className="app-content">
        <ActiveView onNavigate={setActive} />
      </main>
      <TabBar active={active} onChange={setActive} />
    </div>
  )
}
