import { useEffect, useRef, useState } from 'react'
import { weddingConfig } from '../config/wedding'
import { getYouTubeVideoId, loadYouTubeApi } from '../utils/youtube'

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

export default function Hero() {
  const {
    groom,
    bride,
    heroImage,
    heroLabel,
    heroLogo,
    heroTagline,
    countdownTitle,
    youtubeMusic,
    weddingDate,
  } = weddingConfig
  const youtubeVideoId = getYouTubeVideoId(youtubeMusic)
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(weddingDate))
  const playerRef = useRef(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(weddingDate))
    }, 1000)

    return () => clearInterval(timer)
  }, [weddingDate])

  useEffect(() => {
    if (!youtubeVideoId) return undefined

    let cancelled = false

    function startMusic() {
      const player = playerRef.current
      if (!player?.playVideo) return

      player.unMute?.()
      player.playVideo()
    }

    function onUserInteraction() {
      startMusic()
      document.removeEventListener('click', onUserInteraction)
      document.removeEventListener('touchstart', onUserInteraction)
    }

    loadYouTubeApi().then((YT) => {
      if (cancelled) return

      playerRef.current = new YT.Player('hero-youtube-player', {
        height: '0',
        width: '0',
        videoId: youtubeVideoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          loop: 1,
          mute: 1,
          playlist: youtubeVideoId,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            event.target.playVideo()
          },
        },
      })
    })

    document.addEventListener('click', onUserInteraction)
    document.addEventListener('touchstart', onUserInteraction)

    return () => {
      cancelled = true
      document.removeEventListener('click', onUserInteraction)
      document.removeEventListener('touchstart', onUserInteraction)
      playerRef.current?.destroy?.()
      playerRef.current = null
    }
  }, [youtubeVideoId])

  const language = 'en'
  const copy = {
    units: ['day', 'hour', 'minute', 'second'],
  }

  const units = [
    { label: copy.units[0], value: String(timeLeft.days) },
    { label: copy.units[1], value: pad(timeLeft.hours) },
    { label: copy.units[2], value: pad(timeLeft.minutes) },
    { label: copy.units[3], value: pad(timeLeft.seconds) },
  ]

  return (
    <section className="hero">
      <div className="hero__photo-wrap">
        <img className="hero__photo" src={heroImage} alt={`${groom} and ${bride}`} />

        <div className="hero__overlay">
          <p className="hero__label">{heroLabel[language]}</p>
          <img className="hero__logo" src={heroLogo} alt="" aria-hidden="true" />
        </div>

        <div className="hero__bottom">
          <div className="hero__caption">
            <p className="hero__names">
              {groom} & {bride}
            </p>
            <p className="hero__tagline">{heroTagline[language]}</p>
          </div>

          <div className="hero__countdown">
            <h1 className="hero__countdown-title">{countdownTitle[language]}</h1>
            <div className="hero__countdown-grid">
              {units.map((unit, index) => (
                <div key={unit.label} className="hero__countdown-unit">
                  <strong>{unit.value}</strong>
                  <span>{unit.label}</span>
                  {index < units.length - 1 && (
                    <span className="hero__countdown-divider" aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hero__photo-fade" aria-hidden="true" />
      </div>

      {youtubeVideoId && (
        <div id="hero-youtube-player" className="hero__youtube-player" aria-hidden="true" />
      )}
    </section>
  )
}
