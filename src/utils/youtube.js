let youtubeApiPromise = null

export function getYouTubeVideoId(urlOrId) {
  if (!urlOrId) return null

  if (!urlOrId.includes('youtube') && !urlOrId.includes('youtu.be')) {
    return urlOrId
  }

  try {
    const url = new URL(urlOrId)
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.replace('/', '') || null
    }
    return url.searchParams.get('v')
  } catch {
    return urlOrId
  }
}

export function loadYouTubeApi() {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT)
  }

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const previousReady = window.onYouTubeIframeAPIReady

      window.onYouTubeIframeAPIReady = () => {
        previousReady?.()
        resolve(window.YT)
      }

      if (!document.getElementById('youtube-iframe-api')) {
        const tag = document.createElement('script')
        tag.id = 'youtube-iframe-api'
        tag.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(tag)
      } else {
        const poll = setInterval(() => {
          if (window.YT?.Player) {
            clearInterval(poll)
            resolve(window.YT)
          }
        }, 50)
        setTimeout(() => clearInterval(poll), 10000)
      }
    })
  }

  return youtubeApiPromise
}
