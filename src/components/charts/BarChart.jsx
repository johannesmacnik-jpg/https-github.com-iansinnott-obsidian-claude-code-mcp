import { useState } from 'react'
import {
  CHART_HEIGHT,
  CHART_WIDTH,
  PAD_LEFT,
  PAD_RIGHT,
  PAD_TOP,
  PLOT_HEIGHT,
  PLOT_WIDTH,
  niceCeil,
  roundedTopRectPath,
} from './chartMath'

// Balkendiagramm für eine einzelne Zeitreihe (z.B. Workouts pro Woche).
// data: [{ label, value }], älteste zuerst.
export default function BarChart({ title, data, color, formatValue = (v) => v }) {
  const [hoverIndex, setHoverIndex] = useState(null)

  const values = data.map((d) => d.value)
  const yMax = niceCeil(Math.max(...values, 1))
  const slot = PLOT_WIDTH / data.length
  const barWidth = Math.min(24, slot * 0.6)

  const yFor = (v) => PAD_TOP + PLOT_HEIGHT - (v / yMax) * PLOT_HEIGHT

  const active = data[hoverIndex ?? data.length - 1]

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>{title}</h3>
        <span className="chart-active-value">
          {formatValue(active.value)}
          <span className="chart-active-label"> · {active.label}</span>
        </span>
      </div>
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="chart-svg">
        {[0, 0.5, 1].map((t) => {
          const y = PAD_TOP + PLOT_HEIGHT * (1 - t)
          return (
            <g key={t}>
              <line x1={PAD_LEFT} x2={CHART_WIDTH - PAD_RIGHT} y1={y} y2={y} className="chart-gridline" />
              <text x={PAD_LEFT - 5} y={y + 3} className="chart-axis-label" textAnchor="end">
                {Math.round(yMax * t)}
              </text>
            </g>
          )
        })}

        {data.map((d, i) => {
          const x = PAD_LEFT + slot * i + (slot - barWidth) / 2
          const y = yFor(d.value)
          const height = PAD_TOP + PLOT_HEIGHT - y
          const isActive = i === (hoverIndex ?? data.length - 1)
          return (
            <g
              key={i}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              onTouchStart={() => setHoverIndex(i)}
            >
              {/* großzügige unsichtbare Trefferfläche für Hover/Tap */}
              <rect x={PAD_LEFT + slot * i} y={PAD_TOP} width={slot} height={PLOT_HEIGHT} fill="transparent" />
              <path d={roundedTopRectPath(x, y, barWidth, height)} fill={color} opacity={isActive ? 1 : 0.55} />
            </g>
          )
        })}

        {data.map((d, i) => (
          <text
            key={i}
            x={PAD_LEFT + slot * i + slot / 2}
            y={CHART_HEIGHT - 4}
            textAnchor="middle"
            className="chart-axis-label"
          >
            {i % 2 === 0 ? d.label : ''}
          </text>
        ))}
      </svg>
    </div>
  )
}
