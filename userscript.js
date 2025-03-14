// ==UserScript==
// @name         Nico-Stream
// @namespace    http://tampermonkey.net/
// @version      0.14
// @description  Get stream of nico for free
// @author       You
// @match        https://nicochannel.jp/*
// @match        https://dazbee-fc.com/*
// @match        https://canan8181.com/*
// @match        https://rnqq.jp/*
// @match        https://kemomimirefle.net/*
// @match        https://uise-official.com/*
// @match        https://nightmare-salon.com/*
// @match        https://muneatsu-fc.com/*
// @match        https://rizuna-official.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        GM.openInTab
// @grant        GM_info
// @updateURL    https://raw.githubusercontent.com/gokoro/nico-stream/main/userscript.js
// @downloadURL  https://raw.githubusercontent.com/gokoro/nico-stream/main/userscript.js
// ==/UserScript==

const LOCAL_PLAYER_ENDPOINT = 'http://127.0.0.1:5500/web'
const EXTERNAL_PLAYER_ENDPOINT = 'https://nico-stream.vercel.app'

function buildUrlParams(data) {
  const url = new URLSearchParams()

  for (const key in data) {
    url.set(key, data[key])
  }

  return url
}

function isLocal() {
  return GM_info.scriptWillUpdate
}

function getPlayerEndpoint() {
  return isLocal() ? LOCAL_PLAYER_ENDPOINT : EXTERNAL_PLAYER_ENDPOINT
}

const createPayload = (data) => JSON.stringify(data)

async function getMetadata(id) {
  const url = `https://api.${location.hostname}/fc/video_pages/${id}`

  const res = await fetch(url, {
    method: 'GET',

    headers: {
      'Content-Type': 'application/json',
      fc_use_device: 'null',
    },
  })

  const {
    data: {
      video_page: { title },
    },
  } = await res.json()

  const [, artist] = location.pathname.split('/')

  return {
    title,
    artist,
  }
}

async function getSession(id) {
  const url = `https://nfc-api.${location.hostname}/fc/video_pages/${id}/session_ids`

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

function buildPlaylistUrl(session) {
  return `https://hls-auth.cloud.stream.co.jp/auth/index.m3u8?session_id=${session}`
}

function getVideoContentID(url) {
  const components = url.split('/')
  const length = components.length

  const isVideo = components[length - 2] === 'video'
  const contentID = components[length - 1]

  return isVideo && contentID
}

async function onPageChange(url) {
  const contentID = getVideoContentID(url)

  if (!contentID) {
    return
  }

  const session = await getSession(contentID)
  const playlist = buildPlaylistUrl(session)
  const metadata = await getMetadata(contentID)

  window.confirm('Are you sure to play this video stream in another window?')
    ? openPlayerPage(playlist, metadata)
    : null
}

function openPlayerPage(m3u8, metadata) {
  metadata.m3u8 = m3u8

  const params = buildUrlParams(metadata)

  GM.openInTab(`${getPlayerEndpoint()}/#${params}`)
}

;(function () {
  window.addEventListener('load', (e) => onPageChange(e.currentTarget.location.href))
  window.navigation.addEventListener('navigate', (e) => onPageChange(e.destination.url))
})()
