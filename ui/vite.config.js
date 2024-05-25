import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    build: {
      outDir: 'build',
    },
    server: {
      proxy: {
        '^/api(-docs)?/': {
          target: 'http://127.0.0.1:3000'
        }
      }
    },
    plugins: [react()],
    assetsInclude: [
      "**/*.glb"
    ]
  };
});
