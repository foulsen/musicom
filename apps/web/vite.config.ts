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
