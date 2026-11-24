import { defineConfig } from 'vite'

// Göreli taban yolu: aynı derleme hem GitHub Pages alt yolunda (/wilo/) hem Docker/Nginx kökünde çalışır.
export default defineConfig({
  base: './',
})
