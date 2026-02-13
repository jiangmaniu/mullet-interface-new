import { useMutation } from '@tanstack/react-query'
import bs58 from 'bs58'

import { useAccount, useProvider } from '@/lib/appkit'
import { useLoginWithSiws, usePrivy } from '@privy-io/expo'

interface UseWalletAuthOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export class WalletAuthError extends Error {
  public type:
    | 'UserRejected'
    | 'WalletNotConnected'
    | 'WalletConnectError'
    | 'SignatureFailed'
    | 'UnknownSignatureError'
  constructor(
    message: string,
    type: 'UserRejected' | 'WalletNotConnected' | 'WalletConnectError' | 'SignatureFailed' | 'UnknownSignatureError',
  ) {
    super(message)
    this.name = 'WalletAuthError'
    this.type = type
  }
}

/**
 * Base58 转 Base64
 */
function base58ToBase64(base58String: string): string {
  const bytes = bs58.decode(base58String)
  const base64String = Buffer.from(bytes).toString('base64')
  return base64String
}

/**
 * 钱包授权 Hook
 * 处理钱包签名和 Privy 登录
 */
export function useWalletAuth(options: UseWalletAuthOptions = {}) {
  const { onSuccess, onError } = options

  const { generateMessage, login: loginWithSiws } = useLoginWithSiws()
  const { user: privyUser } = usePrivy()
  const { address, chainId } = useAccount()
  const { provider } = useProvider()

  const mutation = useMutation({
    mutationKey: ['auth', 'wallet-sign'],
    retry: 0, // 失败后不自动重试
    mutationFn: async () => {
      if (!address || !provider) {
        throw new WalletAuthError('请先连接钱包', 'WalletNotConnected')
      }

      // 如果已登录 Privy，直接返回成功
      if (privyUser) {
        console.log('Privy already logged in, skip signing')
        return { skipped: true }
      }

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

      const signatureResult = await provider.request(
        {
          method: 'solana_signMessage',
          params: {
            message: messageBytes,
            pubkey: address,
          },
        },
        `solana:${chainId}`,
      )

      console.log('Signature result:', signatureResult)

      // 获取签名
      const signature =
        typeof signatureResult === 'object' && signatureResult !== null
          ? (signatureResult as { signature?: string }).signature || JSON.stringify(signatureResult)
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
      return { skipped: false }
    },
    onSuccess: () => {
      onSuccess?.()
    },
    onError: (err: any) => {
      console.error('Wallet auth failed:', err)

      if (err?.code === 5000) {
        // okx 错误码
        const errorMessage = err.message as string
        if (['请先断开 DApp，再重新连接'].includes(errorMessage)) {
          // 提示用户需要重新连接（"请先断开 DApp，再重新连接"）
          throw new WalletAuthError('请重新接钱包', 'WalletConnectError')
        } else if (['User Reject'].includes(errorMessage)) {
          // 用户拒绝
          throw new WalletAuthError('用户拒绝签名', 'UserRejected')
        }
      }

      onError?.(err.message || '验证失败')
    },
  })

  return {
    signAndLoginPrivy: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    clearError: mutation.reset,
    isPrivyLoggedIn: !!privyUser,
    // 额外暴露 mutation 状态
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
  }
}
