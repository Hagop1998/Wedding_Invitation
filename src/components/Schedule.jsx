import { weddingConfig } from '../config/wedding'

function ScheduleIcon({ type }) {
  if (type === 'champagne') {
    return (
      <svg className="schedule__icon" viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M18 8h28l-6 22H24L18 8zm14 28v18M24 54h16M30 26h4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M22 14h20M24 20h16" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      </svg>
    )
  }

  return (
    <svg className="schedule__icon" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="24" cy="36" r="12" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="40" cy="36" r="12" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M30 28c0-6 2-10 6-10s6 4 6 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M32 18v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
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
      {/* <h2 className="section__title">Օրվա ծրագիրը</h2>

      <PhotoRow images={scheduleGallery} className="schedule__intro-gallery" /> */}

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
