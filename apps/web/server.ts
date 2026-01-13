/**
 * 自定义开发服务器 - 支持 WebSocket 代理
 *
 * 注意：自定义服务器不支持 Turbopack，如果需要 Turbopack 请使用 `pnpm dev`
 * 本服务器用于需要 WebSocket 代理的开发场景
 *
 * 使用方式：pnpm dev:proxy
 */
import { createServer } from 'http'
import { networkInterfaces } from 'os'
import { parse } from 'url'
import { createProxyMiddleware } from 'http-proxy-middleware'
import next from 'next'
import type { IncomingMessage, ServerResponse } from 'http'
import type { Socket } from 'net'

const startTime = Date.now()

// 获取本机网络地址
function getNetworkAddress(): string {
  const interfaces = networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return 'localhost'
}

// Next.js 会自动加载 .env 文件，无需手动调用 loadEnvConfig

// 解析命令行参数
const args = process.argv.slice(2)
const getArg = (name: string, defaultValue: string): string => {
  const index = args.indexOf(name)
  const value = index !== -1 ? args[index + 1] : undefined
  return value ?? defaultValue
}

const dev = process.env.NODE_ENV !== 'production'
const hostname = getArg('--hostname', 'localhost')
const port = parseInt(getArg('--port', process.env.PORT || '3011'), 10)

// 启动信息
console.log(`\n  ▲ Next.js (Custom Server with WebSocket Proxy)`)
console.log(`  - Mode: ${dev ? 'development' : 'production'}`)
console.log(`  - Experiments (use with caution):`)
console.log(`    · reactCompiler`)
console.log('')

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// WebSocket 代理目标地址（从 NEXT_PUBLIC_WS_URL 环境变量读取）
const wsTarget = process.env.NEXT_PUBLIC_WS_URL?.replace('/websocketServer', '') || 'wss://websocket-test.mullet.top'

// WebSocket 代理中间件
const wsProxy = createProxyMiddleware({
  target: wsTarget,
  ws: true,
  changeOrigin: true,
  secure: false,
  logger: dev ? console : undefined,
})

console.log('  ⚡ Starting server...')

app.prepare().then(() => {
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const parsedUrl = parse(req.url!, true)
    const { pathname } = parsedUrl

    // WebSocket 路径代理
    if (pathname === '/websocketServer') {
      wsProxy(req, res)
      return
    }

    handle(req, res, parsedUrl)
  })

  // 处理 WebSocket 升级请求
  server.on('upgrade', (req: IncomingMessage, socket: Socket, head: Buffer) => {
    const parsedUrl = parse(req.url!, true)
    const { pathname } = parsedUrl

    if (pathname === '/websocketServer') {
      wsProxy.upgrade?.(req, socket, head)
    }
  })

  server.listen(port, () => {
    console.log(`  ✓ Ready in ${((Date.now() - startTime) / 1000).toFixed(1)}s`)
    console.log('')
    console.log(`  ➜ Local:    http://${hostname}:${port}`)
    console.log(`  ➜ Network:  http://${getNetworkAddress()}:${port}`)
    console.log('')
    console.log(`  ⚡ WebSocket Proxy:`)
    console.log(`     /websocketServer -> ${wsTarget}/websocketServer`)
    console.log('')
  })
})
