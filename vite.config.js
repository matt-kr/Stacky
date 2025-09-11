import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8081, // Use the port that the API expects for CORS
    proxy: {
      '/api': {
        target: 'https://x8jxgxag72.execute-api.us-east-1.amazonaws.com/dev-test',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
});