import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// `base: './'` keeps every asset path relative, so the build runs from any
// sub-folder or static host without reconfiguration.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('@react-three')) return 'three'
          if (id.includes('node_modules/motion') || id.includes('framer-motion')) return 'motion'
        },
      },
    },
  },
})
