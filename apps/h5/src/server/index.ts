import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { api } from './routes/api'

const app = new Hono()

app.use('*', logger())
app.use('/api/*', cors())

app.route('/api', api)

export default app
export type AppType = typeof app
