import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main:       resolve(__dirname, 'index.html'),
        kanbanScan: resolve(__dirname, 'kanban-scan.html'),
        dashboard:  resolve(__dirname, 'dashboard.html'),
        alert:      resolve(__dirname, 'alert.html'),
        qrGen:      resolve(__dirname, 'qr-gen.html'),
      }
    }
  }
})
