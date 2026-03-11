import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'
 
export default defineConfig({

  plugins: [react()],

  server: {

    proxy: {

      '/api': {

        target: 'http://10.81.70.203:81',

        changeOrigin: true,

        secure: false,

        configure: (proxy) => {

          proxy.on('proxyReq', (proxyReq) => {

            proxyReq.setHeader('Connection', 'keep-alive');

          });

        }

      }

    }

  }

})

 