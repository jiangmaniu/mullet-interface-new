export enum ProgramSymbol {
  LP = 'MXLP_SWAP',
  VAULT = 'vault',
}

export type ProgramConfig = {
  /** program 地址 */
  readonly address: string
  readonly symbol: ProgramSymbol
}

export const defaultProgramConfig = (config: [ProgramConfig, ...ProgramConfig[]]) => config
