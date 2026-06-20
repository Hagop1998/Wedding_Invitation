const WEEKDAYS = ['Երկ', 'Երք', 'Չրք', 'Հնգ', 'Ուրբ', 'Շբթ', 'Կիր']
const MONTHS = [
  'Հունվար',
  'Փետրվար',
  'Մարտ',
  'Ապրիլ',
  'Մայիս',
  'Հունիս',
  'Հուլիս',
  'Օգոստոս',
  'Սեպտեմբեր',
  'Հոկտեմբեր',
  'Նոյեմբեր',
  'Դեկտեմբեր',
]

export default function Calendar({ year, month, highlightDay }) {
  const firstDay = new Date(year, month - 1, 1).getDay()
  const offset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(year, month, 0).getDate()

  const cells = []
  for (let i = 0; i < offset; i += 1) {
    cells.push(null)
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day)
  }

  return (
    <section className="section calendar">
      <div className="calendar__grid">
        {WEEKDAYS.map((day) => (
          <span key={day} className="calendar__weekday">
            {day}
          </span>
        ))}
        {cells.map((day, index) =>
          day ? (
            <span
              key={`${day}-${index}`}
              className={`calendar__day${day === highlightDay ? ' calendar__day--active' : ''}`}
            >
              {day}
            </span>
          ) : (
            <span key={`empty-${index}`} className="calendar__day calendar__day--empty" />
          ),
        )}
      </div>
      <p className="calendar__month">
        {MONTHS[month - 1]} {year}
      </p>
    </section>
  )
}
