// 必须放在最前面，处理 polyfills
import 'text-encoding' // needed for @solana/web3.js to work
import '@walletconnect/react-native-compat'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAppKit, solana, solanaDevnet, type Storage } from '@reown/appkit-react-native'
import { SolanaAdapter, PhantomConnector, SolflareConnector } from '@reown/appkit-solana-react-native'

import { EXPO_ENV_CONFIG } from '@/constants/expo'

const projectId = EXPO_ENV_CONFIG.REOWN_PROJECT_ID

// Solana adapter
const solanaAdapter = new SolanaAdapter()

// AsyncStorage 适配器
const storage: Storage = {
  getKeys: async () => {
    const keys = await AsyncStorage.getAllKeys()
    return [...keys]
  },
  getEntries: async <T = unknown>(): Promise<[string, T][]> => {
    const keys = await AsyncStorage.getAllKeys()
    const entries = await AsyncStorage.multiGet(keys)
    return entries.map(([key, value]) => [key, value ? JSON.parse(value) : undefined])
  },
  getItem: async <T = unknown>(key: string): Promise<T | undefined> => {
    const value = await AsyncStorage.getItem(key)
    return value ? JSON.parse(value) : undefined
  },
  setItem: async <T = unknown>(key: string, value: T): Promise<void> => {
    await AsyncStorage.setItem(key, JSON.stringify(value))
  },
  removeItem: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key)
  },
}

// 创建 AppKit 实例
export const appKit = createAppKit({
  projectId,
  networks: [solana, solanaDevnet],
  defaultNetwork: solana,
  adapters: [solanaAdapter],
  storage,
  // themeMode 由 Providers 中的 useUniwind 动态控制
  metadata: {
    name: 'Mullet',
    description: 'Mullet - Trade Smarter',
    url: 'https://mullet.top',
    icons: [`${EXPO_ENV_CONFIG.WEBSITE_URL}/icons/logo/mullet-tag.svg`],
    redirect: {
      native: 'mullet://',
      universal: 'https://mullet.top',
    },
  },
  // 禁用所有 Web2 登录方式，仅支持钱包连接
  // https://docs.reown.com/appkit/react-native/core/options#features
  features: {
    swaps: false,       // 禁用代币交换
    onramp: false,      // 禁用法币入金
    socials: false,     // 禁用社交媒体登录 (Email, Google, Apple, etc.)
    showWallets: true,  // 显示钱包选项
  },
  // 添加 Phantom 和 Solflare 连接器
  extraConnectors: [
    new PhantomConnector({ cluster: 'devnet' }),
    new SolflareConnector({ cluster: 'devnet' }),
  ],
})

export { solanaAdapter }
