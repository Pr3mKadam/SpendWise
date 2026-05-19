/// <reference types="vitest" />
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'icons/*'],
      manifest: {
        name: 'SpendWise Premium',
        short_name: 'SpendWise',
        description: 'Premium High-Fidelity Financial Suite',
        theme_color: '#14b8a6', // Teal
        background_color: '#0f1117', // Dark blue background
        display: 'standalone',
        orientation: 'portrait',
        categories: ['finance', 'lifestyle'],
        share_target: {
          action: "/?action=share-receipt",
          method: "POST",
          enctype: "multipart/form-data",
          params: { files: [{ name: "receipt", accept: ["image/*"] }] }
        },
        shortcuts: [
          {
            name: 'New Transaction',
            short_name: 'Add',
            description: 'Quickly record a new expense or income',
            url: '/?action=new',
            icons: [{ src: 'icons/pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'View History',
            short_name: 'History',
            description: 'View your transaction history',
            url: '/?view=history',
            icons: [{ src: 'icons/pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'AI Assistant',
            short_name: 'AI',
            description: 'Talk to SpendWise AI',
            url: '/?view=advisor',
            icons: [{ src: 'icons/pwa-192x192.png', sizes: '192x192' }]
          }
        ],
        icons: [
          {
            src: 'icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/maskable-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'icons/monochrome-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'monochrome'
          }
        ],
        screenshots: [
          {
            src: 'screenshots/desktop.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: 'screenshots/mobile.png',
            sizes: '720x1280',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@/ui": path.resolve(__dirname, "src/ui"),
      "@/shell": path.resolve(__dirname, "src/shell"),
      "@/features": path.resolve(__dirname, "src/features"),
      "@/lib": path.resolve(__dirname, "src/lib"),
      "@/insights": path.resolve(__dirname, "src/insights"),
      "@/parsers": path.resolve(__dirname, "src/parsers"),
      "@/store": path.resolve(__dirname, "src/store"),
      "@/types": path.resolve(__dirname, "src/types"),
      "@/hooks": path.resolve(__dirname, "src/hooks"),
      "@/services": path.resolve(__dirname, "src/services"),
      "@/db": path.resolve(__dirname, "src/db"),
      "@/data": path.resolve(__dirname, "src/data"),
      "@/constants": path.resolve(__dirname, "src/constants"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name].[hash][extname]",
        chunkFileNames: "assets/[name].[hash].js",
        entryFileNames: "assets/[name].[hash].js",
        manualChunks: {
          'vendor-motion': ['framer-motion'],
          'vendor-charts': ['recharts'],
          'vendor-lucide': ['lucide-react'],
          'vendor-ocr': ['tesseract.js'],
          'vendor-db': ['dexie', 'dexie-react-hooks', 'dexie-export-import'],
        }
      },
    },
    // Exclude large binary dependencies from pre-bundling if necessary
    // or optimize chunks
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/utils/insights/**'],
    },
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));

