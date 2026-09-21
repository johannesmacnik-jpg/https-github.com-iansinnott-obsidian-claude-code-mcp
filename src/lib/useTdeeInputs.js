import { useCallback, useState } from 'react'

const KEY = 'life-tracker:tdee'
const DEFAULTS = { gender: 'm', weight: '', height: '', age: '', activity: '1.55', goal: '0' }

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

// Persistiert die Eingaben für den Kalorienbedarf-Rechner, damit man sie
// nicht jedes Mal neu eintippen muss.
export function useTdeeInputs() {
  const [values, setValuesState] = useState(read)

  const setValues = useCallback((patch) => {
    setValuesState((prev) => {
      const next = { ...prev, ...patch }
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  return { values, setValues }
}
