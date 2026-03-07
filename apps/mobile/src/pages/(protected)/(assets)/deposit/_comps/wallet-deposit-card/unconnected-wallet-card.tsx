import { Trans } from '@lingui/react/macro'
import { useState } from 'react'
import { View } from 'react-native'

import { IconifyWalletSolid } from '@/components/ui/icons/iconify'
import { IconArbitrum } from '@/components/ui/icons/set/arbitrum'
import { IconMetamaskFull } from '@/components/ui/icons/set/wallet/metamask-full'
import { IconOkxWallet } from '@/components/ui/icons/set/wallet/okx-wallet'

import { DepositMethodCard } from '../method-card'
import { ConnectWalletDrawer } from './connect-wallet-drawer'

interface UnconnectedWalletCardProps {
  onConnected: () => void
}

/**
 * 未连接钱包卡片
 * 显示连接提示,点击打开连接抽屉
 */
export function UnconnectedWalletCard({ onConnected }: UnconnectedWalletCardProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handlePress = () => {
    setIsDrawerOpen(true)
  }

  const handleConnected = () => {
    setIsDrawerOpen(false)
    onConnected()
  }

  return (
    <>
      <DepositMethodCard
        icon={<IconifyWalletSolid width={24} height={24} className="text-content-1" />}
        title={<Trans>直连钱包转入</Trans>}
        subtitle={<Trans>最低$5 · 即时</Trans>}
        rightContent={
          <View className="pr-xs flex-row items-center">
            <View className="-mr-1">
              <IconMetamaskFull width={24} height={24} />
            </View>
            <View className="-mr-1">
              <IconOkxWallet width={24} height={24} />
            </View>
            <IconArbitrum width={24} height={24} />
          </View>
        }
        onPress={handlePress}
      />
      <ConnectWalletDrawer
        visible={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onConnected={handleConnected}
      />
    </>
  )
}
