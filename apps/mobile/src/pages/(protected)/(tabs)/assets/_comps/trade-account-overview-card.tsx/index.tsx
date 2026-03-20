import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { Pressable, TouchableHighlight, View } from 'react-native'
import { useShallow } from 'zustand/react/shallow'

import { TradeAccountSwitchDrawer } from '@/components/drawers/trade-account-switch-drawer'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  IconifyCopy,
  IconifyEye,
  IconifyEyeClosed,
  IconifyNavArrowDown,
  IconifyUserCircle,
} from '@/components/ui/icons'
import { Separator } from '@/components/ui/separator'
import { Spinning } from '@/components/ui/spinning'
import { Text } from '@/components/ui/text'
import { DEPOSIT_SOLANA_CHAIN_ID } from '@/constants/config/deposit'
import { useAccountSynopsis } from '@/hooks/account/use-account-synopsis'
import { useCopyText } from '@/hooks/use-copy-text'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { cn } from '@/lib/utils'
import { useDepositAddress } from '@/pages/(protected)/(assets)/deposit/_apis/use-deposit-address'
import { useRootStore } from '@/stores'
import { userInfoActiveTradeAccountInfoSelector } from '@/stores/user-slice/infoSlice'
import { useGetAccountBalanceCallback } from '@/v1/utils/wsUtil'
import { renderFallback } from '@mullet/utils/fallback'
import { BNumber } from '@mullet/utils/number'
import { formatAddress } from '@mullet/utils/web3'

interface TradeAccountOverviewCardProps {}

export const TradeAccountOverviewCard = observer(({}: TradeAccountOverviewCardProps) => {
  const [isBalanceHidden, setIsBalanceHidden] = useState(false)
  const { textColorContent4, textColorContent1 } = useThemeColors()

  const currentAccountInfo = useRootStore(useShallow(userInfoActiveTradeAccountInfoSelector))
  const isReal = !currentAccountInfo?.isSimulate

  const synopsis = useAccountSynopsis(currentAccountInfo?.synopsis)

  const [isSwitcherVisible, setIsSwitcherVisible] = useState(false)
  const onPressSwitch = () => {
    setIsSwitcherVisible(true)
  }

  const getAccountBalance = useGetAccountBalanceCallback()
  const { balance, availableMargin, totalProfit, occupyMargin } = getAccountBalance(currentAccountInfo, undefined)

  // 获取钱包地址
  const { data: depositAddressInfo, isLoading: isAddressLoading } = useDepositAddress(
    DEPOSIT_SOLANA_CHAIN_ID,
    currentAccountInfo?.id,
  )
  const walletAddress = depositAddressInfo?.address

  // 复制地址
  const copyText = useCopyText()
  const handleCopyAddress = () => {
    if (walletAddress) {
      copyText(walletAddress)
    }
  }

  return (
    <Card className="px-xl py-2xl gap-xl">
      {/* 账户信息 */}
      <>
        <TouchableHighlight onPress={onPressSwitch} underlayColor="transparent">
          <View className="gap-2xl bg-special rounded-small px-xl py-xs h-8 flex-row items-center justify-between">
            <View className="gap-medium flex-row items-center">
              <View className="gap-xs flex-row items-center">
                <IconifyUserCircle width={20} height={20} className="text-content-1" />
                <Text className="text-content-1 text-paragraph-p2">{currentAccountInfo?.id}</Text>
              </View>
              <Badge color={isReal ? 'rise' : 'secondary'}>
                <Text>{isReal ? <Trans>真实</Trans> : <Trans>模拟</Trans>}</Text>
              </Badge>
              <Badge>
                <Text>{synopsis.abbr}</Text>
              </Badge>
            </View>
            <IconifyNavArrowDown width={16} height={16} className="text-content-1" />
          </View>
        </TouchableHighlight>

        <TradeAccountSwitchDrawer
          selectedAccountId={currentAccountInfo?.id}
          visible={isSwitcherVisible}
          onClose={() => setIsSwitcherVisible(false)}
        />
      </>

      {/* 资产信息 */}
      <View className="gap-xl">
        <View className="flex-col gap-1">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text className="text-paragraph-p2 text-content-4">
                <Trans>资产净值</Trans>
              </Text>
              <Pressable onPress={() => setIsBalanceHidden(!isBalanceHidden)}>
                {isBalanceHidden ? (
                  <IconifyEyeClosed width={16} height={16} color={textColorContent4} />
                ) : (
                  <IconifyEye width={16} height={16} color={textColorContent4} />
                )}
              </Pressable>
            </View>
            {isAddressLoading ? (
              <Spinning height={16} width={16} />
            ) : (
              walletAddress && (
                <Pressable onPress={handleCopyAddress} hitSlop={8}>
                  <View className="gap-medium flex-row items-center">
                    <Text className="text-paragraph-p2 text-content-4">
                      {renderFallback(formatAddress(walletAddress))}
                    </Text>
                    <IconifyCopy width={20} height={20} color={textColorContent1} />
                  </View>
                </Pressable>
              )
            )}
          </View>

          <View className="flex-row items-end justify-between">
            <View className="gap-medium flex-row items-baseline">
              <Text className="text-title-h3 text-content-1">
                {isBalanceHidden
                  ? '******'
                  : `${BNumber.toFormatNumber(balance, { volScale: currentAccountInfo?.currencyDecimal })}`}
              </Text>
              <Text className="text-paragraph-p2 text-content-1">{currentAccountInfo?.currencyUnit}</Text>
            </View>
            <Text
              className={cn(
                'text-paragraph-p2',
                BNumber.from(totalProfit).gt(0)
                  ? 'text-market-rise'
                  : BNumber.from(totalProfit).lt(0)
                    ? 'text-market-fall'
                    : 'text-content-1',
              )}
            >
              {isBalanceHidden
                ? '******'
                : `${BNumber.toFormatNumber(totalProfit, {
                    unit: currentAccountInfo?.currencyUnit,
                    volScale: currentAccountInfo?.currencyDecimal,
                    positive: false,
                    forceSign: true,
                  })}`}
            </Text>
          </View>
        </View>
      </View>

      {/* 分割线 */}
      <Separator />

      {/* 详情列表 */}
      <View className="gap-xs">
        <View className="flex-row items-center justify-between">
          <Text className="text-paragraph-p3 text-content-4">
            <Trans>账户余额</Trans>
          </Text>
          <Text className="text-paragraph-p3 text-content-1">
            {isBalanceHidden
              ? '******'
              : `${BNumber.toFormatNumber(currentAccountInfo?.money, { unit: currentAccountInfo?.currencyUnit, volScale: currentAccountInfo?.currencyDecimal })}`}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-paragraph-p3 text-content-4">
            <Trans>可用保证金</Trans>
          </Text>
          <Text className="text-paragraph-p3 text-content-1">
            {isBalanceHidden
              ? '******'
              : `${BNumber.toFormatNumber(availableMargin, { unit: currentAccountInfo?.currencyUnit, volScale: currentAccountInfo?.currencyDecimal })}`}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-paragraph-p3 text-content-4">
            <Trans>占用保证金</Trans>
          </Text>
          <Text className="text-paragraph-p3 text-content-1">
            {isBalanceHidden
              ? '******'
              : `${BNumber.toFormatNumber(occupyMargin, { unit: currentAccountInfo?.currencyUnit, volScale: currentAccountInfo?.currencyDecimal })}`}
          </Text>
        </View>
      </View>
    </Card>
  )
})
