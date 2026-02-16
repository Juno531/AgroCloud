import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  server: {
    port: 5173,
    host: true, // Listen on all network interfaces (0.0.0.0) - enables mobile access
    proxy: {
      // Proxy for PC development: forwards /api requests to localhost:8080
      // Note: Mobile devices cannot use this proxy - they must connect directly to PC's IP
      // For mobile: Set VITE_API_BASE_URL in .env.development to your PC's IP (e.g., http://192.168.0.19:8080)
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
