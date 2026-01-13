/**
 * TRON Wallet Service
 * 处理 TRON 钱包的创建和管理
 *
 * Privy Tier 2 TRON Support:
 * - 钱包创建必须通过服务端 API
 * - 客户端 SDK 不支持 TRON 创建
 */

import { request } from '@/utils/request'
import { getAccessToken } from '@privy-io/react-auth'
import { TRON_API_ENDPOINTS } from '@/constants/api'

interface TronWalletResponse {
  address: string
  walletId: string
  chainType: 'tron'
  publicKey: string
  funding?: {
    txid: string
    amount: number
    explorer: string
    message: string
  }
}

interface TronWalletCheckResponse {
  exists: boolean
  address?: string
  walletId?: string
  chainType?: 'tron'
  publicKey?: string
}

/**
 * 创建 TRON 嵌入式钱包
 *
 * Note: Privy's client SDK (useCreateWallet) only supports Tier 3 chains (Ethereum, Solana).
 * For Tier 2 chains like TRON, we must use the server-side SDK via a backend API.
 */
export async function createTronWallet(tradeAccountId?: string): Promise<TronWalletResponse> {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      throw new Error('Failed to get access token')
    }

    console.log('[TronWallet] Creating TRON wallet via server API...')
    console.log('[TronWallet] Endpoint:', TRON_API_ENDPOINTS.CREATE_WALLET)

    const result = await fetch(TRON_API_ENDPOINTS.CREATE_WALLET, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ tradeAccountId })
    })

    if (!result.ok) {
      const errorText = await result.text()
      console.error('[TronWallet] Request failed:', result.status, errorText)
      throw new Error(`Failed to create wallet: ${result.status} ${errorText}`)
    }

    const response = await result.json() as TronWalletResponse

    console.log('[TronWallet] ✅ TRON wallet created:', response.address)
    if (response.funding?.txid) {
      console.log('[TronWallet] 💰 Funded with', response.funding.amount, 'TRX')
      console.log('[TronWallet] 🔗 Explorer:', response.funding.explorer)
    }

    return response
  } catch (error: any) {
    console.error('[TronWallet] Failed to create wallet:', error)
    throw error
  }
}

/**
 * 检查用户是否已有 TRON 钱包
 */
export async function checkTronWallet(tradeAccountId?: string): Promise<TronWalletCheckResponse> {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      throw new Error('No access token available')
    }

    const url = tradeAccountId
      ? `${TRON_API_ENDPOINTS.CHECK_WALLET}?tradeAccountId=${tradeAccountId}`
      : TRON_API_ENDPOINTS.CHECK_WALLET

    console.log('[TronWallet] Checking wallet at:', url)

    const result = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (!result.ok) {
      console.error('[TronWallet] Failed to check wallet:', result.status)
      return { exists: false }
    }

    return await result.json() as TronWalletCheckResponse
  } catch (error) {
    console.error('[TronWallet] Failed to check wallet:', error)
    return { exists: false }
  }
}

/**
 * 确保用户有 TRON 钱包（如果没有则创建）
 *
 * This is called automatically when:
 * 1. User logs in with email/phone (no external wallet)
 * 2. User opens the deposit/transfer dialog
 */
export async function ensureTronWallet(tradeAccountId?: string): Promise<TronWalletResponse | null> {
  try {
    console.log('[TronWallet] Checking for existing TRON wallet...')

    // 先检查是否已有钱包
    const checkResult = await checkTronWallet(tradeAccountId)

    if (checkResult.exists) {
      console.log('[TronWallet] ✅ TRON wallet already exists:', checkResult.address)
      return {
        address: checkResult.address!,
        walletId: checkResult.walletId!,
        chainType: 'tron',
        publicKey: checkResult.publicKey!
      }
    }

    // 如果没有，则创建新钱包
    console.log('[TronWallet] No existing wallet, creating new one...')
    return await createTronWallet(tradeAccountId)
  } catch (error: any) {
    if (error.message === 'WALLET_EXISTS') {
      // 钱包已存在，返回 null 让调用方处理
      return null
    }
    console.error('[TronWallet] Failed to ensure wallet:', error)
    throw error
  }
}

/**
 * 从 Privy user 对象获取 TRON 钱包信息
 */
export function getTronWalletFromUser(user: any): { address: string; walletId: string; publicKey: string } | null {
  if (!user) {
    return null
  }

  // 从 linkedAccounts 查找 TRON 钱包
  const tronAccount = user.linkedAccounts?.find((account: any) => account.type === 'wallet' && account.chainType === 'tron') as any

  if (tronAccount) {
    return {
      address: tronAccount.address,
      walletId: tronAccount.walletId || tronAccount.id,
      publicKey: tronAccount.publicKey
    }
  }

  return null
}
