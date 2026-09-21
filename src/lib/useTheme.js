import { useEffect, useState } from 'react'

const KEY = 'life-tracker:theme'

function read() {
  try {
    return localStorage.getItem(KEY) || 'dark'
  } catch {
    return 'dark'
  }
}

// Hell/Dunkel-Modus, persistiert im Browser. Wird auch in main.jsx beim
// Start einmal direkt gesetzt, damit die Seite nicht kurz im falschen
// Theme aufblitzt, bevor React geladen ist.
export function useTheme() {
  const [theme, setThemeState] = useState(read)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function setTheme(next) {
    setThemeState(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // localStorage kann in privaten Fenstern blockiert sein - Theme
      // funktioniert dann trotzdem, wird nur nicht gemerkt.
    }
  }

  return { theme, setTheme }
}
