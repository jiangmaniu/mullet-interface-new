// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')
const { withUniwindConfig } = require('uniwind/metro');
const { createInspectorMiddleware } = require('react-native-dev-inspector/metro');

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
  dtsFile: './types/uniwind-types.d.ts'
})

// 手动添加 Inspector 中间件（避免覆盖 Uniwind 配置）
const inspectorMiddleware = createInspectorMiddleware({
  editor: 'cursor',
})

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
      // 再添加 Inspector 中间件
      return (req, res, next) => {
        inspectorMiddleware(req, res, () => {
          enhanced(req, res, next)
        })
      }
    },
  },
}
