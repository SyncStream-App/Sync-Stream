import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'SyncStream',
        short_name: 'SyncStream',
        description: 'Watch together. Chat together. Live together. ',
        theme_color: '#7C3AED',
        background_color: '#1E1B2E',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {src: '/icon-192.png', sizes: '192x192', type: 'image/png'},
          {src: '/icon-512.png', sizes: '512x512', type: 'image/png'},
          {src: '/icon-512.png', sizes: '512x512', type: 'image/png',
            purpose: 'any maskable'   }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/,
            handler: 'NetworkFirst',
            options: {cacheName: 'supabase-cache'}
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    host: '0.0.0.0',
    hmr: {
      clientPort: 443,
    }
  },
})
