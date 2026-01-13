/**
 * TRON Wallet Hook
 * 自动检测并创建 TRON 钱包
 *
 * 使用场景:
 * 1. 登录后自动创建 (email/phone 用户)
 * 2. 在充值/转账对话框中使用
 * 
 * Mode 2 Support:
 * - Server-owned wallets (Authorization Key) are NOT in user.linkedAccounts
 * - We must call backend API to check/create wallets
 */

import { useState, useEffect, useCallback } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { ensureTronWallet, checkTronWallet, getTronWalletFromUser } from '@/services/tronWalletService'
import { useSessionSigner } from './useSessionSigner'

interface UseTronWalletResult {
  tronAddress: string | null
  tronWalletId: string | null
  tronPublicKey: string | null
  isCreating: boolean
  error: string | null
  createWallet: () => Promise<void>
  refetch: () => void
}

/**
 * TRON 钱包管理 Hook
 *
 * 功能:
 * - 自动检测用户是否有 TRON 钱包
 * - 如果没有，自动创建
 * - 提供手动创建方法
 * - 提供刷新方法
 * 
 * @param autoCreate - 是否自动创建钱包
 * @param tradeAccountId - Trade account ID (optional, for unified storage)
 */
export function useTronWallet(autoCreate: boolean = true, tradeAccountId?: string): UseTronWalletResult {
  const { user, authenticated, ready } = usePrivy()

  // 自动添加 Session Signer（当 TRON 钱包创建后）
  useSessionSigner({ autoAdd: true })

  const [tronAddress, setTronAddress] = useState<string | null>(null)
  const [tronWalletId, setTronWalletId] = useState<string | null>(null)
  const [tronPublicKey, setTronPublicKey] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shouldCheck, setShouldCheck] = useState(0) // 用于触发重新检查

  // 从 Privy user 对象获取 TRON 钱包信息
  const updateFromUser = useCallback(() => {
    if (!user) {
      setTronAddress(null)
      setTronWalletId(null)
      setTronPublicKey(null)
      return false
    }

    const tronWallet = getTronWalletFromUser(user)

    if (tronWallet) {
      setTronAddress(tronWallet.address)
      setTronWalletId(tronWallet.walletId)
      setTronPublicKey(tronWallet.publicKey)
      return true
    }

    return false
  }, [user])

  // 创建钱包的方法
  const createWallet = useCallback(async () => {
    if (!authenticated || !ready) {
      console.log('[useTronWallet] Not authenticated or not ready')
      return
    }

    if (isCreating) {
      console.log('[useTronWallet] Already creating wallet')
      return
    }

    // 如果已经有地址了，不再创建
    if (tronAddress) {
      console.log('[useTronWallet] Already have TRON address, skipping creation')
      return
    }

    try {
      setIsCreating(true)
      setError(null)

      console.log('[useTronWallet] Starting TRON wallet creation...')

      const result = await ensureTronWallet(tradeAccountId)

      if (result) {
        console.log('[useTronWallet] ✅ TRON wallet ready:', result.address)
        setTronAddress(result.address)
        setTronWalletId(result.walletId)
        setTronPublicKey(result.publicKey)
      } else {
        // 钱包已存在，触发刷新
        console.log('[useTronWallet] Wallet exists, refreshing user data...')
        setShouldCheck((prev) => prev + 1)
      }
    } catch (err: any) {
      console.error('[useTronWallet] Failed to create wallet:', err)
      setError(err.message || 'Failed to create TRON wallet')
    } finally {
      setIsCreating(false)
    }
  }, [authenticated, ready, isCreating, tronAddress])

  // 刷新钱包信息
  const refetch = useCallback(() => {
    setShouldCheck((prev) => prev + 1)
  }, [])

  // 自动检测和创建
  useEffect(() => {
    if (!authenticated || !ready) {
      return
    }

    // 如果已经有地址了，不再检查
    if (tronAddress) {
      return
    }

    // 先尝试从 user 对象获取（Mode 1 legacy wallets）
    const hasWallet = updateFromUser()

    if (hasWallet) {
      console.log('[useTronWallet] Found existing TRON wallet in user data (Mode 1)')
      return
    }

    // Mode 2: Server-owned wallets are NOT in user.linkedAccounts
    // We need to call the backend API to check/create
    if (autoCreate && !isCreating) {
      console.log('[useTronWallet] No TRON wallet in user data, checking backend API (Mode 2)...')

      // 直接调用 API 检查/创建，不需要延迟
      const checkAndCreate = async () => {
        try {
          setIsCreating(true)
          setError(null)
          
          // 先检查后端是否已有钱包
          console.log('[useTronWallet] Calling checkTronWallet API...')
          const existingWallet = await checkTronWallet(tradeAccountId)
          
          if (existingWallet.exists && existingWallet.address) {
            console.log('[useTronWallet] ✅ Found existing TRON wallet (Mode 2):', existingWallet.address)
            setTronAddress(existingWallet.address)
            setTronWalletId(existingWallet.walletId || null)
            setTronPublicKey(existingWallet.publicKey || null)
            setIsCreating(false)
            return
          }
          
          // 如果不存在，创建新钱包
          console.log('[useTronWallet] No wallet found, calling ensureTronWallet to create...')
          const result = await ensureTronWallet(tradeAccountId)
          
          if (result) {
            console.log('[useTronWallet] ✅ TRON wallet created (Mode 2):', result.address)
            setTronAddress(result.address)
            setTronWalletId(result.walletId)
            setTronPublicKey(result.publicKey)
          }
        } catch (err: any) {
          console.error('[useTronWallet] Failed to check/create wallet:', err)
          setError(err.message || 'Failed to create TRON wallet')
        } finally {
          setIsCreating(false)
        }
      }
      
      checkAndCreate()
    }
  }, [authenticated, ready, autoCreate, isCreating, shouldCheck, tronAddress, updateFromUser])

  return {
    tronAddress,
    tronWalletId,
    tronPublicKey,
    isCreating,
    error,
    createWallet,
    refetch
  }
}
