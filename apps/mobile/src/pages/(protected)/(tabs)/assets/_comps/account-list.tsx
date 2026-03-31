import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import React, { useRef } from 'react'
import { Pressable, View } from 'react-native'
import { useShallow } from 'zustand/react/shallow'

import { AddBalanceDrawer, AddBalanceDrawerRef } from '@/components/drawers/add-balance-drawer'
import {
  TradeSimulateAccountDepositDrawer,
  TradeSimulateAccountDepositDrawerRef,
} from '@/components/drawers/trade-simulate-account-deposit-drawer'
import { EmptyState } from '@/components/states/empty-state'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { IconifyCopy, IconifyPlusCircle, IconifyUserCircle } from '@/components/ui/icons'
import { Spinning } from '@/components/ui/spinning'
import { Text } from '@/components/ui/text'
import { DEPOSIT_SOLANA_CHAIN_ID } from '@/constants/config/deposit'
import { useAccountSynopsis } from '@/hooks/account/use-account-synopsis'
import { useCopyText } from '@/hooks/use-copy-text'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { useDepositAddress } from '@/pages/(protected)/(assets)/deposit/_apis/use-deposit-address'
import { useRootStore } from '@/stores'
import { userInfoRealAccountListSelector, userInfoSimulateAccountListSelector } from '@/stores/user-slice/infoSlice'
import { renderFallback } from '@mullet/utils/fallback'
import { BNumber } from '@mullet/utils/number'
import { formatAddress } from '@mullet/utils/web3'

export const RealAccountList = observer(() => {
  const realAccountList = useRootStore(useShallow(userInfoRealAccountListSelector))

  if (realAccountList.length === 0) {
    return (
      <View className="flex-1 py-[60px]">
        <EmptyState message={<Trans>暂无真实账户</Trans>} />
      </View>
    )
  }

  return (
    <>
      {realAccountList.map((account) => {
        if (!account.enableConnect) return
        return <RealAccountRow key={account.id} account={account} />
      })}
    </>
  )
})

type RealAccountRowProps = {
  account: User.AccountItem
}

const RealAccountRow = observer(({ account }: RealAccountRowProps) => {
  const { textColorContent1, colorBrandSecondary3, colorBrandPrimary } = useThemeColors()
  const addBalanceDrawerRef = useRef<AddBalanceDrawerRef>(null)
  const synopsis = useAccountSynopsis(account.synopsis)

  // 获取钱包地址
  const { data: depositAddressInfo, isLoading: isAddressLoading } = useDepositAddress(
    DEPOSIT_SOLANA_CHAIN_ID,
    account.id,
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
    <>
      <Card>
        <CardContent className="gap-xs">
          {/* Header: User & Badges */}
          <View className="flex-row items-center justify-between">
            <View className="gap-medium flex-row items-center">
              <IconifyUserCircle width={20} height={20} color={textColorContent1} />
              <Text className="text-paragraph-p1 text-content-1">{renderFallback(account.id)}</Text>
            </View>

            <View className="gap-medium flex-row items-center">
              <Badge color="green">
                <Text>
                  <Trans>真实</Trans>
                </Text>
              </Badge>
              <Badge color="default">
                <Text>{synopsis.abbr}</Text>
              </Badge>
            </View>
          </View>

          {/* Balance */}
          <View className="min-h-[24px] flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>账户余额</Trans>
            </Text>
            <View className="gap-xs flex-row items-center">
              <Text className="text-paragraph-p3 text-content-1">
                {BNumber.toFormatNumber(account.money, {
                  unit: account.currencyUnit,
                  volScale: account.currencyDecimal,
                })}
              </Text>

              <Pressable
                onPress={(e) => {
                  e.stopPropagation()
                  addBalanceDrawerRef.current?.open()
                }}
              >
                <IconifyPlusCircle width={14} height={14} color={colorBrandPrimary} />
              </Pressable>
            </View>
          </View>

          {/* Address */}
          <View className="min-h-[24px] flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>地址</Trans>
            </Text>
            <View className="gap-medium flex-row items-center">
              {isAddressLoading ? (
                <Spinning height={16} width={16} />
              ) : (
                <>
                  {renderFallback(
                    <>
                      <Text className="text-paragraph-p3 text-content-1">{formatAddress(walletAddress)}</Text>
                      {walletAddress && (
                        <Pressable onPress={handleCopyAddress} hitSlop={8}>
                          <IconifyCopy width={20} height={20} color={colorBrandSecondary3} />
                        </Pressable>
                      )}
                    </>,
                    { verify: !!walletAddress },
                  )}
                </>
              )}
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Add Balance Drawer */}
      <AddBalanceDrawer ref={addBalanceDrawerRef} accountInfo={account} />
    </>
  )
})

export const SimulateAccountList = observer(() => {
  const simulateAccountList = useRootStore(useShallow(userInfoSimulateAccountListSelector))

  if (simulateAccountList.length === 0) {
    return (
      <View className="flex-1 py-[60px]">
        <EmptyState message={<Trans>暂无模拟账户</Trans>} />
      </View>
    )
  }

  return (
    <>
      {simulateAccountList.map((account) => {
        if (!account.enableConnect) return null
        return <SimulateAccountRow key={account.id} account={account} />
      })}
    </>
  )
})

type SimulateAccountRowProps = {
  account: User.AccountItem
}

const SimulateAccountRow = ({ account }: SimulateAccountRowProps) => {
  const { textColorContent1, colorBrandPrimary } = useThemeColors()

  const synopsis = useAccountSynopsis(account.synopsis)
  const tradeSimulateAccountDepositDrawerRef = useRef<TradeSimulateAccountDepositDrawerRef>(null)
  return (
    <Card>
      <CardContent className="gap-xs">
        {/* Header: User & Badges */}
        <View className="flex-row items-center justify-between">
          <View className="gap-medium flex-row items-center">
            <IconifyUserCircle width={20} height={20} color={textColorContent1} />
            <Text className="text-paragraph-p1 text-content-1">{account.id}</Text>
          </View>

          <View className="gap-medium flex-row items-center">
            <Badge color="secondary">
              <Text>
                <Trans>模拟</Trans>
              </Text>
            </Badge>
            <Badge color="default">
              <Text>{synopsis.abbr}</Text>
            </Badge>
          </View>
        </View>

        {/* Balance */}
        <View className="gap-xs min-h-[24px] flex-row items-center justify-between">
          <Text className="text-paragraph-p3 text-content-4">
            <Trans>账户余额</Trans>
          </Text>
          <>
            <Pressable
              className="gap-xs flex-1 flex-row items-center"
              onPress={() => {
                tradeSimulateAccountDepositDrawerRef.current?.open()
              }}
            >
              <Text className="text-paragraph-p3 text-content-1 flex-1 text-right">
                {BNumber.toFormatNumber(account.money, {
                  unit: account.currencyUnit,
                  volScale: account.currencyDecimal,
                })}
              </Text>

              <IconifyPlusCircle width={14} height={14} color={colorBrandPrimary} />
            </Pressable>

            <TradeSimulateAccountDepositDrawer ref={tradeSimulateAccountDepositDrawerRef} account={account} />
          </>
        </View>
      </CardContent>
    </Card>
  )
}
