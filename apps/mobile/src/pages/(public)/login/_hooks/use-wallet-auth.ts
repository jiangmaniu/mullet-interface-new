import { useMutation } from '@tanstack/react-query'
import bs58 from 'bs58'

import { EXPO_ENV_CONFIG } from '@/constants/expo'
import { useAccount, useAppKit, useSolanaProvider } from '@/lib/appkit'
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
    | 'WalletDisconnected' // OKX 钱包端断开连接
  constructor(
    message: string,
    type:
      | 'UserRejected'
      | 'WalletNotConnected'
      | 'WalletConnectError'
      | 'SignatureFailed'
      | 'UnknownSignatureError'
      | 'WalletDisconnected',
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
  const { address } = useAccount()
  const { signMessage } = useSolanaProvider()
  const { disconnect } = useAppKit()

  const mutation = useMutation({
    mutationKey: ['auth', 'wallet-sign'],
    retry: 0, // 失败后不自动重试
    mutationFn: async () => {
      if (!address || !signMessage) {
        throw new WalletAuthError('请先连接钱包', 'WalletNotConnected')
      }

      // 如果已登录 Privy，直接返回成功
      if (privyUser) {
        // console.log('Privy already logged in, skip signing')
        return { skipped: true }
      }

      // 1. 生成 SIWS 消息
      const { message } = await generateMessage({
        wallet: { address },
        from: {
          domain: new URL(EXPO_ENV_CONFIG.WEBSITE_URL).host,
          uri: EXPO_ENV_CONFIG.WEBSITE_URL,
        },
      })

      // 2. 使用 signMessage 方法签名消息
      const messageBytes = bs58.encode(new TextEncoder().encode(message))

      // Phantom on Android 偶现 -32603 (Internal Error)，
      // 通常因为 WalletConnect session 未完全就绪，重试即可恢复
      const MAX_SIGN_RETRIES = 2
      const SIGN_RETRY_DELAY = 1000
      let signature: string | undefined
      for (let attempt = 0; attempt <= MAX_SIGN_RETRIES; attempt++) {
        try {
          // 刚连接钱包后立刻签名有时失败，添加 300 毫秒延时
          await new Promise((r) => setTimeout(r, 300))
          signature = await signMessage(messageBytes, address)
          break
        } catch (e: any) {
          if (e?.code === -32603 && attempt < MAX_SIGN_RETRIES) {
            console.warn(`solana_signMessage failed with -32603, retrying (${attempt + 1}/${MAX_SIGN_RETRIES})...`)
            await new Promise((resolve) => setTimeout(resolve, SIGN_RETRY_DELAY))
            continue
          }
          // Phantom 特有的内部错误，重试耗尽后提示用户更换钱包
          if (e?.code === -32603 && /Unexpected error/i.test(e?.message)) {
            throw new WalletAuthError('遇到钱包内部错误，请尝试使用其他钱包连接', 'SignatureFailed')
          }
          throw e
        }
      }

      if (!signature) {
        throw new WalletAuthError('签名失败', 'SignatureFailed')
      }

      // console.log('Signature result:', signature)

      // 3. 使用签名登录 Privy
      await loginWithSiws({
        signature: base58ToBase64(signature),
        message,
        wallet: {
          walletClientType: 'reown',
          connectorType: 'walletConnect',
        },
      })

      // console.log('Privy login successful')
      return { skipped: false }
    },
    onSuccess: () => {
      onSuccess?.()
    },
    onError: async (err: any) => {
      console.error('Wallet auth failed:', err)

      // OKX 钱包端断开连接错误（错误码 117）
      if (err?.code === 117 || (err?.code === 5000 && err?.message?.includes('请先断开 DApp，再重新连接'))) {
        // console.log('检测到 OKX 钱包端断开连接，主动断开并提示重新连接')

        // 主动断开前端连接状态
        try {
          disconnect()
        } catch (disconnectErr) {
          console.error('断开连接失败:', disconnectErr)
        }

        // 抛出错误，提示用户重新连接
        const error = new WalletAuthError('钱包连接已断开，请重新连接钱包', 'WalletDisconnected')
        onError?.(error.message)
        throw error
      }

      // OKX 用户拒绝签名
      if (err?.code === 5000 && err?.message === 'User Reject') {
        const error = new WalletAuthError('用户拒绝签名', 'UserRejected')
        onError?.(error.message)
        throw error
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
