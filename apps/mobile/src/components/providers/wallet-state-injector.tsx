import { useEffect } from 'react'
import { useAccount } from '@/lib/appkit'
import { setWalletStateCheckers } from '@/lib/auth-handler'

/**
 * 钱包状态注入器
 * 将钱包连接状态注入到 auth-handler 中
 * 用于 401 处理时判断是否需要重新授权
 */
export function WalletStateInjector({ children }: { children: React.ReactNode }) {
  const { isConnected, address } = useAccount()

  useEffect(() => {
    // 注入钱包状态检查函数
    setWalletStateCheckers(
      () => isConnected,
      () => address ?? null
    )
  }, [isConnected, address])

  return <>{children}</>
}
