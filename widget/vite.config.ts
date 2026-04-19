import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    outDir: "dist",
    // Inline all assets into a single self-contained HTML file for easy hosting
    assetsInlineLimit: 1024 * 1024,
  },
});
