import { useEffect, useRef, useState } from 'react'
import { weddingConfig } from '../config/wedding'
import { getYouTubeVideoId, loadYouTubeApi } from '../utils/youtube'

export default function Hero() {
  const {
    groom,
    bride,
    heroImage,
    heroLabel,
    heroLogo,
    heroLogoIos,
    displayDate,
    youtubeMusic,
  } = weddingConfig
  const youtubeVideoId = getYouTubeVideoId(youtubeMusic)
  const playerRef = useRef(null)
  const playerContainerRef = useRef(null)
  const playerReadyRef = useRef(false)
  const [musicReady, setMusicReady] = useState(false)
  const [musicPlaying, setMusicPlaying] = useState(false)

  useEffect(() => {
    if (!youtubeVideoId || !playerContainerRef.current) return undefined

    let cancelled = false

    loadYouTubeApi().then((YT) => {
      if (cancelled || !playerContainerRef.current) return

      playerRef.current = new YT.Player(playerContainerRef.current, {
        height: '200',
        width: '200',
        videoId: youtubeVideoId,
        playerVars: {
          autoplay: 0,
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
          onReady: () => {
            playerReadyRef.current = true
            setMusicReady(true)
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              setMusicPlaying(!event.target.isMuted?.())
            }

            if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
              setMusicPlaying(false)
            }
          },
        },
      })
    })

    return () => {
      cancelled = true
      playerReadyRef.current = false
      playerRef.current?.destroy?.()
      playerRef.current = null
    }
  }, [youtubeVideoId])

  const language = 'en'

  function handleMusicToggle() {
    const player = playerRef.current
    const { YT } = window

    if (musicPlaying) {
      player?.pauseVideo?.()
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
      <div className="hero__photo-wrap">
        <img className="hero__photo" src={heroImage} alt={`${groom} and ${bride}`} />

        <div className="hero__overlay">
          <p className="hero__label">{heroLabel[language]}</p>
          <img className="hero__logo hero__logo--default" src={heroLogo} alt="" aria-hidden="true" />
          <img className="hero__logo hero__logo--ios" src={heroLogoIos} alt="" aria-hidden="true" />
        </div>

        <div className="hero__bottom">
          <p className="hero__names">
            {groom} & {bride}
          </p>
        </div>

        <div className="hero__photo-fade" aria-hidden="true" />
      </div>

      <div className="hero__countdown">
        <div className="hero__date-row">
          {youtubeVideoId && (
            <button
              type="button"
              className={`hero__music-btn${musicPlaying ? ' hero__music-btn--playing' : ''}`}
              onClick={handleMusicToggle}
              aria-label={musicPlaying ? 'Pause wedding music' : 'Play wedding music'}
              aria-pressed={musicPlaying}
              disabled={!musicReady}
              title={musicReady ? (musicPlaying ? 'Pause music' : 'Play music') : 'Loading music…'}
            >
              {musicPlaying ? (
                <svg className="hero__music-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
                  <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
                </svg>
              ) : (
                <svg className="hero__music-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
                </svg>
              )}
            </button>
          )}
          <p className="hero__wedding-date">{displayDate}</p>
        </div>
      </div>

      {youtubeVideoId && (
        <div ref={playerContainerRef} className="hero__youtube-player" aria-hidden="true" />
      )}
    </section>
  )
}
