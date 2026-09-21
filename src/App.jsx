import { useEffect, useState } from 'react'
import TabBar from './components/TabBar'
import DashboardView from './features/dashboard/DashboardView'
import FitnessView from './features/fitness/FitnessView'
import NutritionView from './features/nutrition/NutritionView'
import ProgressView from './features/progress/ProgressView'
import StudyView from './features/study/StudyView'
import { notifyDueTasks } from './lib/notifications'
import { list } from './lib/storage'

const VIEWS = {
  dashboard: DashboardView,
  fitness: FitnessView,
  nutrition: NutritionView,
  study: StudyView,
  progress: ProgressView,
}

export default function App() {
  const [active, setActive] = useState('dashboard')
  const ActiveView = VIEWS[active]

  useEffect(() => {
    notifyDueTasks(list('tasks'))
  }, [])

  return (
    <div className="app">
      <main className="app-content">
        <ActiveView onNavigate={setActive} />
      </main>
      <TabBar active={active} onChange={setActive} />
    </div>
  )
}
