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
 * 封装交易订单构建、发送和状态管理
 */
export function useSwapTransaction() {
  // 交易订单数据
  const [swapTransaction, setSwapTransaction] = useState<SwapTransactionData | null>(null)

  // 签名状态
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus>('idle')

  // 是否正在构建交易
  const [isBuilding, setIsBuilding] = useState(false)

  // Solana Provider 和 Connection
  const { walletProvider, signTransaction } = useSolanaProvider()
  const { connection } = useSolanaConnection()

  // 清除交易数据
  const clearTransaction = useCallback(() => {
    setSwapTransaction(null)
  }, [])

  // 重置签名状态
  const resetStatus = useCallback(() => {
    setSignatureStatus('idle')
  }, [])

  // 构建交易订单
  const buildTransaction = useCallback(async (params: BuildSwapTxParams, onRefreshCountdown?: () => void) => {
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
  }, [])

  // 发送交易
  const sendTransaction = useCallback(
    async (transactionData: SwapTransactionData) => {
      if (!transactionData || !transactionData.swapTransaction) {
        throw new Error('Invalid transaction data')
      }

      if (!walletProvider || !connection) {
        throw new Error('Provider or connection is missing')
      }

      setSignatureStatus('signing')
      try {
        console.log('-> 正在请求钱包签名交易...')
        // 使用 walletProvider 签名交易
        const signatureResult = await signTransaction(transactionData.swapTransaction)
        console.log('✅ 钱包返回签名:', signatureResult)

        if (!signatureResult) {
          throw new Error('签名失败：钱包未返回签名')
        }

        // 反序列化原始交易（VersionedTransaction 格式）
        const transactionBuffer = Buffer.from(transactionData.swapTransaction, 'base64')
        const transaction = VersionedTransaction.deserialize(transactionBuffer)

        // 钱包返回的是 base58 编码的签名，解码后添加到交易中
        const signatureBytes = bs58.decode(signatureResult)
        transaction.signatures[0] = Buffer.from(signatureBytes)

        // 序列化已签名的交易并发送到链上
        console.log('-> 正在发送交易到链上...')
        const signedTransaction = transaction.serialize()
        const txSignature = await connection.sendRawTransaction(signedTransaction, {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        })
        console.log('🎉 交易上链广播成功！签名 TxID:', txSignature)

        setSignatureStatus('success')
        return txSignature
      } catch (error) {
        console.error('❌ 交易发送失败:', error)
        setSignatureStatus('failed')
        throw error
      }
    },
    [walletProvider, connection, signTransaction],
  )

  // 构建并发送交易
  const buildAndSendTransaction = useCallback(
    async (params: BuildSwapTxParams, onRefreshCountdown?: () => void) => {
      try {
        console.log('BuildSwapTxParams', params)
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
