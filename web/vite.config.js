import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    origin: 'https://5173-i42asipgh0xtnp57t2oxl-2090996d.manusvm.computer',
    proxy: {
      '/api': {
        target: 'https://8001-i42asipgh0xtnp57t2oxl-2090996d.manusvm.computer',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    allowedHosts: [
      '5173-i42asipgh0xtnp57t2oxl-2090996d.manusvm.computer'
    ]
  }
})
