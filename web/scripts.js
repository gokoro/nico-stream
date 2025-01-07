function decodeParams(params) {
  const url = new URLSearchParams(params)
  const payload = {}

  url.forEach((v, k) => (payload[k] = v))

  return payload
}

function openPlayerPage(payload) {
  const video = document.querySelector('video')

  attachHls(video, payload)
}

function attachHls(video, payload) {
  if (!Hls.isSupported()) {
    return
  }

  const src = payload.m3u8

  const hls = new Hls()

  hls.loadSource(src)
  hls.attachMedia(video)

  if ('mediaSession' in navigator) {
    const defaultSkipTime = 10

    navigator.mediaSession.metadata = new MediaMetadata({
      title: payload.title,
      artist: payload.artist,
    })

    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      const skipTime = details.seekOffset || defaultSkipTime
      video.currentTime = Math.max(video.currentTime - skipTime, 0)
    })

    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      const skipTime = details.seekOffset || defaultSkipTime
      video.currentTime = Math.min(video.currentTime + skipTime, video.duration)
    })

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.fastSeek && 'fastSeek' in video) {
        // Only use fast seek if supported.
        video.fastSeek(details.seekTime)
        return
      }
      video.currentTime = details.seekTime
      // TODO: Update playback state.
    })
  }
}

function initializePlayer() {
  const params = location.hash.slice(1)
  const payload = decodeParams(params)

  openPlayerPage(payload)
}

navigator.mediaSession.setActionHandler('nexttrack', null)
navigator.mediaSession.setActionHandler('previoustrack', null)

addEventListener('load', initializePlayer)
