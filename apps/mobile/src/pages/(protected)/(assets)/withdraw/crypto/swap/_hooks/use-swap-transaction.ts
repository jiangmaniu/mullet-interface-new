import { Buffer } from 'buffer'
import { useCallback, useState } from 'react'
import bs58 from 'bs58'

import { useSolanaConnection, useSolanaProvider } from '@/lib/appkit'
import { depositRequest } from '@/v1/utils/deposit-request'
import { VersionedTransaction } from '@solana/web3.js'

/**
 * 交易订单数据
 */
export interface SwapTransactionData {
  swapTransaction: string // base64 编码的交易
  fromToken: string
  toToken: string
  inputAmount: string
  expectedOutputAmount: string
  minOutputAmount: string
  slippageBps: number
  provider: string
  quoteData: any
}

/**
 * 构建交易请求参数
 */
export interface BuildSwapTxParams {
  fromToken: string
  toToken: string
  amount: string
  fromAddress: string
  toAddress?: string // 输出 Token 接收地址，不传则默认等于 fromAddress
  slippageBps?: number // 默认 50 = 0.5%
  /** "jupiter"（默认）\| "lifi" */
  provider?: string
}

/**
 * 签名状态
 */
export type SignatureStatus = 'idle' | 'signing' | 'success' | 'failed'

/**
 * Swap 交易管理 Hook
 * 封装交易订单构建、发送和状态管理（出金 Swap 场景）
 */
export function useSwapTransaction() {
  const [swapTransaction, setSwapTransaction] = useState<SwapTransactionData | null>(null)
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus>('idle')
  const [isBuilding, setIsBuilding] = useState(false)

  const { walletProvider, signTransaction } = useSolanaProvider()
  const { connection } = useSolanaConnection()

  const clearTransaction = useCallback(() => setSwapTransaction(null), [])

  const resetStatus = useCallback(() => setSignatureStatus('idle'), [])

  const buildTransaction = useCallback(async (params: BuildSwapTxParams, onRefreshCountdown?: () => void) => {
    setIsBuilding(true)
    try {
      const response = await depositRequest<SwapTransactionData>('/api/swap/build-tx', {
        method: 'POST',
        data: params,
      })

      if (!response.data || !response.data.swapTransaction) {
        throw new Error('Invalid transaction data received')
      }

      setSwapTransaction(response.data)
      if (onRefreshCountdown) onRefreshCountdown()
      return response.data
    } catch (error) {
      console.error('Build transaction failed:', error)
      throw error
    } finally {
      setIsBuilding(false)
    }
  }, [])

  const sendTransaction = useCallback(
    async (transactionData: SwapTransactionData) => {
      if (!transactionData?.swapTransaction) throw new Error('Invalid transaction data')
      if (!walletProvider || !connection) throw new Error('Provider or connection is missing')

      setSignatureStatus('signing')
      try {
        const signatureResult = await signTransaction(transactionData.swapTransaction)
        if (!signatureResult) throw new Error('签名失败：钱包未返回签名')

        const transactionBuffer = Buffer.from(transactionData.swapTransaction, 'base64')
        const transaction = VersionedTransaction.deserialize(transactionBuffer)
        const signatureBytes = bs58.decode(signatureResult)
        transaction.signatures[0] = Buffer.from(signatureBytes)

        const signedTransaction = transaction.serialize()
        const txSignature = await connection.sendRawTransaction(signedTransaction, {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        })

        setSignatureStatus('success')
        return txSignature
      } catch (error) {
        console.error('交易发送失败:', error)
        setSignatureStatus('failed')
        throw error
      }
    },
    [walletProvider, connection, signTransaction],
  )

  const buildAndSendTransaction = useCallback(
    async (params: BuildSwapTxParams, onRefreshCountdown?: () => void) => {
      const transactionData = await buildTransaction(params, onRefreshCountdown)
      return sendTransaction(transactionData)
    },
    [buildTransaction, sendTransaction],
  )

  return {
    swapTransaction,
    signatureStatus,
    isBuilding,
    buildTransaction,
    sendTransaction,
    buildAndSendTransaction,
    clearTransaction,
    resetStatus,
  }
}
