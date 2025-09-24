import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  base: '/sherlock-holmes-game/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY || 'AIzaSyCFhTg-cnwD6gBy-VTB78iNyhb5zWShMt8'),
    'import.meta.env.VITE_AI_MODEL': JSON.stringify(process.env.VITE_AI_MODEL || 'gemini-1.5-flash')
  }
})
