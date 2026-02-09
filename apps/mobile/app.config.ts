import fs from 'fs'
import dotenv from 'dotenv'
import { ConfigContext, ExpoConfig } from 'expo/config'

import { ExpoConfigExtra } from './types/expo'

const env = process.env.ENV || 'dev'

const envFile = `.env.${env}`
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile })
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
    // Reown 配置
    REOWN_PROJECT_ID: process.env.EXPO_PUBLIC_REOWN_PROJECT_ID!,
  }

  const result: ExpoConfig = {
    ...config,
    name: `Mullet (${env})`,
    slug: 'mullet',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './public/images/icon.png',
    scheme: 'mullet',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,

    extra: extra,

    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.mullet.app',
      usesAppleSignIn: false, // 禁用 Sign in with Apple（个人开发者账号不支持）
      // 钱包检测 - LSApplicationQueriesSchemes
      // https://docs.reown.com/appkit/react-native/core/installation#enable-wallet-detection
      infoPlist: {
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
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.mullet.mobile',
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
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#060717',
          dark: {
            backgroundColor: '#060717',
          },
        },
      ],
      'expo-secure-store',
      'expo-web-browser',
      'expo-localization',
      // Android 钱包检测插件
      // https://docs.reown.com/appkit/react-native/core/installation#enable-wallet-detection
      './plugins/queries.js',
      // Android 网络安全配置 - 解决 SSL 证书验证问题
      './plugins/withNetworkSecurityConfig.js',
      // Android SSL 信任所有证书 - 已删除，使用 HTTP 临时过渡
      // iOS 禁用代码签名 - 解决开发环境无证书问题
      // './plugins/withDisableCodeSigning.js',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  }

  return result
}
