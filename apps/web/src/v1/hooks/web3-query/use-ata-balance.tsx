import { web3QueryQueriesKey } from '@/libs/web3/constans/queries-eache-key'
import { BNumber } from '@/utils/b-number'
import { fetchMint, fetchToken, findAssociatedTokenPda, TOKEN_2022_PROGRAM_ADDRESS } from '@solana-program/token-2022'
import { address, createSolanaRpc } from '@solana/kit'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { queryOptions, useQuery } from '@tanstack/react-query'
import useConnection from '../web3/useConnection'

async function getATATokenBalance(rpcClient: ReturnType<typeof createSolanaRpc>, ownerStr?: string, mintStr?: string) {
  if (!ownerStr || !mintStr) {
    throw new Error('ownerStr and mintStr are required')
  }

  const owner = address(ownerStr)
  const mint = address(mintStr)

  const [[onerAtaAddress], mintAccount] = await Promise.all([
    findAssociatedTokenPda({
      mint,
      owner,
      tokenProgram: TOKEN_2022_PROGRAM_ADDRESS
    }),
    fetchMint(rpcClient, mint)
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
      tokenProgram: address(TOKEN_PROGRAM_ID.toString())
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
  rpc?: RpcClient
  ownerAddress?: string
  mintAddress?: string
}

export const useATATokenBalanceOptions = ({ rpc, ownerAddress, mintAddress }: ATATokenBalanceOptionsQuery) => {
  const { rpc: rpcFallback } = useConnection()
  const ataTokenBalanceOptions = queryOptions({
    queryKey: web3QueryQueriesKey.sol.balance.ata.toKeyWithArgs({ ownerAddress, mintAddress }),
    enabled: !!ownerAddress && !!mintAddress,
    queryFn: async () => {
      const balance = await getATATokenBalance(rpc ?? rpcFallback, ownerAddress, mintAddress)
      return balance
    }
  })

  return { ataTokenBalanceOptions }
}

export const useATATokenBalance = (query: ATATokenBalanceOptionsQuery) => {
  const { ataTokenBalanceOptions } = useATATokenBalanceOptions(query)
  const queryResult = useQuery(ataTokenBalanceOptions)
  return queryResult
}
