import { keyBy } from 'lodash-es'

import { ChainId, getChainConfig } from '../chain'
import { SOL_DEVNET_PROGRAM_CONFIG } from './sol-devnet'
import { SOL_MAINNET_PROGRAM_CONFIG } from './sol-mainnet'
import { ProgramConfig, ProgramSymbol } from './types'

export * from './sol-devnet'
export * from './sol-mainnet'
export * from './types'

export type ProgramConfigs = ProgramConfig[]

export const PROGRAM_CHAIN_MAP: Record<ChainId, ProgramConfigs> = {
  [ChainId.SOL_DEVNET]: SOL_DEVNET_PROGRAM_CONFIG,
  [ChainId.SOL_MAINNET]: SOL_MAINNET_PROGRAM_CONFIG,
}

export const getProgramConfigMap = <T extends keyof ProgramConfig>(chainId: ChainId, key: T) => {
  const programConfigs = PROGRAM_CHAIN_MAP[chainId]

  if (!programConfigs) {
    throw new Error(`Could not find programs information with chain id ${chainId}`)
  }

  return keyBy(programConfigs, (program) => program[key]) as Record<ProgramConfig[T], ProgramConfig>
}

export const getProgramConfigByAddress = (chainId: ChainId, address: string) => {
  const programMap = getProgramConfigMap(chainId, 'address')
  if (!programMap) {
    throw new Error(`Incorrect chainId ${chainId}`)
  }

  const program = programMap[address]
  if (!program) {
    throw new Error(`Incorrect address "${address}" for chainId ${chainId}`)
  }

  return program
}

export const getProgramConfigBySymbol = (chainId: ChainId, symbol: ProgramSymbol) => {
  const programMap = getProgramConfigMap(chainId, 'symbol')
  if (!programMap) {
    throw new Error(`Incorrect chainId ${chainId}`)
  }

  const program = programMap[symbol]
  if (!program) {
    throw new Error(`Incorrect symbol "${symbol}" for chainId ${chainId}`)
  }

  return program
}
