
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // ОЧЕНЬ ВАЖНО для работы в Discord Activities
  server: {
    host: true, 
    port: 3000,
  },
  build: {
    target: 'es2015', // Critical for iOS compatibility
    outDir: 'dist',
  }
});
