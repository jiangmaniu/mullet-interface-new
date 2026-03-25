import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import app from './index'

// Serve static files from Vite build output
app.use('/*', serveStatic({ root: '../client' }))

// SPA fallback — serve index.html for all non-API routes
app.get('*', serveStatic({ path: '../client/index.html' }))

const port = Number(process.env.PORT) || 3013

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running at http://localhost:${info.port}`)
})
