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
      proxy: {
        '^/api(-docs)?/': {
          target: 'http://127.0.0.1:3000'
        },
        '^/api/v1/scoring/sync/socket': {
          target: 'http://127.0.0.1:3000',
          ws: true
        }
      },
      port: 5175
    },
    plugins: [react()],
    assetsInclude: [
      "**/*.glb"
    ]
  };
});
