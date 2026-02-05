import { useEffect, useState } from 'react'
import { View, Text, Pressable } from 'react-native'

import { cn } from '@/lib/utils'
import { useAccount } from '@/lib/appkit'
import { useAuthStore } from '@/stores/auth'
import {
  IconOkxWallet,
  IconMetamask,
  IconSolflare,
  IconBinance,
  IconGoogleTiplink,
} from '@/components/ui/icons/set/wallet'
import { Web3LoginDrawer } from './web3-login-drawer'

// 钱包图标组件列表
const WalletIcons = [
  IconOkxWallet,
  IconMetamask,
  IconSolflare,
  IconBinance,
  IconGoogleTiplink,
]

interface Web3LoginSectionProps {
  /** 是否自动授权（用于 401 重定向且钱包已连接的情况） */
  autoAuth?: boolean
}

export function Web3LoginSection({ autoAuth = false }: Web3LoginSectionProps) {
  const { isConnected: isWalletConnected } = useAccount()
  const isBackendAuthenticated = useAuthStore((state) => state.isAuthenticated)

  // Web3 登录抽屉状态
  const [isDrawerVisible, setIsDrawerVisible] = useState(false)
  // 是否需要自动授权（钱包已连接，需要重新签名）
  const [needAutoAuth, setNeedAutoAuth] = useState(false)

  // 处理 autoAuth 参数 - 当 401 重定向且钱包已连接时自动打开抽屉
  useEffect(() => {
    if (autoAuth && isWalletConnected && !isBackendAuthenticated) {
      console.log('Auto auth mode: wallet connected, opening drawer for re-authorization...')
      setNeedAutoAuth(true)
      setIsDrawerVisible(true)
    }
  }, [autoAuth, isWalletConnected, isBackendAuthenticated])

  // 打开 Web3 登录抽屉
  const handleOpenWeb3Login = () => {
    setIsDrawerVisible(true)
  }

  // 关闭抽屉
  const handleCloseDrawer = () => {
    setIsDrawerVisible(false)
    setNeedAutoAuth(false)
  }

  return (
    <View className={cn('w-full')}>
      <Pressable
        onPress={handleOpenWeb3Login}
        className={cn(
          'flex-row', 'items-center', 'justify-between',
          'px-xl', 'py-medium',
          'w-full',
          'border', 'border-brand-default', 'rounded-small',
          'bg-secondary',
          'active:opacity-80'
        )}
      >
        {/* 钱包图标组 */}
        <View className={cn('flex-row', 'items-center')}>
          {WalletIcons.map((Icon, index) => (
            <View
              key={index}
              style={{ marginLeft: index === 0 ? 0 : -4 }}
            >
              <Icon width={24} height={24} />
            </View>
          ))}
        </View>
        {/* 连接钱包文字 */}
        <Text className={cn('text-content-4', 'text-paragraph-p2')}>
          连接钱包
        </Text>
      </Pressable>

      {/* Web3 登录抽屉 */}
      <Web3LoginDrawer
        visible={isDrawerVisible}
        onClose={handleCloseDrawer}
        autoStartAuth={needAutoAuth}
      />
    </View>
  )
}
