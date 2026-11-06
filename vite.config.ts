import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // GitHub Pages serves the demo from /<repo>/; local and production hosting use the root
  base: process.env.PAGES_BASE || '/',
  plugins: [react(), tailwindcss()],
  resolve: { dedupe: ['react', 'react-dom'] },
  // pre-bundle everything up front so Vite never re-optimizes mid-session (that caused two Reacts)
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-dom/client', 'gsap', 'gsap/ScrollTrigger', '@gsap/react', 'lenis', 'motion/react', 'ogl', 'three'],
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three'
          if (id.includes('node_modules/gsap') || id.includes('node_modules/lenis')) return 'motion-core'
        },
      },
    },
  },
})
