import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

// Event radar images live in R2 when the site is deployed (served by worker/index.js).
// While developing locally, serve the same URLs (/radar/events/...) straight from the
// pipeline's output folder, data/radar/events/, so no upload is needed to test.
function localRadarImages() {
  const root = path.resolve('data/radar/events')
  return {
    name: 'local-radar-images',
    configureServer(server) {
      server.middlewares.use('/radar/events', async (req, res, next) => {
        const file = path.resolve(root, '.' + decodeURIComponent(req.url.split('?')[0]))
        if (!file.startsWith(root + path.sep)) return next() // stay inside the folder
        try {
          const data = await readFile(file)
          res.setHeader('Content-Type', 'image/webp')
          res.end(data)
        } catch {
          next()
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localRadarImages()],
})
