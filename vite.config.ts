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
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || 'AIzaSyBPAY5biWotzdzesWXIoDtIXa8ZlYIV8cc'),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || 'AIzaSyBPAY5biWotzdzesWXIoDtIXa8ZlYIV8cc')
      },
      build: {
        rollupOptions: {
          external: [], // Don't externalize any dependencies
          output: {
            manualChunks: undefined, // Bundle everything into single files
          }
        },
        modulePreload: {
          polyfill: false // Disable module preload which might cause import map issues
        },
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: false,
            drop_debugger: false
          }
        }
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
