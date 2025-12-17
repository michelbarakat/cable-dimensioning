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
      includeAssets: ["wasm/dimensioning.wasm", "wasm/dimensioning.js"],
      manifest: {
        name: "Dimensioning Tool",
        short_name: "Dimensioning",
        start_url: ".",
        display: "standalone",
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
