import { useCallback, useMemo } from 'react'
import type { Provider } from '@reown/appkit-common-react-native'

import { useAppKitSolanaProvider } from './index'

/**
 * 扩展的 Solana Provider 类型
 * 在原有 Provider 基础上添加便捷方法
 */
export interface EnhancedSolanaProvider extends Provider {
  signMessage: (message: string, pubkey: string) => Promise<string>
  signTransaction: (transaction: string) => Promise<string>
  signAndSendTransaction: (transaction: string) => Promise<string>
  signAllTransactions: (transactions: string[]) => Promise<string[]>
}

/**
 * Solana Provider Hook
 * 封装常用的 Solana 钱包操作方法
 */
export function useSolanaProvider() {
  const { provider, chainNamespace } = useAppKitSolanaProvider()

  /**
   * 签名消息
   * @param message - Base58 编码的消息
   * @param pubkey - 公钥地址
   */
  const signMessage = useCallback(
    async (message: string, pubkey: string) => {
      if (!provider || !chainNamespace) {
        throw new Error('Provider not available')
      }

      const result = await provider.request(
        {
          method: 'solana_signMessage',
          params: { message, pubkey },
        },
        `solana:${chainNamespace}`,
      )

      return typeof result === 'object' && result !== null ? (result as any).signature : String(result)
    },
    [provider, chainNamespace],
  )

  /**
   * 签名交易
   * @param transaction - 序列化的交易（base64）
   */
  const signTransaction = useCallback(
    async (transaction: string) => {
      if (!provider || !chainNamespace) {
        throw new Error('Provider not available')
      }

      const result = await provider.request(
        {
          method: 'solana_signTransaction',
          params: {
            transaction,
          },
        },
        `solana:${chainNamespace}`,
      )

      return typeof result === 'object' && result !== null ? (result as any).transaction : String(result)
    },
    [provider, chainNamespace],
  )

  /**
   * 签名并发送交易
   * @param transaction - 序列化的交易（base64）
   */
  const signAndSendTransaction = useCallback(
    async (transaction: string) => {
      if (!provider || !chainNamespace) {
        throw new Error('Provider not available')
      }

      const result = await provider.request(
        {
          method: 'solana_signAndSendTransaction',
          params: {
            transaction,
          },
        },
        `solana:${chainNamespace}`,
      )

      return typeof result === 'object' && result !== null ? (result as any).signature : String(result)
    },
    [provider, chainNamespace],
  )

  /**
   * 签名多个交易
   * @param transactions - 序列化的交易数组（base64）
   */
  const signAllTransactions = useCallback(
    async (transactions: string[]) => {
      if (!provider || !chainNamespace) {
        throw new Error('Provider not available')
      }

      const result = await provider.request(
        {
          method: 'solana_signAllTransactions',
          params: {
            transactions,
          },
        },
        `solana:${chainNamespace}`,
      )

      return result as string[]
    },
    [provider, chainNamespace],
  )

  // 创建增强的 provider 实例，将方法添加到 provider 属性中
  const enhancedProvider = useMemo(() => {
    if (!provider) {
      return null
    }

    // 创建一个新对象，包含原 provider 的所有属性和新增的方法
    const enhanced = Object.create(provider) as EnhancedSolanaProvider

    // 将独立函数绑定到 provider 实例上
    enhanced.signMessage = signMessage
    enhanced.signTransaction = signTransaction
    enhanced.signAndSendTransaction = signAndSendTransaction
    enhanced.signAllTransactions = signAllTransactions

    return enhanced
  }, [provider, signMessage, signTransaction, signAndSendTransaction, signAllTransactions])

  return {
    provider: enhancedProvider,
    chainNamespace,
    // 同时导出独立的函数
    signMessage,
    signTransaction,
    signAndSendTransaction,
    signAllTransactions,
  }
}
