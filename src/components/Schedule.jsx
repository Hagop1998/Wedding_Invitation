import churchIcon from '../assets/Church.svg'
import cheersIcon from '../assets/cheers.svg'
import { weddingConfig } from '../config/wedding'

const scheduleIcons = {
  church: churchIcon,
  cheers: cheersIcon,
}

function ScheduleIcon({ type }) {
  const src = scheduleIcons[type]

  if (!src) {
    return null
  }

  return <img className="schedule__icon" src={src} alt="" aria-hidden="true" />
}

function PhotoRow({ images, className = '' }) {
  if (images.length === 1) {
    return (
      <div className={`photo-row photo-row--single ${className}`}>
        <div className="photo-row__frame">
          <img src={images[0]} alt="" aria-hidden="true" />
        </div>
      </div>
    )
  }

  return (
    <div className={`photo-row photo-row--triple ${className}`}>
      <img className="photo-row__side" src={images[0]} alt="" aria-hidden="true" />
      <img className="photo-row__center" src={images[1]} alt="" aria-hidden="true" />
      <img className="photo-row__side" src={images[2]} alt="" aria-hidden="true" />
    </div>
  )
}

export default function Schedule() {
  const { schedule } = weddingConfig
  const language = 'en'
  const mapButtonText = 'How to get there'

  return (
    <section className="section schedule">
      <div className="schedule__events">
        {schedule.map((item) => (
          <article key={item.title.hy} className="schedule__event">
            <ScheduleIcon type={item.icon} />

            <h3 className="schedule__event-title">{item.title[language]}</h3>
            <p className="schedule__time">{item.time}</p>
            <p className="schedule__venue">{item.venue[language]}</p>
            {item.venueSub?.[language] && <p className="schedule__venue-sub">{item.venueSub[language]}</p>}
            <p className="schedule__address">{item.address[language]}</p>
            <a className="schedule__map-btn" href={item.mapUrl} target="_blank" rel="noreferrer">
              {mapButtonText}
            </a>
            <PhotoRow images={item.images} className="schedule__event-gallery" />
          </article>
        ))}
      </div>
    </section>
  )
}
