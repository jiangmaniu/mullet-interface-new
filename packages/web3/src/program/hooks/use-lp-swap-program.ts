import { MulletWeb3Config } from '@/provider'
import { Program } from '@coral-xyz/anchor'
import { Connection } from '@solana/web3.js'

import lpSwapIdl from '../idl/mxlp_swap.json'
import { MxlpSwap } from '../types/mxlp_swap'
import { useAnchorProgram } from './use-anchor-program'

export type LpSwapProgram = Program<MxlpSwap>

export function useLpSwapProgram(config?: MulletWeb3Config) {
  return useAnchorProgram<MxlpSwap>(lpSwapIdl, config)
}
