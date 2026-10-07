import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins:[react()],
  resolve:{alias:{'@':fileURLToPath(new URL('./src',import.meta.url))}},
  build:{outDir:'dist',rollupOptions:{input:{home:fileURLToPath(new URL('./index.html',import.meta.url)),learn:fileURLToPath(new URL('./learn.html',import.meta.url))}}},
})
