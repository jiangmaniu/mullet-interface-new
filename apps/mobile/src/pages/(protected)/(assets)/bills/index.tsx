import { Trans } from '@lingui/react/macro'
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import type { Route } from 'react-native-tab-view'

import { RealAccountSelectionDrawer } from '@/components/drawers/real-account-selector-drawer'
import { Badge } from '@/components/ui/badge'
import { DrawerRef } from '@/components/ui/drawer'
import { IconifyFilter, IconifyNavArrowDown, IconifyUserCircle } from '@/components/ui/icons'
import { ScreenHeader } from '@/components/ui/screen-header'
import { SwipeableTabs } from '@/components/ui/tabs'
import { Text } from '@/components/ui/text'
import { useAccountInfo } from '@/hooks/account/use-account-info'
import { useAccountSynopsis } from '@/hooks/account/use-account-synopsis'
import { useI18n } from '@/hooks/use-i18n'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { useRootStore } from '@/stores'
import {
  createRealAccountInfoSelector,
  userInfoActiveTradeAccountIdSelector,
  userInfoRealAccountListSelector,
} from '@/stores/user-slice/infoSlice'
import { msg } from '@lingui/core/macro'

import { DateFilterDrawer, DateRange } from './_comps/date-filter-drawer'
import { DepositList } from './_comps/deposit-list'
import { TransferList } from './_comps/transfer-list'
import { WithdrawalList } from './_comps/withdrawal-list'

// Mock data types
export interface WithdrawalRecord {
  id: string
  amount: string
  currency: string
  status: 'success' | 'failed'
  fromAccount: string
  fromAccountType: string
  toAddress: string
  toAddressLabel: string
  orderNumber: string
  time: string
}

export interface DepositRecord {
  id: string
  amount: string
  currency: string
  status: 'success' | 'failed'
  toAccount: string
  toAccountType: string
  fromAddress: string
  fromAddressLabel: string
  orderNumber: string
  time: string
}

interface BillsScreenContextProps {
  selectedAccountId: string | undefined
  setSelectedAccountId: (id: string) => void
  dateRange: DateRange
}

const BillsScreenContext = createContext<BillsScreenContextProps>({} as BillsScreenContextProps)

export function useBillsScreenContext() {
  return useContext(BillsScreenContext)
}

const BillsScreen = () => {
  const { tab, accountId } = useLocalSearchParams<{ tab?: string; accountId?: string }>()

  const [dateFilterVisible, setDateFilterVisible] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  })
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (selectedAccountId) return
    const state = useRootStore.getState()
    // 1. URL accountId（真实账户）
    const fromUrl = createRealAccountInfoSelector(accountId)(state)
    if (fromUrl) return setSelectedAccountId(fromUrl.id)
    // 2. activeTradeAccountId
    const activeId = userInfoActiveTradeAccountIdSelector(state)
    if (activeId) return setSelectedAccountId(activeId)
    // 3. 兜底：第一个真实账户
    const first = userInfoRealAccountListSelector(state)[0]
    if (first) setSelectedAccountId(first.id)
  }, [accountId, selectedAccountId])

  const handleFilterPress = () => {
    setDateFilterVisible(true)
  }

  enum TabKeyEnum {
    WITHDRAWAL = 'withdrawal',
    DEPOSIT = 'deposit',
    TRANSFER = 'transfer',
  }
  const { renderLinguiMsg } = useI18n()

  const routes: Route[] = [
    { key: TabKeyEnum.WITHDRAWAL, title: renderLinguiMsg(msg`取现`) },
    { key: TabKeyEnum.DEPOSIT, title: renderLinguiMsg(msg`充值`) },
    { key: TabKeyEnum.TRANSFER, title: renderLinguiMsg(msg`划转`) },
  ]

  const TabContent = {
    [TabKeyEnum.WITHDRAWAL]: () => <WithdrawalList accountSelector={<BillsAccountSelector />} />,
    [TabKeyEnum.DEPOSIT]: () => <DepositList accountSelector={<BillsAccountSelector />} />,

    [TabKeyEnum.TRANSFER]: () => <TransferList accountSelector={<BillsAccountSelector />} />,
  }

  // 根据路由参数计算初始 tab index
  const getInitialTabIndex = () => {
    if (!tab) return 0
    const idx = routes.findIndex((r) => r.key === tab)
    return idx >= 0 ? idx : 0
  }
  const initialTabIndex = getInitialTabIndex()

  const renderScene = ({ route }: { route: Route }) => {
    const content = TabContent[route.key as TabKeyEnum]
    return content()
  }

  return (
    <BillsScreenContext.Provider value={{ selectedAccountId, setSelectedAccountId, dateRange }}>
      <ScreenHeader
        showBackButton={true}
        content={<Trans>账单</Trans>}
        right={
          <Pressable onPress={handleFilterPress}>
            <IconifyFilter width={22} height={22} className="text-content-1" />
          </Pressable>
        }
      />
      <SwipeableTabs
        routes={routes}
        renderScene={renderScene}
        variant="underline"
        size="md"
        tabBarClassName="px-xl"
        tabFlex
        initialIndex={initialTabIndex}
      />

      <DateFilterDrawer
        visible={dateFilterVisible}
        onClose={() => setDateFilterVisible(false)}
        dateRange={dateRange}
        onApply={(range) => setDateRange(range)}
      />
    </BillsScreenContext.Provider>
  )
}

export default BillsScreen

const BillsAccountSelector = () => {
  const { selectedAccountId, setSelectedAccountId } = useBillsScreenContext()
  const selectedAccount = useAccountInfo(selectedAccountId)
  const realAccountSelectionDrawerRef = useRef<DrawerRef>(null)

  if (!selectedAccount) return null

  return (
    <>
      <AccountSelector
        selectedAccount={selectedAccount}
        onPress={() => realAccountSelectionDrawerRef.current?.open()}
      />

      <RealAccountSelectionDrawer
        ref={realAccountSelectionDrawerRef}
        selectedAccountId={selectedAccount.id}
        onSelect={(account) => {
          setSelectedAccountId(account.id)
        }}
      />
    </>
  )
}

// Account Selector Component
function AccountSelector({ selectedAccount, onPress }: { selectedAccount: User.AccountItem; onPress?: () => void }) {
  const { textColorContent1 } = useThemeColors()

  const synopsis = useAccountSynopsis(selectedAccount.synopsis)

  return (
    <Pressable onPress={() => onPress?.()}>
      <View className="px-xl py-xl bg-special rounded-small flex-row items-center justify-between">
        <View className="gap-medium flex-row items-center">
          <IconifyUserCircle width={20} height={20} color={textColorContent1} />
          <Text className="text-paragraph-p2 text-content-1">{selectedAccount?.id}</Text>
          {!selectedAccount?.isSimulate && (
            <Badge color="green">
              <Text>
                <Trans>真实</Trans>
              </Text>
            </Badge>
          )}
          <Badge color="default">
            <Text>{synopsis.abbr}</Text>
          </Badge>
        </View>
        <IconifyNavArrowDown width={18} height={18} color={textColorContent1} />
      </View>
    </Pressable>
  )
}
