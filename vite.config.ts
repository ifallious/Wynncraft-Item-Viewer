import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/items': {
        target: 'https://api.wynncraft.com/v3/item/database',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/items/, '') + '?fullResult',
        secure: true,
        headers: {
          'User-Agent': 'Wynncraft-Item-Viewer/1.0'
        }
      }
    }
  }
})
