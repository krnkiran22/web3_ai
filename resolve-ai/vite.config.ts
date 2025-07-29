import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [ tailwindcss(),react()],
 build: {
    rollupOptions: {
      external: ['@lazai-labs/alith-win32-x64-msvc'], // Exclude Alith native module
    },
  },
})
