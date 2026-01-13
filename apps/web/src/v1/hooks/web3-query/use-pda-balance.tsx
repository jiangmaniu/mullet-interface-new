import { web3QueryQueriesKey } from '@/libs/web3/constans/queries-eache-key'
import { BNumber } from '@/utils/b-number'
import { fetchMint, fetchToken } from '@solana-program/token-2022'
import { address, getProgramDerivedAddress } from '@solana/kit'
import { queryOptions, useQuery } from '@tanstack/react-query'
import useConnection from '../web3/useConnection'

interface GetPDATokenBalanceParams {
  rpcClient: RpcClient
  /** program id */
  programAddress?: string
  seed?: string
  mintAddress?: string
}

async function getPDATokenBalance({ rpcClient, programAddress, seed, mintAddress }: GetPDATokenBalanceParams) {
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
    programAddress: programId
  })

  try {
    const [tokenAccount, mintAccount] = await Promise.all([fetchToken(rpcClient, pdaAddress), fetchMint(rpcClient, mint)])
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

export const usePDATokenBalanceOptions = ({ rpcClient, programAddress, seed, mintAddress }: PDATokenBalanceOptionsQuery) => {
  const { rpc: rpcFallback } = useConnection()
  const pdaTokenBalanceOptions = queryOptions({
    queryKey: web3QueryQueriesKey.sol.balance.pda.toKeyWithArgs({ programAddress, seed, mintAddress }),
    enabled: !!programAddress && !!mintAddress,
    queryFn: async () => {
      const balance = await getPDATokenBalance({ rpcClient: rpcClient ?? rpcFallback, programAddress, seed, mintAddress })
      return balance
    }
  })

  return { pdaTokenBalanceOptions }
}

export const usePDATokenBalance = (query: PDATokenBalanceOptionsQuery) => {
  const { pdaTokenBalanceOptions } = usePDATokenBalanceOptions(query)
  const queryResult = useQuery(pdaTokenBalanceOptions)
  return queryResult
}
