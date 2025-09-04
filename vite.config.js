import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://vbwego9lp9.execute-api.us-east-1.amazonaws.com/prod',
        changeOrigin: true,
        secure: false,      
      },
    },
  },
});