import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { ConfigContext, ExpoConfig } from 'expo/config'

import { ExpoConfigExtra } from './types/expo'

const env = process.env.ENV || 'dev'

// 从 package.json 读取版本号
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'))
const version = packageJson.version

// 加载环境变量文件（支持 .local 覆盖）
// 加载顺序：.env.${env} -> .env.${env}.local
// .local 文件不会提交到 git，用于本地开发者的个性化配置
const envFile = `.env.${env}`
const envLocalFile = `.env.${env}.local`

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile })
}
if (fs.existsSync(envLocalFile)) {
  dotenv.config({ path: envLocalFile, override: true })
}

// 构建时间戳：优先使用 build.mjs 传入的 VERSION_CODE，否则生成当前时间
// 格式：YYYYMMDDHHMM（完整年份）或 YYMMDDHHMM（build.mjs 格式）
const buildTime = (() => {
  // 如果是通过 build.mjs 构建，VERSION_CODE 已经是 YYYYMMDDHHMM 格式，直接使用
  if (process.env.VERSION_CODE) {
    return process.env.VERSION_CODE
  }

  // 开发模式下生成当前时间
  const now = new Date()
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
  ].join('')
})()

const displayName: Record<string, string> = {
  dev: 'Mullet (dev)',
  test: 'Mullet (test)',
  prod: 'Mullet',
}

const bundleIdSuffix: Record<string, string> = {
  dev: '.dev',
  test: '.test',
  prod: '',
}

const schemeSuffix: Record<string, string> = {
  dev: '-dev',
  test: '-test',
  prod: '',
}

export default ({ config }: { config: ConfigContext }) => {
  const extra: ExpoConfigExtra = {
    // Privy 配置
    PRIVY_APP_ID: process.env.EXPO_PUBLIC_PRIVY_APP_ID!,
    PRIVY_CLIENT_ID: process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID!,
    PRIVY_SESSION_SIGNER_ID: process.env.EXPO_PUBLIC_PRIVY_SESSION_SIGNER_ID!,
    // API 配置
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL!,
    WS_URL: process.env.EXPO_PUBLIC_WS_URL!,
    IMG_DOMAIN: process.env.EXPO_PUBLIC_IMG_DOMAIN!,
    WEBSITE_URL: process.env.EXPO_PUBLIC_WEBSITE_URL!,
    DEPOSIT_API_BASE_URL: process.env.EXPO_PUBLIC_DEPOSIT_API_BASE_URL!,
    // Reown 配置
    REOWN_PROJECT_ID: process.env.EXPO_PUBLIC_REOWN_PROJECT_ID!,
    // Solana 网络配置
    SOLANA_CLUSTER: (process.env.EXPO_PUBLIC_SOLANA_CLUSTER as 'devnet' | 'testnet' | 'mainnet-beta') || 'mainnet-beta',
    // 版本和环境信息
    APP_VERSION: version,
    APP_ENV: env,
    BUILD_TIME: buildTime,
  }

  // 从 WEBSITE_URL 提取域名，用于 iOS associatedDomains
  const websiteHost = new URL(extra.WEBSITE_URL).host

  const result: ExpoConfig = {
    ...config,
    name: displayName[env] ?? `Mullet (${env})`,
    slug: 'mullet',
    version: version,
    orientation: 'portrait',
    icon: './public/images/icon.png',
    scheme: `mullet${schemeSuffix[env] ?? ''}`,
    userInterfaceStyle: 'dark',
    extra: extra,
    // 禁用 Web 平台，只支持 iOS 和 Android
    platforms: ['ios', 'android'],

    ios: {
      supportsTablet: true,
      bundleIdentifier: `com.mullet.app${bundleIdSuffix[env] ?? ''}`,
      appleTeamId: 'NJX3V5USJP',
      usesAppleSignIn: true,
      // 钱包检测 - LSApplicationQueriesSchemes
      // https://docs.reown.com/appkit/react-native/core/installation#enable-wallet-detection
      associatedDomains: [`applinks:${websiteHost}`, `webcredentials:${websiteHost}`],
      infoPlist: {
        CADisableMinimumFrameDurationOnPhone: true,
        ITSAppUsesNonExemptEncryption: false,
        LSApplicationQueriesSchemes: [
          // Solana 钱包
          'phantom',
          'solflare',
          'backpack',
          'glow',
          'okx',
          // 其他常用钱包
          'trust',
          'rainbow',
          'uniswap',
          'zerion',
          'safe',
        ],
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './public/images/android-icon-foreground.png',
        backgroundImage: './public/images/android-icon-background.png',
        monochromeImage: './public/images/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      package: `com.mullet.mobile${bundleIdSuffix[env] ?? ''}`,
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: '*.mullet.top',
              pathPrefix: '/app-redirect',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    web: {
      output: 'static',
      favicon: './public/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './public/images/splash-icon.png',
          resizeMode: 'contain', // 保持完整显示
          backgroundColor: '#060717',
          ios: {
            imageWidth: 200, // 在容器内显示更大尺寸
          },
          android: {
            imageWidth: 190, // 在容器内显示更大尺寸
          },
        },
      ],
      'expo-secure-store',
      'expo-web-browser',
      'expo-localization',
      'expo-font',
      // Android 钱包检测插件
      // https://docs.reown.com/appkit/react-native/core/installation#enable-wallet-detection
      './plugins/queries.js',
      // Android 网络安全配置 - 解决 SSL 证书验证问题
      './plugins/withNetworkSecurityConfig.js',
      // TradingView Advanced Charts - 复制 charting library 到原生 assets
      './plugins/withTradingView.js',
      // 修复 Android 16+ 上 WebView onMessage 不触发：强制走 addJavascriptInterface，绕开 addWebMessageListener 的 file:// origin 限制
      './plugins/withWebViewAndroidFix.js',
      // Android Release 签名配置
      './plugins/withAndroidSigning.js',
      // iOS Debug 自动签名 - prebuild --clean 后无需手动到 Xcode 重新开启
      './plugins/withDebugAutoSigning.js',
      // Gradle JVM 内存配置 - 解决 Metaspace 不足警告
      './plugins/withGradleJvmArgs.js',
      // Xcode 构建性能优化 - 并行编译等
      './plugins/withXcodeBuildSettings.js',
      // Android APK 体积优化
      './plugins/withApkOptimization.js',
      // 修复 Android 权限冲突（WRITE/READ_EXTERNAL_STORAGE maxSdkVersion）
      './plugins/withAndroidPermissions.js',
      './plugins/withSplitApks.js',
      './plugins/withProguardRules.js',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  }

  return result
}
