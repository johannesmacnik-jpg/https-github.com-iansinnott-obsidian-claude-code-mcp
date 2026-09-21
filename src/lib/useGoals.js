import { useCallback, useState } from 'react'

const KEY = 'life-tracker:goals'
const DEFAULTS = { weeklyWorkouts: 3, dailyCalories: 2200 }

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

// Kleiner Hook für persönliche Ziele (Wochenziel Workouts, Tagesziel Kalorien).
export function useGoals() {
  const [goals, setGoalsState] = useState(read)

  const setGoals = useCallback((patch) => {
    setGoalsState((prev) => {
      const next = { ...prev, ...patch }
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { goals, setGoals }
}
