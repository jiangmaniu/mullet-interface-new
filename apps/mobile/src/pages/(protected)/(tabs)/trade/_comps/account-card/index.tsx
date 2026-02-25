

import { useState, useCallback, useEffect } from 'react'
import { View, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Text } from '@/components/ui/text'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import {
  IconifyActivity,
  IconifyCandlestickChart,
  IconifyMoreHoriz,
  IconifyNavArrowDownSolid,
  IconifyNavArrowDown,
  IconifyUserCircle,
  IconifyPlusCircle,
  IconifyPage,
  IconNavArrowSuperior,
  IconNavArrowDown,
  IconifyNavArrowRight,
} from '@/components/ui/icons'
import { EmptyState } from '@/components/states/empty-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScreenHeader } from '@/components/ui/screen-header'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Trans } from '@lingui/react/macro'
import { IconButton, Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CollapsibleTab,
  CollapsibleTabScene,
  CollapsibleStickyHeader,
  CollapsibleStickyNavBar,
  CollapsibleStickyContent,
  CollapsibleScrollView,
} from '@/components/ui/collapsible-tab'
import { Input } from '@/components/ui/input'
import { t } from '@/locales/i18n'
import { Switch } from '@/components/ui/switch'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import * as AccordionPrimitive from '@rn-primitives/accordion'
import {
  AccountSwitchDrawer,
  type Account,
} from '@/components/drawers/account-switch-drawer'
import { observer } from 'mobx-react-lite'
import account from '@/pages/(protected)/(assets)/account'
import { useStores } from '@/v1/provider/mobxProvider'
import { getAccountSynopsisByLng } from '@/v1/utils/business'
import { BNumber } from '@mullet/utils/number'
import { useGetAccountBalanceCallback } from '@/v1/utils/wsUtil'




// ============ Interfaces ============
interface AccountInfo {
  id: string
  type: string
  balance: string
  currency: string
  isReal: boolean
}

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




  const handleAccountSelect = useCallback((account: Account) => {
    // setSelectedAccount({
    //   id: account.id,
    //   type: account.type,
    //   balance: account.balance,
    //   currency: account.currency,
    //   isReal: account.isReal ?? true,
    // })
  }, [])

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
                  <Text className="text-paragraph-p2 text-content-1">{currentAccountInfo.name}</Text>
                </View>
                {/* Badges */}
                <View className="flex-row items-center gap-medium">
                  <Badge color={currentAccountInfo.isSimulate ? 'green' : 'secondary'}>
                    <Text>{currentAccountInfo.isSimulate ? <Trans>真实</Trans> : <Trans>模拟</Trans>}</Text>
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
      {/* <AccountSwitchDrawer
        visible={isAccountDrawerOpen}
        onClose={() => setIsAccountDrawerOpen(false)}
        selectedAccountId={selectedAccount.id}
        onSwitch={handleAccountSelect}
      /> */}
    </>
  )
})
