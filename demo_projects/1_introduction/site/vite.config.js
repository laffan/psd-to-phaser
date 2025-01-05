import { defineConfig } from 'vite'
import chokidar from 'chokidar'

export default defineConfig({
  plugins: [
    {
      name: 'watch-public',
      configureServer({ ws }) {
        chokidar.watch('public/**/*', { ignoreInitial: true }).on('all', (event, path) => {
          ws.send({ type: 'full-reload' })
        })
      }
    }
  ]
})