import { queryOptions, useQuery } from '@tanstack/react-query'

import { calculateLpPoolShare } from '@mullet/helpers/calculation'
import { BNumber } from '@mullet/utils/number'
import { PublicKey } from '@solana/web3.js'

import { web3QueryQueriesKey } from '../constants/queries-cache-key'
import { LpSwapProgram, useLpSwapProgram } from '../program/hooks'
import { MulletWeb3Config, useMulletWeb3Context } from '../provider'

interface GetLpTokenManageParams {
  program: LpSwapProgram
  /** program id */
  programAddress?: string
  seed?: string
}

export async function getLpTokenManage({ program, programAddress, seed }: GetLpTokenManageParams) {
  if (!programAddress || !seed) {
    throw new Error('programAddress and seed are required')
  }

  const seedBuf = Buffer.from(seed)

  try {
    const [pda] = PublicKey.findProgramAddressSync([seedBuf], new PublicKey(programAddress))

    const data = await program.account.mxlpManage.fetch(pda)

    const totalMinted = BNumber.from(data.totalMinted.toString()).div(10 ** 6)

    const totalBurned = BNumber.from(data.totalBurned.toString()).div(10 ** 6)
    const totalSupply = calculateLpPoolShare(totalMinted, totalBurned)

    const info = {
      totalMinted: totalMinted.toString(),
      totalBurned: totalBurned.toString(),
      totalSupply: totalSupply.toString(),
    }

    return info
  } catch (error) {
    console.error(error)
    return null
  }
}

type LpTokenManageOptionsQuery = Partial<GetLpTokenManageParams>

export const useLpTokenManageOptions = (
  { programAddress, seed }: LpTokenManageOptionsQuery,
  config?: MulletWeb3Config,
) => {
  const { config: globalConfig } = useMulletWeb3Context()
  const { program: lpSwapProgram } = useLpSwapProgram(config ?? globalConfig)
  const lpTokenManageOptions = queryOptions({
    queryKey: web3QueryQueriesKey.sol.manage.lp.toKeyWithArgs({ programAddress, seed }),
    enabled: !!programAddress && !!seed,
    queryFn: async () => {
      const balance = await getLpTokenManage({ program: lpSwapProgram, programAddress, seed })
      return balance
    },
  })

  return { lpTokenManageOptions }
}

export const useLpTokenManage = (query: LpTokenManageOptionsQuery) => {
  const { lpTokenManageOptions } = useLpTokenManageOptions(query)
  const queryResult = useQuery(lpTokenManageOptions)
  return queryResult
}
