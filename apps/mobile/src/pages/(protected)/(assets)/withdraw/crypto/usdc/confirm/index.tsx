import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { Image, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { AvatarImage } from '@/components/ui/avatar'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Text } from '@/components/ui/text'
import { USDC_TOKEN_SYMBOL } from '@/constants/config/deposit'
import { useAccount, useWalletInfo } from '@/lib/appkit'
import { LoginType, useLoginAuthStore } from '@/stores/login-auth'
import { getImgSource } from '@/utils/img'
import { renderFallback } from '@mullet/utils/format'
import { BNumber } from '@mullet/utils/number'
import { formatAddress } from '@mullet/utils/web3'

import { useWithdrawEstimate } from '../../../_apis/use-withdraw-estimate'
import { useSelectedWithdrawAccount } from '../../../_hooks/use-selected-account'
import { useSelectedChainInfo } from '../../../_hooks/use-selected-chain-info'
import { useWithdrawState } from '../../../_hooks/use-withdraw-state'
import { Web2Confirm } from './_comps/web2-confirm'
import { Web3Confirm } from './_comps/web3-confirm'

const UsdcWithdrawConfirmScreen = observer(function UsdcWithdrawConfirmScreen() {
  const selectedAccount = useSelectedWithdrawAccount()
  const { toWalletAddress, withdrawAmount, fromWalletAddress } = useWithdrawState()
  const { tokenInfo, chainInfo } = useSelectedChainInfo()
  const loginType = useLoginAuthStore((s) => s.loginType)

  // Web3 wallet state
  const { address: connectedWalletAddress } = useAccount()
  const { walletInfo } = useWalletInfo()

  // 获取出金手续费估算
  const { data: estimateData } = useWithdrawEstimate(
    {
      amount: BNumber.from(withdrawAmount).toNumber(),
      toChain: chainInfo?.chainId || '',
      token: tokenInfo?.symbol || '',
    },
    !!withdrawAmount && !!chainInfo?.chainId && !!tokenInfo?.symbol,
  )

  const isConnectedWallet = useMemo(() => {
    if (!connectedWalletAddress || !toWalletAddress) return false
    return connectedWalletAddress.toLowerCase() === toWalletAddress.toLowerCase()
  }, [connectedWalletAddress, toWalletAddress])

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
                  <Text className="text-paragraph-p3 text-content-4">{formatAddress(fromWalletAddress)}</Text>
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
                <AvatarImage source={getImgSource(walletInfo?.icon)} className="size-6 rounded-full" />
                <View className="gap-xs">
                  <Text className="text-paragraph-p2 text-content-1">
                    {isConnectedWallet && walletInfo?.name ? walletInfo.name : <Trans>未知钱包</Trans>}
                  </Text>
                  <Text className="text-paragraph-p3 text-content-4">{formatAddress(toWalletAddress)}</Text>
                </View>
              </View>
              <Text className="text-paragraph-p2 text-content-1">
                {BNumber.toFormatNumber(withdrawAmount, {
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
          <InfoRow
            label={<Trans>兑换率</Trans>}
            value="1 : 1"
            // TODO: 兑换率计算
            // value={`1 : ${BNumber.toFormatNumber(
            //   BNumber.from(estimateData?.estimatedReceiveAmount)?.dividedBy(withdrawAmount),
            //   {
            //     volScale: 2,
            //   },
            // )}`}
          />

          <InfoRow label={<Trans>到账时间</Trans>} value={estimateData?.estimatedTime} />
          <InfoRow
            label={<Trans>Gas费</Trans>}
            value={`${estimateData?.networkFee} ${estimateData?.feeToken} ≈ ${estimateData?.networkFeeUsdc} ${USDC_TOKEN_SYMBOL}`}
          />
          <InfoRow
            label={<Trans>预计到账</Trans>}
            value={BNumber.toFormatNumber(estimateData?.estimatedReceiveAmount, {
              unit: tokenInfo?.symbol,
              volScale: tokenInfo?.displayDecimals,
            })}
          />
          <InfoRow
            label={<Trans>服务费</Trans>}
            value={
              BNumber.from(estimateData?.serviceFee)?.eq(0) ? (
                <Trans>免费</Trans>
              ) : (
                BNumber.toFormatNumber(estimateData?.serviceFee, {
                  unit: USDC_TOKEN_SYMBOL,
                })
              )
            }
          />
        </View>
      </View>

      <SafeAreaView edges={['bottom']}>
        <View className="px-5 py-8">{loginType === LoginType.Web3 ? <Web3Confirm /> : <Web2Confirm />}</View>
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
