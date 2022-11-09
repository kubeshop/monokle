import path from 'node:path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), dts()],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
    ],
  },
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'monokle-desktop-shared',
      formats: ['es', 'umd'],
      fileName: format => `lib.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'styled-components'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'styled-components': 'styled',
        },
      },
    },
  },
});
