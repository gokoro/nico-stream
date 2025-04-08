import { defineConfig } from 'vite'
import Userscript from 'vite-userscript-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Userscript({
      fileName: 'nico-stream',
      entry: 'src/main.ts',
      header: {
        name: 'Nico-Stream',
        icon: 'https://www.google.com/s2/favicons?sz=64&domain=google.com',
        namespace: 'http://tampermonkey.net',
        version: '0.14',
        description: 'Get stream of nico',
        author: 'You',
        match: [
          'https://nicochannel.jp/*',
          'https://dazbee-fc.com/*',
          'https://canan8181.com/*',
          'https://rnqq.jp/*',
          'https://kemomimirefle.net/*',
          'https://uise-official.com/*',
          'https://nightmare-salon.com/*',
          'https://muneatsu-fc.com/*',
          'https://rizuna-official.com/*',
        ],
        grant: ['GM.openInTab', 'GM.info'],
        updateURL: 'https://raw.githubusercontent.com/gokoro/nico-stream/main/userscript.js',
        downloadURL: 'https://raw.githubusercontent.com/gokoro/nico-stream/main/userscript.js',
      },
    }),
  ],
})
