import { useCallback, useState } from 'react'
import bs58 from 'bs58'

import { useAccount, useSolanaProvider } from '@/lib/appkit'

import { useWithdrawMessage } from '../_apis/use-withdraw-message'
import { useWithdrawState } from './use-withdraw-state'

export type WithdrawSignStatus = 'idle' | 'signing' | 'success' | 'failed'

export interface WalletSignatureData {
  message: string
  signature: string
  address: string
}

/**
 * 出金钱包签名 Hook
 * 流程：获取标准消息 → 钱包签名 → 返回签名数据
 */
export function useWithdrawWalletSign() {
  const [status, setStatus] = useState<WithdrawSignStatus>('idle')
  const { signMessage } = useSolanaProvider()
  const { address: currentWalletAddress } = useAccount()

  // 获取标准签名消息
  const { data: messageData, refetch: refetchMessage } = useWithdrawMessage(currentWalletAddress)

  const resetStatus = useCallback(() => setStatus('idle'), [])

  const signWithdrawMessage = useCallback(async (): Promise<WalletSignatureData> => {
    if (!signMessage || !currentWalletAddress) {
      throw new Error('钱包未连接')
    }

    setStatus('signing')
    try {
      // 1. 获取最新的签名消息（确保时间戳有效）
      // console.log('[WithdrawSign] 获取签名消息')
      const { data: latestMessageData } = await refetchMessage()
      if (!latestMessageData) throw new Error('无法获取签名消息')

      const message = latestMessageData.message
      const address = latestMessageData.address
      // console.log('[WithdrawSign] 签名消息获取成功, address:', address, 'expiresIn:', latestMessageData.expiresIn)

      // 2. 钱包签名
      const messageBytes = bs58.encode(new TextEncoder().encode(message))
      // console.log('[WithdrawSign] 请求钱包签名...')
      const signature = await signMessage(messageBytes, address)
      if (!signature) throw new Error('签名失败：钱包未返回签名')

      // console.log('[WithdrawSign] 签名成功, signature:', signature.slice(0, 20) + '...')
      setStatus('success')
      return { message, signature, address }
    } catch (error) {
      console.error('[WithdrawSign] 签名失败:', error)
      setStatus('failed')
      throw error
    }
  }, [currentWalletAddress, signMessage, refetchMessage])

  return {
    status,
    signWithdrawMessage,
    resetStatus,
    messageData,
  }
}
