// ==UserScript==
// @name         Nico-Stream
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Get stream of nico for free
// @author       You
// @match        https://nicochannel.jp/*
// @require      https://cdn.jsdelivr.net/npm/hls.js@1
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// @updateURL    https://raw.githubusercontent.com/gokoro/nico-stream/main/userscript.js
// @downloadURL  https://raw.githubusercontent.com/gokoro/nico-stream/main/userscript.js
// ==/UserScript==

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
  window.open(`https://nico-stream.vercel.app/#${m3u8}`)
}

;(function () {
  window.addEventListener('load', detectVideoPage)
  window.addEventListener('popstate', detectVideoPage)
})()
