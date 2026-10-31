import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Windows 7 caps at Chrome/Edge 109 and Firefox 115 ESR. Lightning CSS (the
    // CSS minifier) lowers Tailwind v4's oklch()/color-mix() for these targets.
    target: ["chrome109", "edge109", "firefox115", "safari15.4"],
    cssTarget: ["chrome109", "edge109", "firefox115", "safari15.4"],
  },
  server: {
    port: Number(process.env.PORT) || 5173,
    proxy: {
      // Makes the API same-origin in dev so the httpOnly session cookie flows.
      "/v1": {
        target: process.env.API_URL || "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
