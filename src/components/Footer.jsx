import { weddingConfig } from '../config/wedding'

export default function Footer() {
  const language = 'en'
  const { footerText, contactNote, contactPhones } = weddingConfig

  return (
    <footer className="footer">
      <p className="footer__text">{footerText[language]}</p>
      <p className="footer__contact-note">{contactNote[language]}</p>
      <div className="footer__phones">
        {contactPhones.map(({ name, phone }) => (
          <a key={phone} className="footer__phone" href={`tel:${phone.replace(/\s/g, '')}`}>
            {name}: {phone}
          </a>
        ))}
      </div>
    </footer>
  )
}
