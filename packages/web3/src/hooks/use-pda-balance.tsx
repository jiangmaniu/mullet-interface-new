import { queryOptions, useQuery } from '@tanstack/react-query'

import { web3QueryQueriesKey } from '@/constants/queries-cache-key'
import { MulletWeb3Config, useMulletWeb3Context } from '@/provider'
import { BNumber } from '@mullet/utils/number'
import { fetchMint, fetchToken } from '@solana-program/token-2022'
import { address, createSolanaRpc, getProgramDerivedAddress } from '@solana/kit'

interface GetPDATokenBalanceParams {
  /** program id */
  programAddress?: string
  seed?: string
  mintAddress?: string
}

export async function getPDATokenBalance(
  config: MulletWeb3Config,
  { programAddress, seed, mintAddress }: GetPDATokenBalanceParams,
) {
  const rpcClient = createSolanaRpc(config.rpcUrls[0])
  if (!programAddress || !seed) {
    throw new Error('programAddress and seed are required')
  }

  if (!mintAddress) {
    throw new Error('mintAddress is required')
  }

  const mint = address(mintAddress)
  const programId = address(programAddress)

  const seedBuf = Buffer.from(seed)

  const [pdaAddress, bump] = await getProgramDerivedAddress({
    seeds: [seedBuf],
    programAddress: programId,
  })

  try {
    const [tokenAccount, mintAccount] = await Promise.all([
      fetchToken(rpcClient, pdaAddress),
      fetchMint(rpcClient, mint),
    ])
    const mintTokenDecimals = mintAccount.data.decimals

    const rawAmount = tokenAccount.data.amount // bigint
    const balanceAmount = BNumber.from(rawAmount).div(10 ** mintTokenDecimals)

    return balanceAmount.toString()
  } catch (error) {
    console.log(error)
    throw error
  }
}

type PDATokenBalanceOptionsQuery = Partial<GetPDATokenBalanceParams>

export const usePDATokenBalanceOptions = (
  { programAddress, seed, mintAddress }: PDATokenBalanceOptionsQuery,
  config?: MulletWeb3Config,
) => {
  const { config: globalConfig } = useMulletWeb3Context()
  const pdaTokenBalanceOptions = queryOptions({
    queryKey: web3QueryQueriesKey.sol.balance.pda.toKeyWithArgs({ programAddress, seed, mintAddress }),
    enabled: !!programAddress && !!mintAddress,
    queryFn: async () => {
      const balance = await getPDATokenBalance(config ?? globalConfig, { programAddress, seed, mintAddress })
      return balance
    },
  })

  return { pdaTokenBalanceOptions }
}

export const usePDATokenBalance = (query: PDATokenBalanceOptionsQuery, config?: MulletWeb3Config) => {
  const { pdaTokenBalanceOptions } = usePDATokenBalanceOptions(query, config)
  const queryResult = useQuery(pdaTokenBalanceOptions)
  return queryResult
}
