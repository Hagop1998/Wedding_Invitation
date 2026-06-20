import { useEffect, useState } from 'react'
import { weddingConfig } from '../config/wedding'
import './GiftCardCover.css'

export default function GiftCardCover({ onOpen }) {
  const [phase, setPhase] = useState('idle')

  useEffect(() => {
    document.body.classList.add('gift-card-locked')

    return () => {
      document.body.classList.remove('gift-card-locked')
    }
  }, [])

  function handleOpen() {
    if (phase !== 'idle') {
      return
    }

    setPhase('opening')

    window.setTimeout(() => {
      onOpen()
    }, 1400)
  }

  return (
    <div
      className={`gift-cover${phase === 'opening' ? ' gift-cover--opening' : ''}`}
      role="button"
      tabIndex={0}
      aria-label="Open wedding invitation"
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleOpen()
        }
      }}
    >
      <div className="gift-cover__silk" aria-hidden="true">
        <div className="gift-cover__silk-fold gift-cover__silk-fold--one" />
        <div className="gift-cover__silk-fold gift-cover__silk-fold--two" />
        <div className="gift-cover__silk-fold gift-cover__silk-fold--three" />
      </div>

      <div className="gift-envelope-wrap">
        <div className="gift-envelope">
          <div className="gift-envelope__shadow" aria-hidden="true" />

          <div className="gift-envelope__body">
            <div className="gift-envelope__side gift-envelope__side--left" aria-hidden="true" />
            <div className="gift-envelope__side gift-envelope__side--right" aria-hidden="true" />
            <div className="gift-envelope__bottom" aria-hidden="true" />
          </div>

          <div className="gift-envelope__flap">
            <p className="gift-envelope__title">{weddingConfig.coverTitle}</p>
          </div>

          <div className="gift-envelope__seal" aria-hidden="true">
            <span className="gift-envelope__seal-disc" />
          </div>
        </div>
      </div>

      <p className="gift-cover__hint">Սեղմեք բացելու համար</p>
    </div>
  )
}
