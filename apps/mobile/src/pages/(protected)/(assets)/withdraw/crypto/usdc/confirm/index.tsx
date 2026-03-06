import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { Image, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ScreenHeader } from '@/components/ui/screen-header'
import { Text } from '@/components/ui/text'
import { useAccount, useWalletInfo } from '@/lib/appkit'
import { LoginType, useLoginAuthStore } from '@/stores/login-auth'
import { formatAddress, renderFallback } from '@mullet/utils/format'
import { BNumber } from '@mullet/utils/number'

import { useSelectedWithdrawAccount } from '../../../_hooks/use-selected-account'
import { useSelectedChainInfo } from '../../../_hooks/use-selected-chain-info'
import { useWithdrawState } from '../../../_hooks/use-withdraw-state'
import { Web2Confirm } from './_comps/web2-confirm'
import { Web3Confirm } from './_comps/web3-confirm'

const UsdcWithdrawConfirmScreen = observer(function UsdcWithdrawConfirmScreen() {
  const selectedAccount = useSelectedWithdrawAccount()
  const { withdrawAddress, withdrawAmount } = useWithdrawState()
  const { tokenInfo, chainInfo } = useSelectedChainInfo()
  const loginType = useLoginAuthStore((s) => s.loginType)

  // Web3 wallet state
  const { address: connectedWalletAddress } = useAccount()
  const { walletInfo } = useWalletInfo()

  const isConnectedWallet = useMemo(() => {
    if (!connectedWalletAddress || !withdrawAddress) return false
    return connectedWalletAddress.toLowerCase() === withdrawAddress.toLowerCase()
  }, [connectedWalletAddress, withdrawAddress])

  const gasFee = 0.0001 // Mock gas fee
  const serviceFee = 0
  const estimatedReceive = BNumber.from(withdrawAmount).minus(serviceFee).toString()

  return (
    <View className="gap-xl flex-1">
      <ScreenHeader content={<Trans>订单确认</Trans>} />

      <View className="gap-xl flex-1 px-5">
        {/* 付款信息 */}
        <View className="border-brand-default rounded-small px-xl py-medium border">
          <View className="gap-xs">
            <Text className="text-paragraph-p3 text-content-1">
              <Trans>付</Trans>
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="gap-medium flex-row items-center">
                {tokenInfo?.iconUrl && <Image source={{ uri: tokenInfo.iconUrl }} style={{ width: 24, height: 24 }} />}
                <View className="gap-xs">
                  <Text className="text-paragraph-p2 text-content-1">{renderFallback(selectedAccount?.id)}</Text>
                  <Text className="text-paragraph-p3 text-content-4">{formatAddress(withdrawAddress)}</Text>
                </View>
              </View>
              <Text className="text-paragraph-p2 text-content-1">
                {BNumber.toFormatNumber(-withdrawAmount, {
                  positive: false,
                  unit: tokenInfo?.symbol,
                  volScale: tokenInfo?.displayDecimals,
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* 收款信息 */}
        <View className="border-brand-default rounded-small px-xl py-medium border">
          <View className="gap-xs">
            <Text className="text-paragraph-p3 text-content-1">
              <Trans>收</Trans>
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="gap-medium flex-row items-center">
                {isConnectedWallet && walletInfo?.icon && (
                  <Image source={{ uri: walletInfo.icon }} style={{ width: 24, height: 24, borderRadius: 4 }} />
                )}
                <View className="gap-xs">
                  <Text className="text-paragraph-p2 text-content-1">
                    {isConnectedWallet && walletInfo?.name ? walletInfo.name : <Trans>未知钱包</Trans>}
                  </Text>
                  <Text className="text-paragraph-p3 text-content-4">{formatAddress(withdrawAddress)}</Text>
                </View>
              </View>
              <Text className="text-paragraph-p2 text-content-1">
                {BNumber.toFormatNumber(estimatedReceive, {
                  positive: false,
                  forceSign: true,
                  unit: tokenInfo?.symbol,
                  volScale: tokenInfo?.displayDecimals,
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* 交易详情 */}
        <View className="gap-medium">
          <InfoRow label={<Trans>兑换率</Trans>} value="1 : 1" />
          <InfoRow label={<Trans>到账时间</Trans>} value={<Trans>≈1分钟</Trans>} />
          <InfoRow label={<Trans>Gas费</Trans>} value={`${gasFee} ${chainInfo?.shortName === 'SOL' ? 'SOL' : 'ETH'}`} />
          <InfoRow
            label={<Trans>预计到账</Trans>}
            value={BNumber.toFormatNumber(estimatedReceive, {
              unit: tokenInfo?.symbol,
              volScale: tokenInfo?.displayDecimals,
            })}
          />
          <InfoRow label={<Trans>服务费</Trans>} value={<Trans>免费</Trans>} />
        </View>
      </View>

      <SafeAreaView edges={['bottom']}>
        <View className="px-5">{loginType === LoginType.Web3 ? <Web3Confirm /> : <Web2Confirm />}</View>
      </SafeAreaView>
    </View>
  )
})

export default UsdcWithdrawConfirmScreen

function InfoRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-paragraph-p2 text-content-4">{label}</Text>
      <Text className="text-paragraph-p2 text-content-1">{value}</Text>
    </View>
  )
}
