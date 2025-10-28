import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 💥 CRITICAL FIX: Set the base path to relative ('./').
  // This ensures assets (JS, CSS) are loaded relative to the index.html file,
  // which fixes the pathing issue on GitHub Pages subdirectories.
  base: './', 
})

