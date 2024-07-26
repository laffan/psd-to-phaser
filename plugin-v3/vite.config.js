import { defineConfig } from 'vite';
import path from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'PsdToPhaserPlugin',
      fileName: (format) => `psd-to-phaser-plugin.${format}.js`
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
  },
  plugins: [dts()]
});