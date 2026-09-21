// Kalorienbedarf nach der Mifflin-St-Jeor-Formel (Standard, verlässlicher
// als die ältere Harris-Benedict-Formel).

export const ACTIVITY_LEVELS = [
  { value: '1.2', label: 'Sitzend (wenig/keine Bewegung)' },
  { value: '1.375', label: 'Leicht aktiv (1-3x Sport/Woche)' },
  { value: '1.55', label: 'Mäßig aktiv (3-5x Sport/Woche)' },
  { value: '1.725', label: 'Sehr aktiv (6-7x Sport/Woche)' },
  { value: '1.9', label: 'Extrem aktiv (körperliche Arbeit + Sport)' },
]

export const GOALS = [
  { value: '-500', label: 'Cut (Abnehmen)' },
  { value: '-250', label: 'Leichter Cut' },
  { value: '0', label: 'Erhalt' },
  { value: '250', label: 'Lean Bulk' },
  { value: '500', label: 'Bulk' },
]

export function computeBmr({ gender, weight, height, age }) {
  const w = Number(weight) || 0
  const h = Number(height) || 0
  const a = Number(age) || 0
  const base = 10 * w + 6.25 * h - 5 * a
  return gender === 'w' ? base - 161 : base + 5
}

export function computeTdee(inputs) {
  return computeBmr(inputs) * (Number(inputs.activity) || 1)
}

export function computeTarget(inputs) {
  return Math.round(computeTdee(inputs) + (Number(inputs.goal) || 0))
}
