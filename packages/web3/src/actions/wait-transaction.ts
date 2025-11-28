import { MulletWeb3Config } from '@/provider'
import { Commitment, Connection, Finality, TransactionError, VersionedTransactionResponse } from '@solana/web3.js'

/**
 * 确认交易是否成功，并返回交易详情
 * @param connection Solana Connection
 * @param txSig 交易签名
 * @param commitment 确认等级，默认 "confirmed"
 * @returns VersionedTransactionResponse | null
 */
export async function waitTransactionConfirm(
  config: MulletWeb3Config,
  txSig: string,
  commitment: Commitment = 'confirmed',
): Promise<VersionedTransactionResponse | null> {
  const connection = new Connection(config.rpcUrls[0])
  // 先获取最新 blockhash，避免旧交易被判定为过期
  const latestBlockhash = await connection.getLatestBlockhash()

  const result = await connection.confirmTransaction(
    {
      signature: txSig,
      ...latestBlockhash,
    },
    commitment,
  )

  if (result.value.err !== null) {
    const err: TransactionError = result.value.err
    throw new Error(`❌ Transaction failed: ${JSON.stringify(err)}`)
  }

  const finality: Finality = commitment === 'finalized' ? 'finalized' : 'confirmed'

  // 成功时获取交易详情
  const txDetails = await connection.getTransaction(txSig, {
    commitment: finality,
    maxSupportedTransactionVersion: 0, // 支持 v0
  })

  return txDetails
}
