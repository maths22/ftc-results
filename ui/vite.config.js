import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    build: {
      outDir: 'build',
      assetsDir: 'static',
      sourcemap: true
    },
    server: {
      allowedHosts: ['.ngrok-free.app'],
      port: 5175
    },
    plugins: [react()],
    assetsInclude: [
      "**/*.glb"
    ]
  };
});
