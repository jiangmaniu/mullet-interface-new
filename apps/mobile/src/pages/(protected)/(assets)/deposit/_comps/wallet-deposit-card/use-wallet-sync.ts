import { useEffect } from 'react'

import { useAccount } from '@/lib/appkit'
import { LoginType, useLoginAuthStore } from '@/stores/login-auth'

import { useDepositActions, useDepositState } from '../../_hooks/use-deposit-state'

/**
 * 钱包地址同步 hook
 * 根据登录类型自动同步钱包地址到 deposit store
 *
 * - Web3: 自动同步全局钱包地址
 * - Web2: 清空地址,需要手动连接
 */
export function useWalletSync() {
  const { fromWalletAddress } = useDepositState()
  const { setFromWalletAddress } = useDepositActions()
  const loginType = useLoginAuthStore((s) => s.loginType)
  const { isConnected: isGlobalWalletConnected, address: globalWalletAddress } = useAccount()

  useEffect(() => {
    // Web3 登录或未知登录类型但已连接钱包：同步全局钱包地址
    if (loginType === LoginType.Web3 || (loginType === null && isGlobalWalletConnected)) {
      if (isGlobalWalletConnected && globalWalletAddress) {
        setFromWalletAddress(globalWalletAddress)
      }
    }
    // Web2 登录：清空地址,需要在 ConnectWalletDrawer 中手动连接
    else if (loginType === LoginType.Web2) {
      setFromWalletAddress(null)
    }
  }, [loginType, isGlobalWalletConnected, globalWalletAddress, setFromWalletAddress])

  return {
    fromWalletAddress,
    isWalletConnected: !!fromWalletAddress,
    loginType,
  }
}
