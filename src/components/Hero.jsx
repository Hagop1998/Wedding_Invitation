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
  const playerContainerRef = useRef(null)
  const playerReadyRef = useRef(false)
  const wantsSoundRef = useRef(false)
  const [musicReady, setMusicReady] = useState(false)
  const [musicPlaying, setMusicPlaying] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(weddingDate))
    }, 1000)

    return () => clearInterval(timer)
  }, [weddingDate])

  useEffect(() => {
    if (!youtubeVideoId || !playerContainerRef.current) return undefined

    let cancelled = false

    function tryPlayWithSound() {
      const player = playerRef.current
      const { YT } = window

      if (!playerReadyRef.current || !player?.playVideo || !YT) {
        return false
      }

      // Must run synchronously inside a tap/click handler on Android Chrome.
      player.unMute()
      player.setVolume(100)
      player.playVideo()

      const state = player.getPlayerState?.()
      const isActive =
        state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING

      if (isActive || !player.isMuted?.()) {
        setMusicPlaying(true)
        return true
      }

      return false
    }

    function onUserInteraction() {
      wantsSoundRef.current = true
      tryPlayWithSound()
    }

    loadYouTubeApi().then((YT) => {
      if (cancelled || !playerContainerRef.current) return

      playerRef.current = new YT.Player(playerContainerRef.current, {
        height: '200',
        width: '200',
        videoId: youtubeVideoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          loop: 1,
          mute: 1,
          origin: window.location.origin,
          playlist: youtubeVideoId,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            playerReadyRef.current = true
            setMusicReady(true)
            event.target.mute()
            event.target.playVideo()
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              setMusicPlaying(!event.target.isMuted?.())
            }
          },
        },
      })
    })

    document.addEventListener('touchstart', onUserInteraction, { passive: true })
    document.addEventListener('click', onUserInteraction)
    document.addEventListener('keydown', onUserInteraction)

    return () => {
      cancelled = true
      playerReadyRef.current = false
      wantsSoundRef.current = false
      document.removeEventListener('touchstart', onUserInteraction)
      document.removeEventListener('click', onUserInteraction)
      document.removeEventListener('keydown', onUserInteraction)
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

  function handleMusicToggle() {
    wantsSoundRef.current = true
    const player = playerRef.current
    const { YT } = window

    if (musicPlaying) {
      player?.mute?.()
      setMusicPlaying(false)
      return
    }

    if (!playerReadyRef.current || !player?.playVideo || !YT) {
      return
    }

    player.unMute()
    player.setVolume(100)
    player.playVideo()

    const state = player.getPlayerState?.()
    const isActive =
      state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING

    if (isActive || !player.isMuted?.()) {
      setMusicPlaying(true)
    }
  }

  return (
    <section className="hero">
      {youtubeVideoId && (
        <button
          type="button"
          className={`hero__music-btn${musicPlaying ? ' hero__music-btn--playing' : ''}`}
          onClick={handleMusicToggle}
          aria-label={musicPlaying ? 'Mute wedding music' : 'Play wedding music'}
          aria-pressed={musicPlaying}
          disabled={!musicReady}
          title={musicReady ? (musicPlaying ? 'Mute music' : 'Play music') : 'Loading music…'}
        >
          ♪
        </button>
      )}

      <div className="hero__photo-wrap">
        <img className="hero__photo" src={heroImage} alt={`${groom} and ${bride}`} />

        <div className="hero__overlay">
          <p className="hero__label">{heroLabel[language]}</p>
          <img className="hero__logo" src={heroLogo} alt="" aria-hidden="true" />
        </div>

        <div className="hero__bottom">
          <p className="hero__names">
            {groom} & {bride}
          </p>
          <p className="hero__tagline">{heroTagline[language]}</p>
        </div>

        <div className="hero__photo-fade" aria-hidden="true" />
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

      {youtubeVideoId && (
        <div ref={playerContainerRef} className="hero__youtube-player" aria-hidden="true" />
      )}
    </section>
  )
}
