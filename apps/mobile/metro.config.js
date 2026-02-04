// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')
const { withUniwindConfig } = require('uniwind/metro');
const { withInspector } = require('react-native-dev-inspector/metro'); 

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

// Uniwind Integration (类似 NativeWind)
// 配置顺序: Uniwind 在内层，Inspector 在外层
const uniwindConfig = withUniwindConfig(config, {
  cssEntryFile: './src/app/global.css',
  dtsFile: './types/uniwind-types.d.ts'
})

// Dev Inspector - 支持点击元素跳转到 Cursor 编辑器
module.exports = withInspector(uniwindConfig, {
  editor: 'cursor', // Cursor 编辑器
})
