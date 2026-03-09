import { Trans } from '@lingui/react/macro'
import { useEffect, useState } from 'react'
import { Image, Pressable, View } from 'react-native'

import { IconifyEdit } from '@/components/ui/icons'
import { IconifyRefreshDouble } from '@/components/ui/icons/iconify'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { WITHDRAW_SOLANA_CHAIN_ID } from '@/constants/config/deposit'
import { useAccount, useWalletInfo } from '@/lib/appkit'
import { LoginType, useLoginAuthStore } from '@/stores/login-auth'
import { formatAddress } from '@mullet/utils/format'

import { useWithdrawStore } from '../../_store'

type WalletMode = 'connected' | 'manual'

export function WalletSelector() {
  // 从 store 读取状态
  const selectedChainId = useWithdrawStore((s) => s.selectedChainId)
  const toWalletAddress = useWithdrawStore((s) => s.toWalletAddress)
  const setToWalletAddress = useWithdrawStore((s) => s.setToWalletAddress)

  // 获取用户登录类型
  const loginType = useLoginAuthStore((s) => s.loginType)
  const isWeb3Login = loginType === LoginType.Web3

  // 获取当前连接的钱包信息
  const { address: currentWalletAddress, namespace: accountNamespace } = useAccount()
  const { walletInfo } = useWalletInfo()

  // 判断钱包账户链是否是 Solana 链
  const walletAccountChainIsSolana = accountNamespace?.toUpperCase() === WITHDRAW_SOLANA_CHAIN_ID.toUpperCase()
  const isSelectedChainSolana = selectedChainId?.toUpperCase() === WITHDRAW_SOLANA_CHAIN_ID.toUpperCase()

  // 判断是否是 Solana 链：钱包账户链是 Solana 链，且选中的链是 Solana 链（只有 Solana 链才显示切换按钮）
  const isSolanaChain = walletAccountChainIsSolana && isSelectedChainSolana

  // 只有 web3 登录且是 Solana 链时才显示切换按钮
  const showSwitchButton = isWeb3Login && isSolanaChain

  // 钱包模式：connected 表示已连接钱包，manual 表示手动输入
  const [walletMode, setWalletMode] = useState<WalletMode>('manual')

  useEffect(() => {
    setWalletMode(showSwitchButton ? 'connected' : 'manual')
    if (showSwitchButton && currentWalletAddress) {
      setToWalletAddress(currentWalletAddress)
    }
  }, [showSwitchButton, currentWalletAddress, setToWalletAddress])

  const handleSwitchWallet = () => {
    setWalletMode(walletMode === 'connected' ? 'manual' : 'connected')
    if (showSwitchButton && currentWalletAddress) {
      setToWalletAddress(currentWalletAddress)
    }
  }

  const handleAddressChange = (address: string) => {
    setToWalletAddress(address)
  }

  return (
    <View className="gap-medium">
      <View className="flex-row items-center justify-between">
        <Text className="text-paragraph-p3 text-content-4">
          <Trans>接收钱包</Trans>
        </Text>
        {/* 只有 web3 登录且是 Solana 链才显示切换按钮 */}
        {showSwitchButton && (
          <Pressable onPress={handleSwitchWallet} className="gap-xs flex-row items-center">
            <View className="h-4 w-4">
              {walletMode === 'connected' ? (
                <IconifyEdit width={16} height={16} className="text-content-1" />
              ) : (
                <IconifyRefreshDouble width={16} height={16} className="text-content-1" />
              )}
            </View>
            <Text className="text-paragraph-p3 text-content-1">
              {walletMode === 'connected' ? <Trans>输入钱包地址</Trans> : <Trans>授权钱包</Trans>}
            </Text>
          </Pressable>
        )}
      </View>

      {walletMode === 'connected' && isSolanaChain ? (
        <View className="gap-medium flex-row items-center">
          <Image source={{ uri: walletInfo?.icon }} style={{ width: 24, height: 24 }} />
          <View className="flex-1">
            <Text className="text-paragraph-p2 text-content-1">{walletInfo?.name ?? 'Wallet'}</Text>
            <Text className="text-paragraph-p3 text-content-4">{formatAddress(currentWalletAddress)}</Text>
          </View>
        </View>
      ) : (
        <Input
          multiline
          size="md"
          placeholder={<Trans>请输入钱包地址</Trans>}
          value={toWalletAddress}
          onChangeText={handleAddressChange}
        />
      )}
    </View>
  )
}
