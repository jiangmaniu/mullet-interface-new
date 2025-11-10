import { queryOptions, useQuery } from '@tanstack/react-query'

import { BNumber } from '@mullet/utils/number'
import { fetchMint, fetchToken, findAssociatedTokenPda, TOKEN_2022_PROGRAM_ADDRESS } from '@solana-program/token-2022'
import { address, createSolanaRpc } from '@solana/kit'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

import { web3QueryQueriesKey } from '../constants/queries-cache-key'
import { MulletWeb3Config, useMulletWeb3Context } from '../provider'

async function getATATokenBalance(config: MulletWeb3Config, ownerStr?: string, mintStr?: string) {
  if (!ownerStr || !mintStr) {
    throw new Error('ownerStr and mintStr are required')
  }

  const rpcClient = createSolanaRpc(config.rpcUrls[0])
  const owner = address(ownerStr)
  const mint = address(mintStr)

  const [[onerAtaAddress], mintAccount] = await Promise.all([
    findAssociatedTokenPda({
      mint,
      owner,
      tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
    }),
    fetchMint(rpcClient, mint),
  ])
  const mintTokenDecimals = mintAccount.data.decimals

  try {
    const tokenAccount = await fetchToken(rpcClient, onerAtaAddress)
    const rawAmount = tokenAccount.data.amount // bigint
    const balanceAmount = BNumber.from(rawAmount).div(10 ** mintTokenDecimals)

    return balanceAmount.toString()
  } catch (error) {
    console.error(error)

    const ataSPLTuple = await findAssociatedTokenPda({
      mint,
      owner,
      tokenProgram: address(TOKEN_PROGRAM_ID.toString()),
    })
    const ataSPL = ataSPLTuple[0]

    try {
      const tokenAccount = await fetchToken(rpcClient, ataSPL)
      const balanceAmount = BNumber.from(tokenAccount.data.amount).div(10 ** mintTokenDecimals)
      return balanceAmount.toString()
    } catch (error) {
      throw error
    }
  }
}

export interface ATATokenBalanceOptionsQuery {
  ownerAddress?: string
  mintAddress?: string
}

export const useATATokenBalanceOptions = (
  { ownerAddress, mintAddress }: ATATokenBalanceOptionsQuery,
  config?: MulletWeb3Config,
) => {
  const { config: globalConfig } = useMulletWeb3Context()
  const ataTokenBalanceOptions = queryOptions({
    queryKey: web3QueryQueriesKey.sol.balance.ata.toKeyWithArgs({ ownerAddress, mintAddress }),
    enabled: !!ownerAddress && !!mintAddress,
    queryFn: async () => {
      const balance = await getATATokenBalance(config ?? globalConfig, ownerAddress, mintAddress)
      return balance
    },
  })

  return { ataTokenBalanceOptions }
}

export const useATATokenBalance = (query: ATATokenBalanceOptionsQuery, config?: MulletWeb3Config) => {
  const { ataTokenBalanceOptions } = useATATokenBalanceOptions(query, config)
  const queryResult = useQuery(ataTokenBalanceOptions)
  return queryResult
}
