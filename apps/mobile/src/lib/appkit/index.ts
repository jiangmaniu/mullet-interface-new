// 必须放在最前面，处理 polyfills
import './polyfills'

// import { Provider, useAppKitConnection } from '@reown/appkit-adapter-solana/react'
// import { useAppKitProvider } from '@reown/appkit/react'
// import type { ChainNamespace } from '@reown/appkit-common-react-native'

import { appKit, solanaAdapter } from './config'

export { appKit, solanaAdapter }

// export type SolanaProviderResult = {
//   provider: Provider
//   chainNamespace: ChainNamespace
// }

// export const useAppKitSolanaProvider = () => {
//   return useAppKitProvider<Provider>('solana')
// }

// 导出 AppKit 组件和 hooks
// https://docs.reown.com/appkit/react-native/core/hooks
export {
  AppKit,
  AppKitButton,
  useAppKit, // open, close, disconnect, switchNetwork
  useAccount, // address, isConnected, chainId, chain, namespace
  useProvider, // provider, providerType
  useWalletInfo,
  useAppKitState,
  useAppKitEvents,
} from '@reown/appkit-react-native'
