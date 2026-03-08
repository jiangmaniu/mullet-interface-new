import { router } from 'expo-router'

import { useAccount } from '@/lib/appkit'

import { useDepositActions } from '../../_hooks/use-deposit-state'
import { ConnectedWalletCard } from './connected-wallet-card'
import { UnconnectedWalletCard } from './unconnected-wallet-card'
import { useWalletSync } from './use-wallet-sync'

/**
 * 钱包入金卡片编排器
 * 根据连接状态渲染不同的子组件
 */
export function WalletDepositCard() {
  // 钱包地址同步（根据登录类型自动处理 Web2/Web3）
  const { fromWalletAddress, isWalletConnected } = useWalletSync()

  if (isWalletConnected && fromWalletAddress) {
    // 已连接钱包卡片
    return <ConnectedWalletCard />
  }

  // 未连接钱包卡片
  return <UnconnectedWalletCard />
}
