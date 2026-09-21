export const CHART_WIDTH = 320
export const CHART_HEIGHT = 150
export const PAD_LEFT = 30
export const PAD_RIGHT = 8
export const PAD_TOP = 10
export const PAD_BOTTOM = 18

export const PLOT_WIDTH = CHART_WIDTH - PAD_LEFT - PAD_RIGHT
export const PLOT_HEIGHT = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM

// Rundet auf eine "schöne" Achsen-Obergrenze (1/2/5 * 10^n), z.B. 340 -> 500.
export function niceCeil(value) {
  if (value <= 0) return 1
  const exponent = Math.floor(Math.log10(value))
  const base = 10 ** exponent
  const fraction = value / base
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10
  return niceFraction * base
}

// Pfad für ein Rechteck mit abgerundeten oberen Ecken, eckig an der Baseline
// (Balken-Spec: 4px rounded data-end, square at the baseline).
export function roundedTopRectPath(x, y, width, height, radius = 4) {
  if (height <= 0) return ''
  const r = Math.min(radius, width / 2, height)
  return `M${x},${y + height} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height} Z`
}
