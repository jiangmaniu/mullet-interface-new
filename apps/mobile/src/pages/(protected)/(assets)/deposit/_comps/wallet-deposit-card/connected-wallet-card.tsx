import { Trans } from '@lingui/react/macro'
import { Image, View } from 'react-native'
import { router } from 'expo-router'

import { IconifyWalletSolid } from '@/components/ui/icons'
import { Spinning } from '@/components/ui/spinning'
import { Text } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'
import { useWalletInfo } from '@/lib/appkit'
import { formatAddress } from '@mullet/utils/format'
import { BNumber } from '@mullet/utils/number'

import { useSolanaWalletBalance } from '../../_apis/use-solana-wallet-balance'
import { useDepositState } from '../../_hooks/use-deposit-state'
import { useSelectedDepositAccount } from '../../_hooks/use-selected-account'
import { DepositMethodCard } from '../method-card'

/**
 * 已连接钱包卡片
 * 显示钱包地址和余额,点击进入转账页面
 */
export function ConnectedWalletCard() {
  const { walletInfo } = useWalletInfo()
  const { fromWalletAddress } = useDepositState()
  const selectedAccount = useSelectedDepositAccount()

  // 查询钱包余额
  const { data: balanceData, isLoading } = useSolanaWalletBalance(fromWalletAddress)

  const walletIcon = walletInfo?.icon ? (
    <Image source={{ uri: walletInfo.icon }} style={{ width: 24, height: 24, borderRadius: 4 }} />
  ) : (
    <IconifyWalletSolid className="text-content-1" width={24} height={24} />
  )

  const handlePress = () => {
    // if (isLoading) {
    //   toast.warning(<Trans>正在获取余额...</Trans>)
    //   return
    // }

    router.push('/(assets)/deposit/wallet-transfer')
  }

  return (
    <DepositMethodCard
      icon={walletIcon}
      title={<Text className="text-paragraph-p2 text-content-1">{formatAddress(fromWalletAddress)}</Text>}
      subtitle={
        <View className="flex flex-row items-center">
          <Text className="text-paragraph-p2 text-content-4">
            <Trans>余额</Trans>:{' '}
          </Text>

          {isLoading ? (
            <Spinning width={14} height={14} className="text-content-5" />
          ) : (
            <Text className="text-paragraph-p2 text-content-4">
              {BNumber.toFormatNumber(balanceData?.totalUsdValue, {
                prefix: '≈',
                volScale: selectedAccount?.currencyDecimal,
                unit: selectedAccount?.currencyUnit,
              })}
            </Text>
          )}
        </View>
      }
      onPress={handlePress}
    />
  )
}
