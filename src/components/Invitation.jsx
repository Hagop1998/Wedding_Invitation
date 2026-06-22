import { useEffect, useState } from 'react'
import { weddingConfig } from '../config/wedding'
import { useReveal } from '../hooks/useReveal'

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

function pad(value) {
  return String(value).padStart(2, '0')
}

export default function Invitation() {
  const { invitationText, countdownTitle, weddingDate, invitationPhotos } = weddingConfig
  const language = 'en'
  const [sectionRef, isVisible] = useReveal()
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(weddingDate))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(weddingDate))
    }, 1000)

    return () => clearInterval(timer)
  }, [weddingDate])

  const units = [
    { label: 'day', value: String(timeLeft.days) },
    { label: 'hour', value: pad(timeLeft.hours) },
    { label: 'minute', value: pad(timeLeft.minutes) },
    { label: 'second', value: pad(timeLeft.seconds) },
  ]

  return (
    <section
      ref={sectionRef}
      className={`section invitation${isVisible ? ' invitation--revealed' : ''}`}
    >
      <div className="invitation__content">
        <p className="invitation__quote">{invitationText.quote[language]}</p>
        <p className="invitation__citation">{invitationText.citation[language]}</p>

        <div className="invitation__countdown">
          <h2 className="invitation__countdown-title">{countdownTitle[language]}</h2>
          <div className="invitation__countdown-grid">
            {units.map((unit, index) => (
              <div key={unit.label} className="invitation__countdown-unit">
                <strong>{unit.value}</strong>
                <span>{unit.label}</span>
                {index < units.length - 1 && (
                  <span className="invitation__countdown-divider" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="invitation__photos">
        <div className="invitation__photo-wrap invitation__photo-wrap--left">
          <img
            className="invitation__photo"
            src={invitationPhotos.left}
            alt=""
            aria-hidden="true"
          />
        </div>
        <div className="invitation__photo-wrap invitation__photo-wrap--right">
          <img
            className="invitation__photo"
            src={invitationPhotos.right}
            alt=""
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  )
}
