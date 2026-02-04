import { useCallback, useState } from 'react'
import { useLoginWithSiws, usePrivy } from '@privy-io/expo'
import bs58 from 'bs58'

import { useAccount, useProvider } from '@/lib/appkit'

interface UseWalletAuthOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

interface UseWalletAuthReturn {
  signAndLoginPrivy: () => Promise<boolean>
  isLoading: boolean
  error: string | null
  clearError: () => void
  isPrivyLoggedIn: boolean
}

/**
 * 钱包授权 Hook
 * 处理钱包签名和 Privy 登录
 */
export function useWalletAuth(options: UseWalletAuthOptions = {}): UseWalletAuthReturn {
  const { onSuccess, onError } = options

  const { generateMessage, login: loginWithSiws } = useLoginWithSiws()
  const { user: privyUser } = usePrivy()
  const { address } = useAccount()
  const { provider } = useProvider()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const signAndLoginPrivy = useCallback(async (): Promise<boolean> => {
    if (!address || !provider) {
      const errorMsg = '钱包未连接'
      setError(errorMsg)
      onError?.(errorMsg)
      return false
    }

    // 如果已登录 Privy，直接返回成功
    if (privyUser) {
      console.log('Privy already logged in, skip signing')
      onSuccess?.()
      return true
    }

    setIsLoading(true)
    setError(null)

    try {
      // 1. 生成 SIWS 消息
      const { message } = await generateMessage({
        wallet: { address },
        from: {
          domain: 'mullet.top',
          uri: 'https://mullet.top',
        },
      })

      // 2. 使用 provider 签名消息
      const messageBytes = bs58.encode(new TextEncoder().encode(message))

      const signatureResult = await provider.request({
        method: 'solana_signMessage',
        params: {
          message: messageBytes,
          pubkey: address,
        },
      })

      console.log('Signature result:', signatureResult)

      // Base58 转 Base64
      function base58ToBase64(base58String: string): string {
        const bytes = bs58.decode(base58String)
        const base64String = Buffer.from(bytes).toString('base64')
        return base64String
      }

      // 获取签名
      const signature =
        typeof signatureResult === 'object' && signatureResult !== null
          ? (signatureResult as { signature?: string }).signature ||
            JSON.stringify(signatureResult)
          : String(signatureResult)

      // 3. 使用签名登录 Privy
      await loginWithSiws({
        signature: base58ToBase64(signature),
        message,
        wallet: {
          walletClientType: 'reown',
          connectorType: 'walletConnect',
        },
      })

      console.log('Privy login successful')
      onSuccess?.()
      return true
    } catch (err: any) {
      console.error('Wallet auth failed:', err)
      const errorMsg = err.message || '验证失败'
      setError(errorMsg)
      onError?.(errorMsg)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [address, provider, privyUser, generateMessage, loginWithSiws, onSuccess, onError])

  return {
    signAndLoginPrivy,
    isLoading,
    error,
    clearError,
    isPrivyLoggedIn: !!privyUser,
  }
}
