import { useQuery } from '@tanstack/react-query'

import { BNumber, BNumberValue } from '@mullet/utils/number'
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'

/**
 * 预估 Solana SPL Token 转账的 Gas 费用
 */
async function estimateGasFee({
  connection,
  fromAddress,
  toAddress,
  mintAddress,
  amount,
  decimals,
}: {
  connection: Connection
  fromAddress: string
  toAddress: string
  mintAddress: string
  amount: BNumberValue
  decimals: number
}): Promise<string> {
  // 构建模拟交易来预估费用
  const transaction = new Transaction()

  const mintAddressPublicKey = new PublicKey(mintAddress)
  const toTokenAccountPublicKey = new PublicKey(toAddress)
  const fromTokenAccountPublicKey = new PublicKey(fromAddress)

  // 获取关联代币账户地址
  const fromTokenAccountAtaAddress = getAssociatedTokenAddressSync(mintAddressPublicKey, fromTokenAccountPublicKey)
  const toTokenAccountAtaAddress = getAssociatedTokenAddressSync(mintAddressPublicKey, toTokenAccountPublicKey)

  // 检查目标代币账户是否存在
  let needsAccountCreation = false
  try {
    await getAccount(connection, toTokenAccountPublicKey)
  } catch {
    needsAccountCreation = true
    // 如果需要创建账户，添加创建指令
    const createAccountInstruction = createAssociatedTokenAccountInstruction(
      fromTokenAccountPublicKey,
      toTokenAccountAtaAddress,
      toTokenAccountPublicKey,
      mintAddressPublicKey,
    )
    transaction.add(createAccountInstruction)
  }

  // 添加转账指令
  const transferAmount = BNumber.from(amount).multipliedBy(10 ** decimals)
  const transferInstruction = createTransferInstruction(
    fromTokenAccountAtaAddress,
    toTokenAccountAtaAddress,
    fromTokenAccountPublicKey,
    transferAmount.toBigInt(),
    [],
    TOKEN_PROGRAM_ID,
  )
  transaction.add(transferInstruction)

  // 设置最新的区块哈希
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = fromTokenAccountPublicKey

  // 获取交易费用
  const fee = await transaction.getEstimatedFee(connection)

  if (fee !== null) {
    // 将 lamports 转换为 SOL（1 SOL = 10^9 lamports）
    return BNumber.from(fee).dividedBy(1e9).toString()
  } else {
    // 如果无法获取费用，使用默认值
    // 基础交易费用约 5000 lamports，创建账户额外约 2039280 lamports
    const defaultFee = needsAccountCreation ? 2044280 : 5000
    return BNumber.from(defaultFee).dividedBy(1e9).toString()
  }
}

/**
 * 预估 Solana SPL Token 转账的 Gas 费用 Hook
 * @returns estimatedFee - 预估的 Gas 费（SOL）
 * @returns isLoading - 是否正在加载
 * @returns error - 错误信息
 */
export function useEstimateGasFee({
  connection,
  fromAddress,
  toAddress,
  mintAddress,
  amount,
  decimals,
  enabled = true,
}: {
  connection?: Connection
  fromAddress?: string
  toAddress?: string
  mintAddress?: string
  amount?: BNumberValue
  decimals?: number
  enabled?: boolean
}) {
  const query = useQuery({
    queryKey: ['estimate-gas-fee', fromAddress, toAddress, mintAddress, amount, decimals],
    queryFn: async () => {
      if (!connection || !fromAddress || !toAddress || !mintAddress || !amount || decimals === undefined) {
        throw new Error('Missing required parameters')
      }

      return estimateGasFee({
        connection,
        fromAddress,
        toAddress,
        mintAddress,
        amount,
        decimals,
      })
    },
    enabled:
      enabled && !!connection && !!fromAddress && !!toAddress && !!mintAddress && !!amount && decimals !== undefined,
    staleTime: 30000, // 30秒内认为数据是新鲜的
    gcTime: 60000, // 缓存保留 60 秒
    retry: 2, // 失败后重试 2 次
  })

  return {
    estimatedFee: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
