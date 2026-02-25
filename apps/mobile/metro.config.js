// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')
const { withUniwindConfig } = require('uniwind/metro')
const { createInspectorMiddleware } = require('react-native-dev-inspector/metro')
const path = require('path')
const fs = require('fs')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

const resolveRequestWithPackageExports = (context, moduleName, platform) => {
  // Package exports in `isows` are incorrect, so we need to disable them
  if (moduleName === 'isows') {
    const ctx = {
      ...context,
      unstable_enablePackageExports: false,
    }
    return ctx.resolveRequest(ctx, moduleName, platform)
  }
  // Package exports in `zustand@4` are incorrect, so we need to disable them
  if (moduleName.startsWith('zustand')) {
    const ctx = {
      ...context,
      unstable_enablePackageExports: false,
    }
    return ctx.resolveRequest(ctx, moduleName, platform)
  }
  // Package exports in `jose` are incorrect, so we need to force the browser version
  if (moduleName === 'jose') {
    const ctx = {
      ...context,
      unstable_conditionNames: ['browser'],
    }
    return ctx.resolveRequest(ctx, moduleName, platform)
  }

  return context.resolveRequest(context, moduleName, platform)
}

config.resolver.resolveRequest = resolveRequestWithPackageExports
config.resolver.sourceExts.push('po', 'pot')
config.transformer.babelTransformerPath = require.resolve('@lingui/metro-transformer/expo')

// 应用 Uniwind 配置
const uniwindConfig = withUniwindConfig(config, {
  cssEntryFile: './src/app/global.css',
  dtsFile: './types/uniwind-types.d.ts',
})

// 手动添加 Inspector 中间件（避免覆盖 Uniwind 配置）
const inspectorMiddleware = createInspectorMiddleware({
  editor: 'cursor',
})

// TradingView 静态文件中间件 - 开发环境提供本地文件服务
const TRADINGVIEW_SOURCE_DIR = path.join(
  path.dirname(require.resolve('@mullet/trading-view/package.json')),
  'dist'
)
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function tradingviewMiddleware(req, res, next) {
  if (!req.url.startsWith('/tradingview/')) return next()

  const relativePath = req.url.replace('/tradingview/', '').split('?')[0]
  const filePath = path.join(TRADINGVIEW_SOURCE_DIR, relativePath || 'index.html')

  if (!fs.existsSync(filePath) || !filePath.startsWith(TRADINGVIEW_SOURCE_DIR)) {
    return next()
  }

  const ext = path.extname(filePath)
  const contentType = MIME_TYPES[ext] || 'application/octet-stream'

  res.setHeader('Content-Type', contentType)
  res.setHeader('Access-Control-Allow-Origin', '*')
  fs.createReadStream(filePath).pipe(res)
}

const existingEnhanceMiddleware = uniwindConfig.server?.enhanceMiddleware

module.exports = {
  ...uniwindConfig,
  server: {
    ...uniwindConfig.server,
    enhanceMiddleware: (metroMiddleware, server) => {
      // 先应用现有的 enhanceMiddleware（Uniwind）
      let enhanced = metroMiddleware
      if (existingEnhanceMiddleware) {
        enhanced = existingEnhanceMiddleware(metroMiddleware, server)
      }
      // 再添加 Inspector 中间件和 TradingView 静态文件中间件
      return (req, res, next) => {
        tradingviewMiddleware(req, res, () => {
          inspectorMiddleware(req, res, () => {
            enhanced(req, res, next)
          })
        })
      }
    },
  },
}
