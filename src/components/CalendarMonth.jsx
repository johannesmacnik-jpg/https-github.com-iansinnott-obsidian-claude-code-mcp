const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const MONTH_NAMES = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
]

function isoDate(d) {
  return d.toISOString().slice(0, 10)
}

// month: Date auf den 1. des anzuzeigenden Monats.
// markedDates: Set von ISO-Datums-Strings, die einen Punkt bekommen.
export default function CalendarMonth({ month, markedDates, selectedDate, onSelectDate, onChangeMonth }) {
  const year = month.getFullYear()
  const m = month.getMonth()
  const firstOfMonth = new Date(year, m, 1)
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7 // Montag = 0
  const daysInMonth = new Date(year, m + 1, 0).getDate()
  const todayStr = isoDate(new Date())

  const cells = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(day)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button type="button" className="icon-btn" onClick={() => onChangeMonth(-1)} aria-label="Vorheriger Monat">
          ‹
        </button>
        <strong>
          {MONTH_NAMES[m]} {year}
        </strong>
        <button type="button" className="icon-btn" onClick={() => onChangeMonth(1)} aria-label="Nächster Monat">
          ›
        </button>
      </div>
      <div className="calendar-grid calendar-weekdays">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="calendar-grid">
        {cells.map((day, i) => {
          if (day === null) return <span key={i} />
          const dateStr = isoDate(new Date(year, m, day))
          const isSelected = dateStr === selectedDate
          const isToday = dateStr === todayStr
          const hasMark = markedDates.has(dateStr)
          return (
            <button
              type="button"
              key={i}
              className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
            >
              {day}
              {hasMark && <span className="calendar-dot" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
