

import { useState, useCallback, useEffect } from 'react'
import { View, Pressable } from 'react-native'
import { Text } from '@/components/ui/text'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import {
  IconifyNavArrowDown,
  IconifyUserCircle,
  IconifyPlusCircle,
} from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Trans } from '@lingui/react/macro'
import { IconButton } from '@/components/ui/button'


import { observer } from 'mobx-react-lite'
import { useStores } from '@/v1/provider/mobxProvider'
import { getAccountSynopsisByLng } from '@/v1/utils/business'
import { BNumber } from '@mullet/utils/number'
import { useGetAccountBalanceCallback } from '@/v1/utils/wsUtil'
import { TradeAccountSwitchDrawer } from '@/components/drawers/trade-account-switch-drawer'


// ============ AccountCard ============
interface AccountCardProps {

}

export const AccountCard = observer(({ }: AccountCardProps) => {
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false)
  const { trade } = useStores()
  const currentAccountInfo = trade.currentAccountInfo
  const synopsis = getAccountSynopsisByLng(currentAccountInfo.synopsis)
  const handleAccountPress = () => {
    setIsAccountDrawerOpen(true)
  }

  const getAccountBalance = useGetAccountBalanceCallback()
  const { availableMargin } = getAccountBalance(trade.currentAccountInfo, trade.positionList)

  return (
    <>
      <Pressable onPress={handleAccountPress}>
        <Card className="border-brand-default bg-button">
          <CardContent className="px-xl py-medium gap-xs">
            {/* Header Row: User Icon + Account ID + Badges + Arrow */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-medium">
                {/* User + ID */}
                <View className="flex-row items-center gap-xs">
                  <IconifyUserCircle width={20} height={20} className='text-content-1' />
                  <Text className="text-paragraph-p2 text-content-1">{currentAccountInfo.id}</Text>
                </View>
                {/* Badges */}
                <View className="flex-row items-center gap-medium">
                  <Badge color={!currentAccountInfo.isSimulate ? 'green' : 'secondary'}>
                    <Text>{!currentAccountInfo.isSimulate ? <Trans>真实</Trans> : <Trans>模拟</Trans>}</Text>
                  </Badge>
                  <Badge color="default">
                    <Text>{synopsis.abbr}</Text>
                  </Badge>
                </View>
              </View>
              <IconifyNavArrowDown width={16} height={16} className='text-content-1' />
            </View>

            {/* Balance Row: Available + Balance + Deposit Icon */}
            <View className="flex-row items-center justify-between">
              <Tooltip title={<Trans>可用</Trans>}>
                <TooltipTrigger><Trans>可用</Trans></TooltipTrigger>
                <TooltipContent><Trans>当前可用于交易的资金余额</Trans></TooltipContent>
              </Tooltip>
              <View className="flex-row items-center gap-xs">
                <Text className="text-paragraph-p3 text-content-1">
                  {BNumber.toFormatNumber(availableMargin, { unit: currentAccountInfo.currencyUnit, volScale: currentAccountInfo.currencyDecimal })}
                </Text>
                <IconButton color='primary'>
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
        selectedAccountId={currentAccountInfo.id}
      />
    </>
  )
})
