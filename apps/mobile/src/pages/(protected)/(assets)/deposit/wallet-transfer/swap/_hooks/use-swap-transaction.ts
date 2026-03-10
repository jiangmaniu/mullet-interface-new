import { useCallback, useState } from 'react'

import { depositRequest } from '@/v1/utils/deposit-request'
import { useSolanaProvider } from '@/lib/appkit/use-solana-provider'

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
  slippageBps?: number // 默认 50 = 0.5%
  provider?: string // 默认 "jupiter"
}

/**
 * 签名状态
 */
export type SignatureStatus = 'idle' | 'signing' | 'success' | 'failed'

/**
 * Swap 交易管理 Hook
 * 封装交易订单构建、发送和状态管理
 */
export function useSwapTransaction() {
  // 交易订单数据
  const [swapTransaction, setSwapTransaction] = useState<SwapTransactionData | null>(null)

  // 签名状态
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus>('idle')

  // 是否正在构建交易
  const [isBuilding, setIsBuilding] = useState(false)

  // Solana Provider
  const { signAndSendTransaction } = useSolanaProvider()

  // 清除交易数据
  const clearTransaction = useCallback(() => {
    setSwapTransaction(null)
  }, [])

  // 重置签名状态
  const resetStatus = useCallback(() => {
    setSignatureStatus('idle')
  }, [])

  // 构建交易订单
  const buildTransaction = useCallback(
    async (params: BuildSwapTxParams, onRefreshCountdown?: () => void) => {
      setIsBuilding(true)
      try {
        const response = await depositRequest<SwapTransactionData>('/api/swap/build-tx', {
          method: 'POST',
          data: params,
        })

        // 验证响应数据
        if (!response.data || !response.data.swapTransaction) {
          throw new Error('Invalid transaction data received')
        }

        // 保存交易订单
        setSwapTransaction(response.data)

        // 刷新倒计时
        if (onRefreshCountdown) {
          onRefreshCountdown()
        }

        return response.data
      } catch (error) {
        console.error('Build transaction failed:', error)
        throw error
      } finally {
        setIsBuilding(false)
      }
    },
    [],
  )

  // 发送交易
  const sendTransaction = useCallback(
    async (transactionData: SwapTransactionData) => {
      if (!transactionData || !transactionData.swapTransaction) {
        throw new Error('Invalid transaction data')
      }

      setSignatureStatus('signing')
      try {
        // 使用 Solana Provider 签名并发送交易
        const signature = await signAndSendTransaction(transactionData.swapTransaction)

        console.log('Transaction sent successfully:', signature)
        setSignatureStatus('success')

        return signature
      } catch (error) {
        console.error('Send transaction failed:', error)
        setSignatureStatus('failed')
        throw error
      }
    },
    [signAndSendTransaction],
  )

  // 构建并发送交易
  const buildAndSendTransaction = useCallback(
    async (params: BuildSwapTxParams, onRefreshCountdown?: () => void) => {
      try {
        // 1. 构建交易订单
        const transactionData = await buildTransaction(params, onRefreshCountdown)

        // 2. 发送交易
        const signature = await sendTransaction(transactionData)

        return signature
      } catch (error) {
        console.error('Build and send transaction failed:', error)
        throw error
      }
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
