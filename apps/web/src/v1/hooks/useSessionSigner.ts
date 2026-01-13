import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
// @ts-ignore - useSessionSigners 可能不在类型定义中
import { useSessionSigners } from '@privy-io/react-auth'
import { PRIVY_SESSION_SIGNER_ID } from '@/constants/config'

interface UseSessionSignerOptions {
  autoAdd?: boolean // 自动添加 Session Signer（当检测到未授权时）
}

// Session Signer hook for TRON wallet
// Enables server-side transaction signing
export function useSessionSigner(options: UseSessionSignerOptions = {}) {
  const { autoAdd = false } = options
  const { user } = usePrivy()
  const { addSessionSigners } = useSessionSigners()
  const [isSessionSignerAdded, setIsSessionSignerAdded] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  // Check if session signer is already added to the TRON wallet
  useEffect(() => {
    checkSessionSigner()
  }, [user])

  // Auto-add session signer if enabled and not added
  useEffect(() => {
    if (autoAdd && user && !isSessionSignerAdded && !isChecking && !isAdding) {
      const tronWallet = user.linkedAccounts?.find((account: any) => account.type === 'wallet' && account.chainType === 'tron') as any

      if (tronWallet && !tronWallet.delegated) {
        console.log('[SessionSigner] Auto-adding session signer...')
        // 延迟 1 秒，确保钱包创建完成
        setTimeout(() => {
          addSessionSigner().catch((err) => {
            console.error('[SessionSigner] Auto-add failed:', err)
          })
        }, 1000)
      }
    }
  }, [autoAdd, user, isSessionSignerAdded, isChecking, isAdding])

  async function checkSessionSigner() {
    if (!user) {
      console.log('[SessionSigner] No user logged in')
      return
    }

    setIsChecking(true)
    try {
      const tronWallet = user.linkedAccounts?.find((account: any) => account.type === 'wallet' && account.chainType === 'tron')

      console.log('[SessionSigner] TRON wallet info:', {
        found: !!tronWallet,
        address: (tronWallet as any)?.address,
        delegated: (tronWallet as any)?.delegated,
        walletId: (tronWallet as any)?.walletId
      })

      if (tronWallet && (tronWallet as any).delegated) {
        console.log('[SessionSigner] Session signer already added')
        setIsSessionSignerAdded(true)
      } else {
        console.log('[SessionSigner] Session signer NOT added yet')
        setIsSessionSignerAdded(false)
      }
    } catch (error) {
      console.error('[SessionSigner] Failed to check session signer:', error)
    } finally {
      setIsChecking(false)
    }
  }

  // Add session signer to the TRON wallet
  async function addSessionSigner() {
    if (!user) {
      throw new Error('User not logged in')
    }

    const tronWallet = user.linkedAccounts?.find((account: any) => account.type === 'wallet' && account.chainType === 'tron') as any

    if (!tronWallet) {
      throw new Error('TRON wallet not found')
    }

    if (tronWallet.delegated) {
      console.log('[SessionSigner] Session signer already added')
      return
    }

    setIsAdding(true)
    try {
      // Get Session Signer ID from config
      const signerId = PRIVY_SESSION_SIGNER_ID
      if (!signerId) {
        throw new Error('PRIVY_SESSION_SIGNER_ID not configured. Please set up Session Signer in constants/config.ts')
      }

      console.log('[SessionSigner] Adding session signer with ID:', signerId)

      // Use Privy React SDK to add session signer
      // This grants the server permission to sign transactions on behalf of the user
      await addSessionSigners({
        address: tronWallet.address,
        signers: [
          {
            signerId: signerId,
            policyIds: [] // No policy restrictions - full permission
          }
        ]
      })

      console.log('[SessionSigner] Session signer added successfully')

      setIsSessionSignerAdded(true)

      // Refresh user data
      await checkSessionSigner()
    } catch (error: any) {
      console.error('[SessionSigner] Failed to add session signer:', error)
      throw new Error(`Failed to add session signer: ${error.message}`)
    } finally {
      setIsAdding(false)
    }
  }

  return {
    isSessionSignerAdded,
    isChecking,
    isAdding,
    addSessionSigner,
    checkSessionSigner
  }
}
