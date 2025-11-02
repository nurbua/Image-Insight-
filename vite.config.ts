import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuration optimisée pour le déploiement sur Vercel
export default defineConfig({
  plugins: [react()],
  base: './', // ✅ chemin relatif pour éviter l’écran blanc sur Vercel
  build: {
    outDir: 'dist',
    sourcemap: true, // (facultatif, utile pour le debug)
  },
  server: {
    port: 5173, // port par défaut de Vite
    open: true, // ouvre le navigateur en mode dev
  },
})

