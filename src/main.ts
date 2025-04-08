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

type StreamMetadata = {
  title: string
  artist: string
  m3u8: string
}

function buildUrlParams(data: StreamMetadata) {
  const url = new URLSearchParams()

  for (const key in data) {
    url.set(key, data[key as keyof StreamMetadata])
  }

  return url
}

function isLocal() {
  return import.meta.env.MODE === 'development'
}

function getPlayerEndpoint() {
  return isLocal() ? LOCAL_PLAYER_ENDPOINT : EXTERNAL_PLAYER_ENDPOINT
}

const createPayload = (data: object) => JSON.stringify(data)

async function getFcSiteId(): Promise<string> {
  const isNicoBased = location.hostname === 'nicochannel.jp'

  if (isNicoBased) {
    const url =
      'https://api.nicochannel.jp/fc/content_providers/channel_domain?current_site_domain=https:%2F%2Fnicochannel.jp%2F' +
      location.pathname.split('/')[1]

    const res = await fetch(url)
    const {
      data: {
        content_providers: { id },
      },
    } = await res.json()

    return id
  } else {
    const { fanclub_site_id } = await getSettingJson()
    return fanclub_site_id as string
  }
}

async function getMetadata(id: string): Promise<StreamMetadata> {
  const fc_site_id = await getFcSiteId()
  console.log(' fc_site_id:', fc_site_id)

  const url = `https://api.${location.hostname}/fc/video_pages/${id}`

  const res = await fetch(url, {
    method: 'GET',

    headers: {
      'Content-Type': 'application/json',
      fc_site_id,
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
    m3u8: '',
  }
}

async function getSettingJson() {
  const url = '/site/settings.json'

  const res = await fetch(url)

  return await res.json()
}

async function getSession(id: string) {
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

function buildPlaylistUrl(session: string) {
  return `https://hls-auth.cloud.stream.co.jp/auth/index.m3u8?session_id=${session}`
}

function getVideoContentID(url: string) {
  const components = url.split('/')
  const length = components.length

  const isVideo = components[length - 2] === 'video'
  const contentID = components[length - 1]

  return isVideo && contentID
}

async function onPageChange(url: string) {
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

function openPlayerPage(m3u8: string, metadata: StreamMetadata) {
  metadata.m3u8 = m3u8

  const params = buildUrlParams(metadata)

  GM.openInTab(`${getPlayerEndpoint()}/#${params}`)
}

;(function () {
  // @ts-ignore
  window.addEventListener('load', (e) => onPageChange(e.currentTarget?.location.href))

  // @ts-ignore
  window.navigation.addEventListener('navigate', (e) => onPageChange(e.destination.url))
})()
