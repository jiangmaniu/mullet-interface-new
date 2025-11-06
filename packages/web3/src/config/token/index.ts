import { keyBy } from 'lodash-es'

import { ChainId, getChainConfig } from '../chain'
import { SOL_DEVNET_TOKEN_CONFIG } from './sol-devnet'
import { SOL_MAINNET_TOKEN_CONFIG } from './sol-mainnet'
import { TokenConfig, TokenSymbol } from './types'

export * from './sol-devnet'
export * from './sol-mainnet'
export * from './types'

export type TokenConfigs = TokenConfig[]

export const TOKEN_CHAIN_MAP: Record<ChainId, TokenConfigs> = {
  [ChainId.SOL_DEVNET]: SOL_DEVNET_TOKEN_CONFIG,
  [ChainId.SOL_MAINNET]: SOL_MAINNET_TOKEN_CONFIG,
}

export const getTokenConfigMap = <T extends keyof TokenConfig>(chainId: ChainId, key: T) => {
  const tokenConfigs = TOKEN_CHAIN_MAP[chainId]

  if (!tokenConfigs) {
    throw new Error(`Could not find tokens information with chain id ${chainId}`)
  }

  return keyBy(tokenConfigs, (token) => token[key]) as Record<TokenConfig[T], TokenConfig>
}

export const getTokenConfigByAddress = (chainId: ChainId, address: string) => {
  const tokenMap = getTokenConfigMap(chainId, 'address')
  if (!tokenMap) {
    throw new Error(`Incorrect chainId ${chainId}`)
  }

  const token = tokenMap[address]
  if (!token) {
    throw new Error(`Incorrect address "${address}" for chainId ${chainId}`)
  }

  return token
}

export const getTokenConfigBySymbol = (chainId: ChainId, symbol: TokenSymbol) => {
  const tokenMap = getTokenConfigMap(chainId, 'symbol')
  if (!tokenMap) {
    throw new Error(`Incorrect chainId ${chainId}`)
  }

  const token = tokenMap[symbol]
  if (!token) {
    throw new Error(`Incorrect symbol "${symbol}" for chainId ${chainId}`)
  }

  return token
}
