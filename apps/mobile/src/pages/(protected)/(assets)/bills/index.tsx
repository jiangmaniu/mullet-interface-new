import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
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
import { useI18n } from '@/hooks/use-i18n'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { useStores } from '@/v1/provider/mobxProvider'
import { useAccountSynopsis } from '@/hooks/account/use-account-synopsis'
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
  selectedAccount: User.AccountItem
  setSelectedAccount: (account: User.AccountItem) => void
  dateRange: DateRange
}

const BillsScreenContext = createContext<BillsScreenContextProps>({} as BillsScreenContextProps)

export function useBillsScreenContext() {
  return useContext(BillsScreenContext)
}

const BillsScreen = observer(() => {
  const { tab, accountId } = useLocalSearchParams<{ tab?: string; accountId?: string }>()

  const [dateFilterVisible, setDateFilterVisible] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  })
  const { user } = useStores()

  const accountList = user.realAccountList ?? []
  const [selectedAccount, setSelectedAccount] = useState<User.AccountItem>(accountList[0])

  useEffect(() => {
    if (accountId && !selectedAccount) {
      const account = user.currentUser.accountList?.find((a) => a.id === accountId)
      if (account) setSelectedAccount(account)
    }
  }, [accountId, selectedAccount, user.currentUser.accountList])

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
    <BillsScreenContext.Provider value={{ selectedAccount, setSelectedAccount, dateRange }}>
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
})

export default BillsScreen

const BillsAccountSelector = observer(() => {
  const { selectedAccount, setSelectedAccount } = useBillsScreenContext()
  const realAccountSelectionDrawerRef = useRef<DrawerRef>(null)
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
          setSelectedAccount(account)
        }}
      />
    </>
  )
})

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
