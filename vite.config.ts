import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/Titan-OMNI-AI/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE'),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE')
      },
      build: {
        outDir: 'dist',
        sourcemap: false,
        minify: true,
        chunkSizeWarningLimit: 1500,
        rollupOptions: {
          output: {
            manualChunks: undefined,
          },
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
