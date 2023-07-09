function createPlayerPage(m3u8) {
  const video = document.querySelector('video')

  attachHls(m3u8, video)
}

function attachHls(src, video) {
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoSrc
  } else if (Hls.isSupported()) {
    const hls = new Hls()

    hls.loadSource(src)
    hls.attachMedia(video)
  }
}

function initializePlayer() {
  const m3u8 = location.hash.replace('#', '')
  createPlayerPage(m3u8)
}

addEventListener('load', initializePlayer)
