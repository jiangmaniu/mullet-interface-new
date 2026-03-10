// 必须放在最前面，处理 polyfills
import './polyfills'

// 单独导入 useProvider 用于内部封装
import { useProvider } from '@reown/appkit-react-native'
import { useMemo } from 'react'
import type { ChainNamespace, Provider } from '@reown/appkit-common-react-native'

import { EXPO_ENV_CONFIG } from '@/constants/expo'
import { clusterApiUrl, Connection } from '@solana/web3.js'

import { appKit, solanaAdapter } from './config'

export { appKit, solanaAdapter }

// 导出自定义 hooks
export { useSolanaProvider } from './use-solana-provider'

export type SolanaProviderResult = {
  provider?: Provider
  chainNamespace?: ChainNamespace
}

/**
 * 获取 Solana Connection
 * 根据环境变量创建 Solana RPC 连接
 */
export function useSolanaConnection() {
  const connection = useMemo(() => {
    const cluster = EXPO_ENV_CONFIG.SOLANA_CLUSTER
    return new Connection(clusterApiUrl(cluster), 'confirmed')
  }, [])

  return { connection }
}

/**
 * 获取 Solana Provider
 * 封装 useProvider 并确保返回 Solana 类型的 provider
 */
export const useAppKitSolanaProvider = (): SolanaProviderResult => {
  const { provider, providerType } = useProvider()

  if (providerType !== 'solana') {
    return {
      provider: undefined,
      chainNamespace: undefined,
    }
  }

  return {
    provider,
    chainNamespace: providerType,
  }
}

// 导出 AppKit 组件和 hooks
// https://docs.reown.com/appkit/react-native/core/hooks
export {
  AppKit,
  AppKitButton,
  useAppKit, // open, close, disconnect, switchNetwork
  useAccount, // address, isConnected, chainId, chain, namespace
  useWalletInfo,
  useAppKitState,
  useAppKitEvents,
} from '@reown/appkit-react-native'
