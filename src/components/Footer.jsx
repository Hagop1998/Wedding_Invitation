import { weddingConfig } from '../config/wedding'

export default function Footer() {
  const language = 'en'
  return (
    <footer className="footer">
      <p className="footer__text">{weddingConfig.footerText[language]}</p>
    </footer>
  )
}
