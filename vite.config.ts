import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // Uppdaterar appen automatiskt när du ändrar kod
      manifest: {
        name: "Eventappen 2026",
        short_name: "EventApp",
        description: "Håll koll på alla dina event!",
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-192x192.png", // Du måste lägga dessa i din public-mapp
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable", // Gör att ikonen ser bra ut på alla mobiler
          },
        ],
      },
    }),
  ],
});
