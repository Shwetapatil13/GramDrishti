import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

try {
  const source = path.resolve(__dirname, '../logo.png');
  const dest = path.resolve(__dirname, './public/logo.png');
  if (fs.existsSync(source)) {
    if (!fs.existsSync(path.resolve(__dirname, './public'))) {
      fs.mkdirSync(path.resolve(__dirname, './public'));
    }
    fs.copyFileSync(source, dest);
  }
  
  const heroSource = path.resolve(__dirname, '../hero image.png');
  const heroDest = path.resolve(__dirname, './public/hero_image.png');
  if (fs.existsSync(heroSource)) {
    fs.copyFileSync(heroSource, heroDest);
  }
} catch (e) {
  console.error("Failed to copy logo", e);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})