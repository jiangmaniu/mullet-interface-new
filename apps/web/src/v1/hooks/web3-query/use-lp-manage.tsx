import { web3QueryQueriesKey } from '@/libs/web3/constans/queries-eache-key'
import { calculateLpPoolShare } from '@/libs/web3/helpers/calculation-formula'
import { BNumber } from '@/utils/b-number'
import { PublicKey } from '@solana/web3.js'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { LpSwapProgram, useLpSwapProgram } from '../web3/use-anchor-program'
import useConnection from '../web3/useConnection'

interface GetLpTokenManageParams {
  program: LpSwapProgram
  /** program id */
  programAddress?: string
  seed?: string
}

async function getLpTokenManage({ program, programAddress, seed }: GetLpTokenManageParams) {
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
      totalSupply: totalSupply.toString()
    }

    return info
  } catch (error) {
    console.error(error)
    return null
  }
}

type LpTokenManageOptionsQuery = Partial<GetLpTokenManageParams>

export const useLpTokenManageOptions = ({ program, programAddress, seed }: LpTokenManageOptionsQuery) => {
  const { connection: connectionFallback } = useConnection()
  const { program: lpSwapProgram } = useLpSwapProgram(connectionFallback)
  const lpTokenManageOptions = queryOptions({
    queryKey: web3QueryQueriesKey.sol.manage.lp.toKeyWithArgs({ programAddress, seed }),
    enabled: !!programAddress && !!seed,
    queryFn: async () => {
      const balance = await getLpTokenManage({ program: program ?? lpSwapProgram, programAddress, seed })
      return balance
    }
  })

  return { lpTokenManageOptions }
}

export const useLpTokenManage = (query: LpTokenManageOptionsQuery) => {
  const { lpTokenManageOptions } = useLpTokenManageOptions(query)
  const queryResult = useQuery(lpTokenManageOptions)
  return queryResult
}
