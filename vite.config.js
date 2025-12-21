import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import dts from 'vite-plugin-dts';

// Plugin to copy built files to docs/src/js for local development
function copyToDocsPlugin() {
  return {
    name: 'copy-to-docs',
    closeBundle() {
      const srcFile = path.resolve(__dirname, 'dist/psd-to-phaser.umd.js');
      const destDir = path.resolve(__dirname, 'docs/src/js');
      const destFile = path.resolve(destDir, 'psd-to-phaser.umd.js');

      // Ensure destination directory exists
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Copy the file
      if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, destFile);
        console.log(`\n✓ Copied psd-to-phaser.umd.js to docs/src/js/\n`);
      }
    }
  };
}

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'PsdToPhaserPlugin',
      fileName: (format) => `psd-to-phaser.${format}.js`
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
  plugins: [dts(), copyToDocsPlugin()]
});