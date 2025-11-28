import { TokenSymbol } from '../token/types'
import { ChainId, defaultChainConfig } from './types'

export const SOL_DEVNET_CHAIN_CONFIG = defaultChainConfig({
  id: ChainId.SOL_DEVNET,
  name: 'Solana Devnet',
  nativeCurrency: { name: 'Devnet SOL', symbol: TokenSymbol.SOL, decimals: 9 },
  rpcUrls: {
    default: { http: ['https://api.devnet.solana.com'], wss: ['wss://api.devnet.solana.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Solscan Devnet',
      url: ['https://explorer.solana.com?cluster=devnet'] as const,
      apiUrl: 'https://api.solscan.io/devnet',
    },
  },
})
