// vite.config.js

import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'PsdToJSONPlugin',
      fileName: (format) => `psd-to-json-plugin.${format}.js`
    },
    rollupOptions: {
      external: ['phaser'],
      output: {
        globals: {
          phaser: 'Phaser'
        }
      }
    },
    watch: {}
  }
});