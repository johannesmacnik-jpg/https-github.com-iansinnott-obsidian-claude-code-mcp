// Grobe Schätzung des Kalorienverbrauchs über MET-Werte (Metabolic
// Equivalent of Task) - Standardmethode: kcal = MET × Gewicht(kg) × Stunden.
// Bei Krafttraining gibt es keine erfasste Dauer, daher eine Faustregel:
// ~3 Minuten pro Satz (inkl. Pause).

const MET_VALUES = {
  kraft: 5,
  Fußball: 7,
  Laufen: 8.3,
  Radfahren: 7.5,
  Schwimmen: 7,
  Sonstiges: 6,
}

export function estimateCaloriesBurned(workout, weightKg) {
  if (!weightKg) return null

  let met
  let minutes
  if (workout.type === 'ausdauer') {
    met = MET_VALUES[workout.exercise] ?? MET_VALUES.Sonstiges
    minutes = workout.durationMin || 0
  } else {
    met = MET_VALUES.kraft
    minutes = Math.max(workout.sets || 0, 1) * 3
  }

  return Math.round(met * weightKg * (minutes / 60))
}
