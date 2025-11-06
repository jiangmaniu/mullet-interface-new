import { TokenSymbol } from '../token/types'
import { defaultChainConfig } from './types'

export const SOL_DEVNET_CHAIN_CONFIG = defaultChainConfig({
  id: 'sol-devnet',
  name: 'Solana Devnet',
  nativeCurrency: { name: 'Devnet SOL', symbol: TokenSymbol.SOL, decimals: 9 },
  rpcUrls: {
    default: { http: ['https://api.devnet.solana.com'], wss: ['wss://api.devnet.solana.com'] },
  },
  blockExplorers: {
    default: { name: 'Solscan Devnet', url: 'https://solscan.io/devnet', apiUrl: 'https://api.solscan.io/devnet' },
  },
})
