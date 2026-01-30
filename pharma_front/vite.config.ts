import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081,
    proxy: {
      '/auth': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/organizations': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/inventory': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/pos': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/patients': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/expenses': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/media': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    },
    watch: {
      ignored: [
        '**/pharmacy_backend/**',
        '**/venv/**',
        '**/node_modules/**'
      ]
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
