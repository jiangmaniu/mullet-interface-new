import { defaultTokenConfig, TokenSymbol } from './types'

export const SOL_MAINNET_TOKEN_CONFIG = defaultTokenConfig([
  {
    address: '',
    logoUrl: 'https://assets.coingecko.com/coins/images/4128/large/solana.png?1696501504',
    decimals: 9,
    name: 'SOL',
    symbol: TokenSymbol.SOL,
    label: 'Solana',
    volScale: 2,
  },
  {
    address: '',
    logoUrl: 'https://assets.coingecko.com/coins/images/4128/large/solana.png?1696501504',
    decimals: 6,
    name: 'USD Coin',
    symbol: TokenSymbol.USDC,
    label: TokenSymbol.USDC,
    volScale: 2,
  },
  {
    address: '',
    logoUrl: 'https://assets.coingecko.com/coins/images/4128/large/solana.png?1696501504',
    decimals: 6,
    name: 'MTLP Coin',
    symbol: TokenSymbol.LP,
    label: TokenSymbol.LP,
    volScale: 2,
  },
])
