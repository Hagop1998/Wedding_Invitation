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
    heroTagline,
    displayDate,
    youtubeMusic,
  } = weddingConfig
  const youtubeVideoId = getYouTubeVideoId(youtubeMusic)
  const playerRef = useRef(null)
  const playerContainerRef = useRef(null)
  const playerReadyRef = useRef(false)
  const wantsSoundRef = useRef(false)
  const [musicReady, setMusicReady] = useState(false)
  const [musicPlaying, setMusicPlaying] = useState(false)

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
          {/* <p className="hero__label">{heroLabel[language]}</p> */}
        </div>

        <div className="hero__bottom">
          <p className="hero__names">
            {groom} & {bride}
          </p>
          {/* <p className="hero__tagline">{heroTagline[language]}</p> */}
        </div>

        <div className="hero__photo-fade" aria-hidden="true" />
      </div>

      <div className="hero__countdown">
        <p className="hero__wedding-date">{displayDate}</p>
      </div>

      {youtubeVideoId && (
        <div ref={playerContainerRef} className="hero__youtube-player" aria-hidden="true" />
      )}
    </section>
  )
}
