import { router } from 'expo-router'

import { useAccount } from '@/lib/appkit'

import { useDepositAddress } from '../../_hooks/use-deposit-state'
import { ConnectedWalletCard } from './connected-wallet-card'
import { UnconnectedWalletCard } from './unconnected-wallet-card'
import { useWalletSync } from './use-wallet-sync'

/**
 * 钱包入金卡片编排器
 * 根据连接状态渲染不同的子组件
 */
export function WalletDepositCard() {
  // 钱包地址同步（根据登录类型自动处理 Web2/Web3）
  const { depositWalletAddress, isWalletConnected } = useWalletSync()
  const { setDepositWalletAddress } = useDepositAddress()
  const { address: globalWalletAddress } = useAccount()

  const handleConnected = () => {
    // 连接成功后，更新 store 并跳转
    if (globalWalletAddress) {
      setDepositWalletAddress(globalWalletAddress)
    }
    router.push('/(assets)/deposit/wallet-transfer')
  }

  if (isWalletConnected && depositWalletAddress) {
    return <ConnectedWalletCard walletAddress={depositWalletAddress} />
  }

  return <UnconnectedWalletCard onConnected={handleConnected} />
}
