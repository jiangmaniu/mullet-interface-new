import { Trans } from '@lingui/react/macro'
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
import {
  useAccountAvailableMargin,
  useAccountNetAssets,
  useAccountOccupiedMargin,
} from '@/hooks/account/use-account-balance'
import { useAccountSynopsis } from '@/hooks/account/use-account-synopsis'
import { usePositionTotalPnlInfo } from '@/hooks/trade/use-position-pnl'
import { useCopyText } from '@/hooks/use-copy-text'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { cn } from '@/lib/utils'
import { useDepositAddress } from '@/pages/(protected)/(assets)/deposit/_apis/use-deposit-address'
import { useRootStore } from '@/stores'
import { tradePositionListSelector } from '@/stores/trade-slice/position-slice'
import { UserAccountInfo, userInfoActiveTradeAccountInfoSelector } from '@/stores/user-slice/infoSlice'
import { renderFallback } from '@mullet/utils/fallback'
import { BNumber } from '@mullet/utils/number'
import { formatAddress } from '@mullet/utils/web3'

const BalanceHiddenFallback = '******'

export const TradeAccountOverviewCard = () => {
  const [isBalanceHidden, setIsBalanceHidden] = useState(false)
  const { textColorContent4, textColorContent1 } = useThemeColors()

  const currentAccountInfo = useRootStore(useShallow(userInfoActiveTradeAccountInfoSelector))
  const isReal = !currentAccountInfo?.isSimulate

  const synopsis = useAccountSynopsis(currentAccountInfo?.synopsis)

  const [isSwitcherVisible, setIsSwitcherVisible] = useState(false)
  const onPressSwitch = () => {
    setIsSwitcherVisible(true)
  }

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
              {isBalanceHidden ? (
                <Text className="text-title-h3 text-content-1">{BalanceHiddenFallback}</Text>
              ) : (
                <AccountNetAssets accountInfo={currentAccountInfo} />
              )}

              <Text className="text-paragraph-p2 text-content-1">{currentAccountInfo?.currencyUnit}</Text>
            </View>

            {isBalanceHidden ? (
              <Text className="text-title-h3 text-content-1">{BalanceHiddenFallback}</Text>
            ) : (
              <AccountTotalPnl accountInfo={currentAccountInfo} />
            )}
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
              ? BalanceHiddenFallback
              : `${BNumber.toFormatNumber(currentAccountInfo?.money, { unit: currentAccountInfo?.currencyUnit, volScale: currentAccountInfo?.currencyDecimal })}`}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-paragraph-p3 text-content-4">
            <Trans>可用保证金</Trans>
          </Text>

          {isBalanceHidden ? (
            <Text className="text-paragraph-p3 text-content-1">{BalanceHiddenFallback}</Text>
          ) : (
            <AccountAvailableMargin accountInfo={currentAccountInfo} />
          )}
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-paragraph-p3 text-content-4">
            <Trans>占用保证金</Trans>
          </Text>
          {isBalanceHidden ? (
            <Text className="text-paragraph-p3 text-content-1">{BalanceHiddenFallback}</Text>
          ) : (
            <AccountOccupiedMargin accountInfo={currentAccountInfo} />
          )}
        </View>
      </View>
    </Card>
  )
}

const AccountAvailableMargin = ({ accountInfo }: { accountInfo?: UserAccountInfo }) => {
  const availableMargin = useAccountAvailableMargin(accountInfo?.id)

  return (
    <Text className="text-content-1 text-paragraph-p2">
      {`${BNumber.toFormatNumber(availableMargin, { unit: accountInfo?.currencyUnit, volScale: accountInfo?.currencyDecimal })}`}
    </Text>
  )
}

const AccountTotalPnl = ({ accountInfo }: { accountInfo?: UserAccountInfo }) => {
  const positionList = useRootStore(useShallow(tradePositionListSelector))
  const totalPnlInfo = usePositionTotalPnlInfo({ positionList })

  return (
    <>
      <Text
        className={cn(
          'text-paragraph-p2',
          totalPnlInfo?.isProfit ? 'text-market-rise' : totalPnlInfo?.isLoss ? 'text-market-fall' : 'text-content-1',
        )}
      >
        {BNumber.toFormatNumber(totalPnlInfo?.pnl, {
          unit: accountInfo?.currencyUnit,
          volScale: accountInfo?.currencyDecimal,
          positive: false,
          forceSign: true,
        })}
      </Text>
    </>
  )
}

const AccountNetAssets = ({ accountInfo }: { accountInfo?: UserAccountInfo }) => {
  const netAssets = useAccountNetAssets(accountInfo?.id)

  return (
    <Text className="text-content-1 text-title-h3">
      {BNumber.toFormatNumber(netAssets, { volScale: accountInfo?.currencyDecimal })}
    </Text>
  )
}

const AccountOccupiedMargin = ({ accountInfo }: { accountInfo?: UserAccountInfo }) => {
  const occupiedMargin = useAccountOccupiedMargin(accountInfo?.id)

  return (
    <Text className="text-content-1 text-paragraph-p2">
      {BNumber.toFormatNumber(occupiedMargin, {
        unit: accountInfo?.currencyUnit,
        volScale: accountInfo?.currencyDecimal,
      })}
    </Text>
  )
}
