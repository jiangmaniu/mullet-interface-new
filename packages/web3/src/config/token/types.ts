export enum TokenSymbol {
  USDC = 'USDC',
  SOL = 'SOL',
  LP = 'MTLP',
}

export type TokenConfig = {
  /** mint 地址 */
  readonly address: string
  readonly symbol: TokenSymbol
  readonly logoUrl: string
  readonly decimals: number
  readonly label: string
  readonly name: string
  readonly volScale: number
}

export const defaultTokenConfig = (config: [TokenConfig, ...TokenConfig[]]) => config
