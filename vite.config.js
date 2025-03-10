import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    https: process.env.NODE_ENV === 'production',
    port: 5173
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'logo.png', 'robots.txt', 'offline.html'],
      manifest: {
        id: "/",
        name: "Tim's Kitchen",
        short_name: "Tim's Kitchen",
        description: "Delicious homemade meals made with fresh ingredients and love. Order authentic Nigerian cuisine delivered to your doorstep.",
        theme_color: '#4285f4',
        background_color: '#121212',
        orientation: 'portrait-primary',
        categories: ["food", "restaurant", "delivery", "cooking"],
        lang: "en-US",
        dir: "ltr",
        iarc_rating_id: "e84b072d-71b3-4d3e-86ae-31a8ce4e53b7",
        prefer_related_applications: false,
        scope: "/",
        scope_extensions: [
          {
            origin: "https://timskitchen.vercel.app"
          }
        ],
        launch_handler: {
          client_mode: ["navigate-existing", "auto"]
        },
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        start_url: '/',
        display: 'standalone',
        screenshots: [
          {
            src: "screenshots/desktop1.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
            label: "Tim's Kitchen homepage"
          },
          {
            src: "screenshots/mobile1.png", 
            sizes: "750x1334",
            type: "image/png",
            form_factor: "narrow",
            label: "Tim's Kitchen on mobile"
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, 
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /\.(jpg|jpeg|png|gif|svg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          }
        ]
      }
    })
  ],
})
