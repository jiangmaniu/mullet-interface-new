import { useStores } from "@/v1/provider/mobxProvider"
import { observer } from "mobx-react-lite"
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { IconifyCopy, IconifyPlusCircle, IconifyUserCircle } from '@/components/ui/icons';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';
import React, { useRef } from 'react';
import { View, Pressable } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { EmptyState } from "@/components/states/empty-state";
import { getAccountSynopsisByLng } from "@/v1/utils/business";
import { BNumber } from "@mullet/utils/number";
import { AddBalanceDrawer, AddBalanceDrawerRef } from "@/components/drawers/add-balance-drawer";
import { TradeSimulateAccountDepositDrawer, TradeSimulateAccountDepositDrawerRef } from "@/components/drawers/trade-simulate-account-deposit-drawer";

export const RealAccountList = observer(() => {
  const { user } = useStores()
  const realAccountList = user.currentUser?.accountList?.filter((item) => !item.isSimulate && item.enableConnect) || []

  if (realAccountList.length === 0) {
    return <View className="flex-1 py-[60px]">
      <EmptyState message={<Trans>暂无真实账户</Trans>} />
    </View>
  }

  return (
    <>
      {
        realAccountList.map(account => {
          return <RealAccountRow key={account.id} account={account} />
        })
      }
    </>
  )
})

type RealAccountRowProps = {
  account: User.AccountItem
}

const RealAccountRow = observer(({ account,
}: RealAccountRowProps) => {
  const { textColorContent1, colorBrandSecondary1, colorBrandPrimary } = useThemeColors()
  const addBalanceDrawerRef = useRef<AddBalanceDrawerRef>(null)
  const synopsis = getAccountSynopsisByLng(account.synopsis)

  return (
    <>
      <Card>
        <CardContent className='gap-xs'>
        {/* Header: User & Badges */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-medium">
            <IconifyUserCircle width={20} height={20} color={textColorContent1} />
            <Text className="text-paragraph-p1 text-content-1">{account.id}</Text>
          </View>

          <View className="flex-row items-center gap-medium">
            <Badge color='green'>
              <Text><Trans>真实</Trans></Text>
            </Badge>
            <Badge color='default'>
              <Text>{synopsis.abbr}</Text>
            </Badge>
          </View>
        </View>

        {/* Balance */}
        <View className="flex-row items-center justify-between min-h-[24px]">
          <Text className="text-paragraph-p3 text-content-4"><Trans>账户余额</Trans></Text>
          <View className="flex-row items-center gap-xs">
            <Text className="text-paragraph-p3 text-content-1">{BNumber.toFormatNumber(account.money, { unit: account.currencyUnit, volScale: account.currencyDecimal })}</Text>

            <Pressable onPress={(e) => {
              e.stopPropagation()
              addBalanceDrawerRef.current?.open()
            }}>
              <IconifyPlusCircle width={14} height={14} color={colorBrandPrimary} />
            </Pressable>
          </View>
        </View>

        {/* Address */}
        <View className="flex-row items-center justify-between min-h-[24px]">
          <Text className="text-paragraph-p3 text-content-4"><Trans>地址</Trans></Text>
          <View className="flex-row items-center gap-xs">
            {/* <Text className="text-paragraph-p3 text-content-1">{address}</Text> */}
            <Pressable>
              <IconifyCopy width={20} height={20} color={colorBrandSecondary1} />
            </Pressable>
          </View>
        </View>
      </CardContent>
    </Card>

    {/* Add Balance Drawer */}
    <AddBalanceDrawer
      ref={addBalanceDrawerRef}
      accountInfo={account}
    />
    </>
  )
})

export const SimulateAccountList = observer(() => {
  const { user } = useStores()
  const simulateAccountList = user.currentUser?.accountList?.filter((item) => item.isSimulate && item.enableConnect) || []

  if (simulateAccountList.length === 0) {
    return (
      <View className="flex-1 py-[60px]">
        <EmptyState message={<Trans>暂无模拟账户</Trans>} />
      </View>
    )
  }

  return (
    <>
      {
        simulateAccountList.map(account => {
          return <SimulateAccountRow key={account.id} account={account} />
        })
      }
    </>
  )
})

type SimulateAccountRowProps = {
  account: User.AccountItem
}


const SimulateAccountRow = ({
  account,
}: SimulateAccountRowProps) => {
  const { textColorContent1, colorBrandPrimary } = useThemeColors()

  const synopsis = getAccountSynopsisByLng(account.synopsis)
  const tradeSimulateAccountDepositDrawerRef = useRef<TradeSimulateAccountDepositDrawerRef>(null)
  return (
    // <Pressable onPress={onPress}>
    <Card>
      <CardContent className='gap-xs'>
        {/* Header: User & Badges */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-medium">
            <IconifyUserCircle width={20} height={20} color={textColorContent1} />
            <Text className="text-paragraph-p1 text-content-1">{account.id}</Text>
          </View>

          <View className="flex-row items-center gap-medium">
            <Badge color='secondary'>
              <Text><Trans>模拟</Trans></Text>
            </Badge>
            <Badge color='default'>
              <Text>{synopsis.abbr}</Text>
            </Badge>
          </View>
        </View>

        {/* Balance */}
        <View className="flex-row items-center justify-between gap-xs min-h-[24px]">
          <Text className="text-paragraph-p3 text-content-4"><Trans>账户余额</Trans></Text>
          <View className="flex-row items-center gap-xs flex-1">
            <Text className="flex-1 text-right text-paragraph-p3 text-content-1">{BNumber.toFormatNumber(account.money, { unit: account.currencyUnit, volScale: account.currencyDecimal })}</Text>
            <>
              <Pressable onPress={() => {
                tradeSimulateAccountDepositDrawerRef.current?.open()
              }}>
                <IconifyPlusCircle width={14} height={14} color={colorBrandPrimary} />
              </Pressable>

              <TradeSimulateAccountDepositDrawer
                ref={tradeSimulateAccountDepositDrawerRef}
                account={account}
              />
            </>
          </View>
        </View>
      </CardContent>
    </Card>
    // </Pressable>
  )
}
