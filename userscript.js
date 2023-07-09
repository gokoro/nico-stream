// ==UserScript==
// @name         Nico-Stream
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Get stream of nico for free
// @author       You
// @match        https://nicochannel.jp/*
// @require      https://cdn.jsdelivr.net/npm/hls.js@1
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// ==/UserScript==

const player = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Player</title>
    <style>
      body {
        background: #000;
      }
      video {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0px;
        right: 0px;
        bottom: 0px;
        left: 0px;
        margin: auto;
        max-height: 100%;
        max-width: 100%;
      }
    </style>
  </head>
  <body>
    <video controls></video>
  </body>
</html>
`

const createPayload = (data) => JSON.stringify(data)

async function getSession(id) {
  const url = `https://nfc-api.nicochannel.jp/fc/video_pages/${id}/session_ids`

  const res = await fetch(url, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      fc_use_device: 'null',
    },
    body: createPayload({}),
  })
  const { data } = await res.json()

  return data.session_id
}

async function getPlaylist(session) {
  const url = `https://hls-auth.cloud.stream.co.jp/auth/index.m3u8?session_id=${session}`

  const res = await fetch(url)
  const data = await res.text()

  return data
}

function parsePlaylistData(playlist) {
  return playlist.match(/https?:\/\/[^\s"]+/g)
}

async function openPrompt(contentID) {
  const session = await getSession(contentID)
  const playlist = await getPlaylist(session)

  const [m3u8] = parsePlaylistData(playlist)

  window.confirm('Are you sure to play this video stream in another window?')
    ? createPlayerPage(m3u8)
    : null
}

function detectVideoPage() {
  const components = window.location.href.split('/')

  const isVideo = components[4] === 'video'
  const contentID = components[5]

  if (isVideo && contentID) {
    openPrompt(contentID)
  }
}

function createPlayerPage(m3u8) {
  const externalWindow = window.open()

  externalWindow.document.write(player)
  externalWindow.document.title = m3u8

  const video = externalWindow.document.querySelector('video')

  attachHls(m3u8, video)
}

function attachHls(src, video) {
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoSrc
  } else if (Hls.isSupported()) {
    const hls = new Hls()

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play()
    })

    hls.loadSource(src)
    hls.attachMedia(video)
  }
}

;(function () {
  window.addEventListener('load', detectVideoPage)
  window.addEventListener('popstate', detectVideoPage)
})()
