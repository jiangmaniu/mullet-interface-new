export enum ChainId {
  SOL_MAINNET = 'sol:mainnet',
  SOL_DEVNET = 'sol:devnet',
}

export type ChainConfig = {
  readonly id: ChainId
  name: string
  nativeCurrency: { name: string; symbol: string; decimals: number }
  rpcUrls: {
    default: { http: [string, ...string[]]; wss: [string, ...string[]] }
  }
  blockExplorers: {
    default: {
      name: string
      url: readonly [string, ...string[]]
      apiUrl: string
    }
  }
}

export const defaultChainConfig = (config: ChainConfig) => config
