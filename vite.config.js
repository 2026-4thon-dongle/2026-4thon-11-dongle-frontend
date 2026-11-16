import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // api/common.md: localhost:5173 is an allowed browser origin.
  server: { host: 'localhost', port: 5173, strictPort: true },
})
