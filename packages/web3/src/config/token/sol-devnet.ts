import { defaultTokenConfig, TokenSymbol } from './types'

export const SOL_DEVNET_TOKEN_CONFIG = defaultTokenConfig([
  {
    address: '',
    logoUrl: 'https://assets.coingecko.com/coins/images/4128/large/solana.png?1696501504',
    decimals: 9,
    name: 'SOL',
    symbol: TokenSymbol.SOL,
    label: TokenSymbol.SOL,
    volScale: 2,
  },
  {
    address: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
    logoUrl: 'https://assets.coingecko.com/coins/images/4128/large/solana.png?1696501504',
    decimals: 6,
    name: 'USD Coin',
    symbol: TokenSymbol.USDC,
    label: TokenSymbol.USDC,
    volScale: 2,
  },
])
