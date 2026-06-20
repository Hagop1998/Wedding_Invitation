import { useEffect, useState } from 'react'
import { weddingConfig } from '../config/wedding'

function getTimeLeft(targetDate) {
  const diff = new Date(targetDate).getTime() - Date.now()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(weddingConfig.weddingDate))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(weddingConfig.weddingDate))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const units = [
    { label: 'օր', value: timeLeft.days },
    { label: 'ժամ', value: timeLeft.hours },
    { label: 'րոպե', value: timeLeft.minutes },
    { label: 'վայրկյան', value: timeLeft.seconds },
  ]

  return (
    <section className="section countdown">
      <h2 className="section__title">Հարսանիքին մնաց</h2>
      <div className="countdown__grid">
        {units.map((unit) => (
          <div key={unit.label} className="countdown__unit">
            <span className="countdown__value">{unit.value}</span>
            <span className="countdown__label">{unit.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
