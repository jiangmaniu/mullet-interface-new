import { EventEmitter } from 'events'
import { createAppKit, solana, solanaDevnet, solanaTestnet } from '@reown/appkit-react-native'
import { PhantomConnector, SolanaAdapter, SolflareConnector } from '@reown/appkit-solana-react-native'
import Constants from 'expo-constants'
import type { Storage } from '@reown/appkit-react-native'

import { EXPO_ENV_CONFIG } from '@/constants/expo'
import { mmkv } from '@/lib/storage/mmkv'

// 多个组件同时使用 AppKit hooks 会注册大量 disconnect 监听器，提高上限避免警告
EventEmitter.defaultMaxListeners = 20

const projectId = EXPO_ENV_CONFIG.REOWN_PROJECT_ID
const appScheme = (Constants.expoConfig?.scheme as string) ?? 'mullet'

// 根据环境变量选择 Solana 网络
const solanaCluster = EXPO_ENV_CONFIG.SOLANA_CLUSTER
console.log('solanaCluster', solanaCluster)
const networkMap = {
  'mainnet-beta': solana,
  devnet: solanaDevnet,
  testnet: solanaTestnet,
}
const selectedNetwork = networkMap[solanaCluster]

// Solana adapter
const solanaAdapter = new SolanaAdapter()

// MMKV 适配器（AppKit 需要 async 接口）
const APPKIT_PREFIX = 'appkit:'
const storage: Storage = {
  getKeys: async () => {
    return mmkv.getAllKeys().filter((k) => k.startsWith(APPKIT_PREFIX))
  },
  getEntries: async <T = unknown>(): Promise<[string, T][]> => {
    const keys = mmkv.getAllKeys().filter((k) => k.startsWith(APPKIT_PREFIX))
    return keys.map((key) => {
      const raw = mmkv.getString(key)
      return [key, raw ? JSON.parse(raw) : undefined]
    })
  },
  getItem: async <T = unknown>(key: string): Promise<T | undefined> => {
    const value = mmkv.getString(key)
    return value ? JSON.parse(value) : undefined
  },
  setItem: async <T = unknown>(key: string, value: T): Promise<void> => {
    mmkv.set(key, JSON.stringify(value))
  },
  removeItem: async (key: string): Promise<void> => {
    mmkv.remove(key)
  },
}

// 创建 AppKit 实例
export const appKit = createAppKit({
  projectId,
  networks: [selectedNetwork],
  defaultNetwork: selectedNetwork,
  adapters: [solanaAdapter],
  storage,
  debug: true,
  // themeMode 由 Providers 中的 useUniwind 动态控制
  metadata: {
    name: 'Mullet',
    description: 'Mullet - Trade Smarter',
    // url: 'https://mullet.top',
    url: EXPO_ENV_CONFIG.WEBSITE_URL,
    icons: [`${EXPO_ENV_CONFIG.WEBSITE_URL}/icons/logo/mullet-appkit.png`],
    redirect: {
      // 使用通用回调路径，由 App 内部路由处理具体跳转逻辑
      // native: `${appScheme}://wallet-callback`,
      native: `${appScheme}://login`,
      // 不设置 universal — PhantomConnector/SolflareConnector 会优先使用 universal 作为 redirect_link，
      // 但 Phantom 在 Android 上通过 Chrome Custom Tab 打开 universal link，
      // JS 重定向后 URL scheme 不匹配导致连接失败（"Unexpected redirect URI"）。
      // 仅使用 native scheme，Phantom 会通过 Intent 直接打开 App。
    },
  },
  // 禁用所有 Web2 登录方式，仅支持钱包连接
  // https://docs.reown.com/appkit/react-native/core/options#features
  features: {
    swaps: false, // 禁用代币交换
    onramp: false, // 禁用法币入金
    socials: false, // 禁用社交媒体登录 (Email, Google, Apple, etc.)
    showWallets: false, // 显示钱包选项
  },
  // 添加 Phantom 和 Solflare 连接器，使用环境变量配置的集群
  extraConnectors: [
    new PhantomConnector({ cluster: solanaCluster }),
    new SolflareConnector({ cluster: solanaCluster }),
  ],
})

export { solanaAdapter }
