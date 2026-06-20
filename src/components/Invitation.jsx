import { weddingConfig } from '../config/wedding'
import { useReveal } from '../hooks/useReveal'

export default function Invitation() {
  const { invitationText, displayDate, invitationPhotos } = weddingConfig
  const language = 'en'
  const [sectionRef, isVisible] = useReveal()

  return (
    <section
      ref={sectionRef}
      className={`section invitation${isVisible ? ' invitation--revealed' : ''}`}
    >
      <div className="invitation__content">
        <p className="invitation__greeting">{invitationText.greeting[language]}</p>
        <p className="invitation__body">{invitationText.body[language]}</p>
        <p className="invitation__date">{displayDate}</p>
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
