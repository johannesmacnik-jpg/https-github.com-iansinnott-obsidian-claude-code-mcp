import { useState } from 'react'
import { CHART_HEIGHT, CHART_WIDTH, PAD_LEFT, PAD_RIGHT, PAD_TOP, PLOT_HEIGHT, PLOT_WIDTH, niceCeil } from './chartMath'

// Liniendiagramm für eine einzelne Zeitreihe (z.B. Kalorien pro Tag).
// data: [{ label, value }], älteste zuerst.
// zeroBased=true (Standard) für Mengen, die bei 0 sinnvoll starten (Kalorien).
// zeroBased=false zoomt auf den tatsächlichen Wertebereich - wichtig für Werte
// wie Gewicht, wo die kleine Veränderung die eigentliche Geschichte ist.
export default function LineChart({ title, data, color, formatValue = (v) => v, zeroBased = true, axisFormat }) {
  const [hoverIndex, setHoverIndex] = useState(null)

  const values = data.map((d) => d.value)
  let yMin, yMax
  if (zeroBased) {
    yMin = 0
    yMax = niceCeil(Math.max(...values, 1))
  } else {
    const rawMin = Math.min(...values)
    const rawMax = Math.max(...values)
    const span = rawMax - rawMin
    const pad = span === 0 ? Math.max(rawMax * 0.05, 1) : span * 0.25
    yMin = rawMin - pad
    yMax = rawMax + pad
  }
  const formatTick = axisFormat ?? Math.round

  const xFor = (i) => PAD_LEFT + (i / (data.length - 1 || 1)) * PLOT_WIDTH
  const yFor = (v) => PAD_TOP + PLOT_HEIGHT - ((v - yMin) / (yMax - yMin || 1)) * PLOT_HEIGHT

  const linePoints = data.map((d, i) => `${xFor(i)},${yFor(d.value)}`).join(' ')
  const areaBaseline = yFor(yMin)
  const areaPoints = `${xFor(0)},${areaBaseline} ${linePoints} ${xFor(data.length - 1)},${areaBaseline}`

  function handlePointer(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const relX = ((clientX - rect.left) / rect.width) * CHART_WIDTH
    let closest = 0
    let closestDist = Infinity
    data.forEach((_, i) => {
      const dist = Math.abs(xFor(i) - relX)
      if (dist < closestDist) {
        closestDist = dist
        closest = i
      }
    })
    setHoverIndex(closest)
  }

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
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="chart-svg"
        onMouseMove={handlePointer}
        onMouseLeave={() => setHoverIndex(null)}
        onTouchMove={handlePointer}
        onTouchEnd={() => setHoverIndex(null)}
      >
        {[0, 0.5, 1].map((t) => {
          const y = PAD_TOP + PLOT_HEIGHT * (1 - t)
          return (
            <g key={t}>
              <line x1={PAD_LEFT} x2={CHART_WIDTH - PAD_RIGHT} y1={y} y2={y} className="chart-gridline" />
              <text x={PAD_LEFT - 5} y={y + 3} className="chart-axis-label" textAnchor="end">
                {formatTick(yMin + (yMax - yMin) * t)}
              </text>
            </g>
          )
        })}

        <polygon points={areaPoints} fill={color} opacity="0.1" />
        <polyline
          points={linePoints}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {hoverIndex !== null && (
          <line
            x1={xFor(hoverIndex)}
            x2={xFor(hoverIndex)}
            y1={PAD_TOP}
            y2={PAD_TOP + PLOT_HEIGHT}
            className="chart-crosshair"
          />
        )}

        {data.map((d, i) => {
          const isEnd = i === data.length - 1
          const isHover = i === hoverIndex
          if (!isEnd && !isHover) return null
          return <circle key={i} cx={xFor(i)} cy={yFor(d.value)} r="4" fill={color} className="chart-marker" />
        })}

        {[0, Math.floor((data.length - 1) / 2), data.length - 1].map((i, idx) => (
          <text
            key={idx}
            x={xFor(i)}
            y={CHART_HEIGHT - 4}
            textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}
            className="chart-axis-label"
          >
            {data[i].label}
          </text>
        ))}
      </svg>
    </div>
  )
}
