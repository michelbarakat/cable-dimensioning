import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["wasm/cable_dimensioning.wasm", "wasm/cable_dimensioning.js"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,wasm}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.wasm$/,
            handler: "CacheFirst",
            options: {
              cacheName: "wasm-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.js$/,
            handler: "CacheFirst",
            options: {
              cacheName: "js-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
      manifest: {
        name: "Cable Dimensioning - Web Assembly",
        short_name: "Dimensioning",
        description: "Cable dimensioning tool with offline support",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
          {
            src: "/vite.svg",
            sizes: "any",
            type: "image/svg+xml",
          },
        ],
      },
      devOptions: {
        enabled: false, // Disable in dev to avoid conflicts
      },
    }),
  ],
  server: {
    fs: {
      // Allow serving files from the project root
      allow: ['..'],
    },
  },
  optimizeDeps: {
    // Exclude WASM files from main bundle optimization
    // WASM is only loaded in the worker via importScripts(), not in main bundle
    exclude: ['cable_dimensioning.js'],
  },
  // Note: WASM files in /public/wasm/ are served as static assets and NOT bundled
  // This ensures WASM is only loaded once in the worker, not in the main bundle
});
