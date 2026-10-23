import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/proxy/gateway': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/gateway/, ''),
      },
      '/proxy/order': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/order/, ''),
      },
      '/proxy/payment': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/payment/, ''),
      },
      '/proxy/log': {
        target: 'http://localhost:8086',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/log/, ''),
      },
      '/proxy/eureka': {
        target: 'http://localhost:8761',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/eureka/, ''),
      },
    },
  },
})

