import { Trans } from '@lingui/react/macro'
import { useRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useShallow } from 'zustand/react/shallow'

import { AddBalanceDrawer, AddBalanceDrawerRef } from '@/components/drawers/add-balance-drawer'
import { TradeAccountSwitchDrawer } from '@/components/drawers/trade-account-switch-drawer'
import { Badge } from '@/components/ui/badge'
import { IconButton } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { IconifyNavArrowDown, IconifyPlusCircle, IconifyUserCircle } from '@/components/ui/icons'
import { Text } from '@/components/ui/text'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAccountSynopsis } from '@/hooks/account/use-account-synopsis'
import { useRootStore } from '@/stores'
import { tradePositionListSelector } from '@/stores/trade-slice/position-slice'
import { userInfoActiveTradeAccountInfoSelector } from '@/stores/user-slice/infoSlice'
import { useGetAccountBalanceCallback } from '@/v1/utils/wsUtil'
import { BNumber } from '@mullet/utils/number'

// ============ AccountCard ============
interface AccountCardProps {}

export const AccountCard = ({}: AccountCardProps) => {
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false)
  const addBalanceDrawerRef = useRef<AddBalanceDrawerRef>(null)
  const positionList = useRootStore(useShallow(tradePositionListSelector))
  const currentAccountInfo = useRootStore(useShallow(userInfoActiveTradeAccountInfoSelector))
  const synopsis = useAccountSynopsis(currentAccountInfo?.synopsis)
  const handleAccountPress = () => {
    setIsAccountDrawerOpen(true)
  }

  const getAccountBalance = useGetAccountBalanceCallback()
  const { availableMargin } = getAccountBalance(currentAccountInfo, positionList)

  return (
    <>
      <Pressable onPress={handleAccountPress}>
        <Card className="border-brand-default bg-button">
          <CardContent className="px-xl py-medium gap-xs">
            {/* Header Row: User Icon + Account ID + Badges + Arrow */}
            <View className="flex-row items-center justify-between">
              <View className="gap-medium flex-row items-center">
                {/* User + ID */}
                <View className="gap-xs flex-row items-center">
                  <IconifyUserCircle width={20} height={20} className="text-content-1" />
                  <Text className="text-paragraph-p2 text-content-1">{currentAccountInfo?.id}</Text>
                </View>
                {/* Badges */}
                <View className="gap-medium flex-row items-center">
                  <Badge color={!currentAccountInfo?.isSimulate ? 'green' : 'secondary'}>
                    <Text>{!currentAccountInfo?.isSimulate ? <Trans>真实</Trans> : <Trans>模拟</Trans>}</Text>
                  </Badge>
                  <Badge color="default">
                    <Text>{synopsis.abbr}</Text>
                  </Badge>
                </View>
              </View>
              <IconifyNavArrowDown width={16} height={16} className="text-content-1" />
            </View>

            {/* Balance Row: Available + Balance + Deposit Icon */}
            <View className="flex-row items-center justify-between">
              <Tooltip title={<Trans>可用</Trans>}>
                <TooltipTrigger>
                  <Trans>可用</Trans>
                </TooltipTrigger>
                <TooltipContent>
                  <Trans>当前可用于交易的资金余额</Trans>
                </TooltipContent>
              </Tooltip>
              <View className="gap-xs flex-row items-center">
                <Text className="text-paragraph-p3 text-content-1">
                  {BNumber.toFormatNumber(availableMargin, {
                    unit: currentAccountInfo?.currencyUnit,
                    volScale: currentAccountInfo?.currencyDecimal,
                  })}
                </Text>
                <IconButton
                  color="primary"
                  onPress={(e) => {
                    e.stopPropagation()
                    addBalanceDrawerRef.current?.open()
                  }}
                >
                  <IconifyPlusCircle width={14} height={14} />
                </IconButton>
              </View>
            </View>
          </CardContent>
        </Card>
      </Pressable>

      {/* Account Selection Drawer */}
      <TradeAccountSwitchDrawer
        visible={isAccountDrawerOpen}
        onClose={() => setIsAccountDrawerOpen(false)}
        selectedAccountId={currentAccountInfo?.id}
      />

      {/* Add Balance Drawer */}
      {currentAccountInfo && <AddBalanceDrawer ref={addBalanceDrawerRef} accountInfo={currentAccountInfo} />}
    </>
  )
}
