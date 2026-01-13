/**
 * Server Wallet Service
 * Generic service for creating server-owned wallets on multiple chains
 * 
 * Supported chains:
 * - ethereum
 * - arbitrum
 * - bsc
 * - base
 * - polygon
 * 
 * For TRON, use tronWalletService
 * For Solana, use solanaWalletService (or this service, both work)
 */

import { getAccessToken } from '@privy-io/react-auth'

const API_BASE = process.env.BACKEND_API_URL || 'https://api.mulletfinance.xyz'

export type SupportedChain = 'ethereum' | 'arbitrum' | 'bsc' | 'base' | 'polygon' | 'tron' | 'solana'

interface WalletResponse {
  address: string
  walletId: string
  chain: string
  chainType: string
  existing?: boolean
}

interface CheckWalletResponse {
  exists: boolean
  address?: string
  walletId?: string
  chain: string
  chainType?: string
}

interface AllWalletsResponse {
  userId: string
  wallets: Array<{
    chain: string
    address: string | null
    walletId: string | null
  }>
}

/**
 * Create a server-owned wallet for a specific chain
 * @param chain - The chain to create wallet for
 * @param tradeAccountId - Trade account ID (required for ALL chains)
 */
export async function createServerWallet(chain: SupportedChain, tradeAccountId?: string): Promise<WalletResponse> {
  const token = await getAccessToken()
  
  if (!token) {
    throw new Error('Not authenticated - please login first')
  }

  // 🔥 All chains require tradeAccountId now
  if (!tradeAccountId) {
    throw new Error('tradeAccountId is required for wallet creation')
  }

  // TRON has its own endpoint
  if (chain === 'tron') {
    const response = await fetch(`${API_BASE}/api/tron-wallet/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ tradeAccountId }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `Failed to create TRON wallet: ${response.status}`)
    }

    const data = await response.json()
    return {
      address: data.address,
      walletId: data.walletId,
      chain: 'tron',
      chainType: 'tron',
      existing: data.existing,
    }
  }

  // Solana has its own endpoint
  if (chain === 'solana') {
    const response = await fetch(`${API_BASE}/api/solana-wallet/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ tradeAccountId }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `Failed to create Solana wallet: ${response.status}`)
    }

    const data = await response.json()
    return {
      address: data.address,
      walletId: data.walletId,
      chain: 'solana',
      chainType: 'solana',
      existing: data.existing,
    }
  }

  // Generic server-wallet endpoint for other EVM chains
  console.log(`[serverWalletService] Creating EVM wallet for chain: ${chain}, tradeAccountId: ${tradeAccountId}`)
  const response = await fetch(`${API_BASE}/api/server-wallet/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ chain, tradeAccountId }),
  })

  console.log(`[serverWalletService] Create response status: ${response.status}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    console.error(`[serverWalletService] Create failed:`, error)
    throw new Error(error.error || `Failed to create ${chain} wallet: ${response.status}`)
  }

  const data = await response.json()
  console.log(`[serverWalletService] Create result:`, data)
  return data
}

/**
 * Check if user has a server-owned wallet for a specific chain
 * @param chain - The chain to check
 * @param tradeAccountId - Trade account ID (required for ALL chains)
 */
export async function checkServerWallet(chain: SupportedChain, tradeAccountId?: string): Promise<CheckWalletResponse> {
  const token = await getAccessToken()
  
  if (!token) {
    throw new Error('Not authenticated - please login first')
  }

  // 🔥 All chains require tradeAccountId now
  if (!tradeAccountId) {
    throw new Error('tradeAccountId is required for wallet check')
  }

  // TRON has its own endpoint
  if (chain === 'tron') {
    const response = await fetch(`${API_BASE}/api/tron-wallet/check?tradeAccountId=${tradeAccountId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `Failed to check TRON wallet: ${response.status}`)
    }

    const data = await response.json()
    return {
      exists: data.exists || !!data.address,
      address: data.address,
      walletId: data.walletId,
      chain: 'tron',
      chainType: 'tron',
    }
  }

  // Solana has its own endpoint  
  if (chain === 'solana') {
    const response = await fetch(`${API_BASE}/api/solana-wallet/check?tradeAccountId=${tradeAccountId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `Failed to check Solana wallet: ${response.status}`)
    }

    const data = await response.json()
    return {
      exists: data.exists || !!data.address,
      address: data.address,
      walletId: data.walletId,
      chain: 'solana',
      chainType: 'solana',
    }
  }

  // Generic server-wallet endpoint for other EVM chains
  console.log(`[serverWalletService] Checking EVM wallet for chain: ${chain}, tradeAccountId: ${tradeAccountId}`)
  const response = await fetch(`${API_BASE}/api/server-wallet/check?chain=${chain}&tradeAccountId=${tradeAccountId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  console.log(`[serverWalletService] Check response status: ${response.status}`)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    console.error(`[serverWalletService] Check failed:`, error)
    throw new Error(error.error || `Failed to check ${chain} wallet: ${response.status}`)
  }

  const data = await response.json()
  console.log(`[serverWalletService] Check result:`, data)
  return data
}

/**
 * Get all server-owned wallets for current user
 */
export async function getAllServerWallets(): Promise<AllWalletsResponse> {
  const token = await getAccessToken()
  
  if (!token) {
    throw new Error('Not authenticated - please login first')
  }

  const response = await fetch(`${API_BASE}/api/server-wallet/all`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `Failed to get wallets: ${response.status}`)
  }

  return response.json()
}

/**
 * Ensure user has a server wallet for a specific chain
 * Returns existing wallet or creates new one
 * @param chain - The chain
 * @param tradeAccountId - Trade account ID (required for solana)
 */
export async function ensureServerWallet(chain: SupportedChain, tradeAccountId?: string): Promise<WalletResponse | null> {
  try {
    // First check if wallet exists
    const checkResult = await checkServerWallet(chain, tradeAccountId)
    
    if (checkResult.exists && checkResult.address) {
      console.log(`[ServerWallet] Found existing ${chain} wallet:`, checkResult.address)
      return {
        address: checkResult.address,
        walletId: checkResult.walletId || '',
        chain,
        chainType: checkResult.chainType || chain,
        existing: true,
      }
    }

    // Create new wallet
    console.log(`[ServerWallet] Creating new ${chain} wallet...`)
    return await createServerWallet(chain, tradeAccountId)
  } catch (error) {
    console.error(`[ServerWallet] Error ensuring ${chain} wallet:`, error)
    throw error
  }
}
