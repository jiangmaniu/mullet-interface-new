import { SOL_DEVNET_CHAIN_CONFIG } from './sol-devnet'
import { SOL_MAINNET_CHAIN_CONFIG } from './sol-mainnet'
import { ChainConfig, ChainId } from './types'

export * from './types'
export * from './sol-devnet'
export * from './sol-mainnet'

export type ChainConfigs = readonly [ChainConfig, ChainConfig]

export const CHAIN_CONFIGS: ChainConfigs = [SOL_MAINNET_CHAIN_CONFIG, SOL_DEVNET_CHAIN_CONFIG] as const

export function getChainConfig(chainId: ChainId) {
  const chainConfig = CHAIN_CONFIGS.find((chain) => chain.id === chainId)

  if (!chainConfig) {
    throw new Error(`Could not find information with chain id ${chainId}`)
  }

  return chainConfig
}

export function getChainConfigs(chainIds: ChainId[]) {
  return chainIds.map((id) => getChainConfig(id))
}
