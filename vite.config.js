import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/picassette/',
  plugins: [
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'script-defer',
      includeAssets: ['icons/*.png'],
      manifest: {
        id: '/picassette/',
        name: 'PiCassette - PICO-8 Cartridge Loader',
        short_name: 'PiCassette',
        description: 'A local-first PICO-8 cartridge loader and player.',
        lang: 'en',
        start_url: '/picassette/',
        scope: '/picassette/',
        display: 'standalone',
        theme_color: '#171719',
        background_color: '#171719',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    }),
  ],
});