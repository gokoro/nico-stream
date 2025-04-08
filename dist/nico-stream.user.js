// ==UserScript==
// @name        Nico-Stream
// @icon        https://www.google.com/s2/favicons?sz=64&domain=google.com
// @namespace   http://tampermonkey.net
// @version     0.14
// @description Get stream of nico
// @author      You
// @match       https://nicochannel.jp/*
// @match       https://dazbee-fc.com/*
// @match       https://canan8181.com/*
// @match       https://rnqq.jp/*
// @match       https://kemomimirefle.net/*
// @match       https://uise-official.com/*
// @match       https://nightmare-salon.com/*
// @match       https://muneatsu-fc.com/*
// @match       https://rizuna-official.com/*
// @grant       GM.openInTab
// @grant       GM.info
// @updateURL   https://raw.githubusercontent.com/gokoro/nico-stream/main/userscript.js
// @downloadURL https://raw.githubusercontent.com/gokoro/nico-stream/main/userscript.js
// ==/UserScript==

(function(){"use strict";const a="https://nico-stream.vercel.app";function c(n){const t=new URLSearchParams;for(const e in n)t.set(e,n[e]);return t}function r(){return a}const l=n=>JSON.stringify(n);async function u(){if(location.hostname==="nicochannel.jp"){const t="https://api.nicochannel.jp/fc/content_providers/channel_domain?current_site_domain=https:%2F%2Fnicochannel.jp%2F"+location.pathname.split("/")[1],e=await fetch(t),{data:{content_providers:{id:o}}}=await e.json();return o}else{const{fanclub_site_id:t}=await p();return t}}async function d(n){const t=await u();console.log(" fc_site_id:",t);const e=`https://api.${location.hostname}/fc/video_pages/${n}`,o=await fetch(e,{method:"GET",headers:{"Content-Type":"application/json",fc_site_id:t,fc_use_device:"null"}}),{data:{video_page:{title:s}}}=await o.json(),[,w]=location.pathname.split("/");return{title:s,artist:w,m3u8:""}}async function p(){return await(await fetch("/site/settings.json")).json()}async function h(n){const t=`https://nfc-api.${location.hostname}/fc/video_pages/${n}/session_ids`,e=await fetch(t,{method:"POST",headers:{"Content-Type":"application/json",fc_use_device:"null"},body:l({})}),{data:o}=await e.json();return o.session_id}function f(n){return`https://hls-auth.cloud.stream.co.jp/auth/index.m3u8?session_id=${n}`}function _(n){const t=n.split("/"),e=t.length,o=t[e-2]==="video",s=t[e-1];return o&&s}async function i(n){const t=_(n);if(!t)return;const e=await h(t),o=f(e),s=await d(t);window.confirm("Are you sure to play this video stream in another window?")&&g(o,s)}function g(n,t){t.m3u8=n;const e=c(t);GM.openInTab(`${r()}/#${e}`)}(function(){window.addEventListener("load",n=>i(n.currentTarget?.location.href)),window.navigation.addEventListener("navigate",n=>i(n.destination.url))})()})();
