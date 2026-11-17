import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base:'/',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate', // SW сам обновляется при новой сборке
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Грузинская и армянская раскладка',
        short_name: 'Раскладка',
        description: 'Экранная раскладка для ввода грузинских и армянских букв',
        
        display: 'standalone',
        background_color: '#f4f4f4',
        theme_color: '#4a6fa5',
        lang: 'ru',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Автоматически кэширует все ассеты сборки; старые кэши удаляются при обновлении
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
});