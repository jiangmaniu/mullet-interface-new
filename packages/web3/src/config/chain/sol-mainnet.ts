import { TokenSymbol } from '../token/types'
import { ChainId, defaultChainConfig } from './types'

export const SOL_MAINNET_CHAIN_CONFIG = defaultChainConfig({
  id: ChainId.SOL_MAINNET,
  name: 'Solana Mainnet',
  nativeCurrency: { name: 'SOL', symbol: TokenSymbol.SOL, decimals: 9 },
  rpcUrls: {
    default: { http: ['https://api.mainnet-beta.solana.com'], wss: ['wss://api.mainnet-beta.solana.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Solscan',
      url: ['https://explorer.solana.com'] as const,
      apiUrl: 'https://api.solscan.io',
    },
  },
})
