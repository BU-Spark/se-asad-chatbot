import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],

  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },

  build: {
    outDir: '../public/embed',
    lib: {
      entry: 'src/main.tsx',
      name: 'ChatbotWidget',
      formats: ['umd'],
    },
    rollupOptions: {
      output: {
        entryFileNames: 'embed.js',
      },
    },
  },
});
