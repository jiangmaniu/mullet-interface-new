import { Trans, useLingui } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { Pressable, ScrollView, View } from 'react-native'
import { useShallow } from 'zustand/react/shallow'
import type { Route } from 'react-native-tab-view'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { IconifyUserCircle } from '@/components/ui/icons'
import { SwipeableTabs } from '@/components/ui/tabs'
import { Text } from '@/components/ui/text'
import { useAccountSynopsis } from '@/hooks/account/use-account-synopsis'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { useRootStore } from '@/stores'
import { userInfoAccountMapSelector, userInfoRealAccountListSelector, userInfoSimulateAccountListSelector } from '@/stores/user-slice/infoSlice'
import { BNumber } from '@mullet/utils/number'

import { toast } from '../ui/toast'

export interface Account {
  id: string
  type: string
  balance: string
  currency: string
  isReal?: boolean
  leverage?: string
  platform?: string
  server?: string
  address?: string
  [key: string]: any
}

interface AccountSelectDrawerProps {
  visible: boolean
  onClose: () => void
  selectedAccountId?: string
  onSelect: (account: User.AccountItem) => void
}

export const AccountSelectDrawer = observer(
  ({ visible, onClose, selectedAccountId, onSelect }: AccountSelectDrawerProps) => {
    return (
      <Drawer open={visible} onOpenChange={onClose}>
        <DrawerContent className="h-[292px] px-0">
          <AccountSelectContent
            selectedAccountId={selectedAccountId}
            onSelect={onSelect}
            onClose={onClose}
          />
        </DrawerContent>
      </Drawer>
    )
  },
)

interface AccountSelectContentProps {
  selectedAccountId?: string
  onSelect: (account: User.AccountItem) => void
  onClose: () => void
}

// 抽成子组件，确保每次 Drawer 打开时 tab 状态能正确初始化
const AccountSelectContent = observer(({ selectedAccountId, onSelect, onClose }: AccountSelectContentProps) => {
  const { t } = useLingui()
  const accountMap = useRootStore(useShallow(userInfoAccountMapSelector))
  const realAccountList = useRootStore(useShallow(userInfoRealAccountListSelector))
  const simulateAccountList = useRootStore(useShallow(userInfoSimulateAccountListSelector))

  // 根据 selectedAccountId 对应账户的类型，决定默认选中的 tab
  const initialTabIndex = selectedAccountId && accountMap[selectedAccountId]?.isSimulate ? 1 : 0

  const handleSelect = (account: User.AccountItem) => {
    if (!account?.enableConnect || account.status === 'DISABLED') {
      toast.error(t`该账户已被禁用`)
      return
    }

    onSelect(account)
    onClose()
  }

  const routes: Route[] = [
    { key: 'real', title: t`真实账户` },
    { key: 'mock', title: t`模拟账户` },
  ]

  const renderScene = ({ route }: { route: Route }) => {
    const isReal = route.key === 'real'
    const accounts = isReal ? realAccountList : simulateAccountList
    return (
      <ScrollView className="flex-1">
        {accounts.map((account) => (
          <AccountRow
            key={account.id}
            account={account}
            isSelected={selectedAccountId === account.id}
            onPress={() => handleSelect(account)}
          />
        ))}
      </ScrollView>
    )
  }

  return (
    <SwipeableTabs
      routes={routes}
      renderScene={renderScene}
      variant="underline"
      size="md"
      tabBarClassName="py-xl"
      tabFlex
      initialIndex={initialTabIndex}
    />
  )
})

interface AccountRowProps {
  account: User.AccountItem
  isSelected: boolean
  onPress?: () => void
}

const AccountRow = observer(({ account, isSelected, onPress }: AccountRowProps) => {
  const { textColorContent1 } = useThemeColors()

  const synopsis = useAccountSynopsis(account.synopsis)
  return (
    <Pressable onPress={isSelected ? undefined : onPress}>
      <Card className="border-0">
        <CardContent className="flex-row items-center justify-between px-5 py-[14px]">
          <View className="gap-xs">
            <View className="gap-medium flex-row items-center justify-between">
              <View className="gap-xs flex-row items-center">
                <IconifyUserCircle width={20} height={20} color={textColorContent1} />
                <Text className="text-paragraph-p2 text-content-1">{account.id}</Text>
              </View>

              <View className="gap-medium flex-row items-center">
                <Badge color={!account.isSimulate ? 'green' : 'secondary'}>
                  <Text>{!account.isSimulate ? <Trans>真实</Trans> : <Trans>模拟</Trans>}</Text>
                </Badge>
                <Badge color="default">
                  <Text>{synopsis.abbr}</Text>
                </Badge>
              </View>
            </View>

            <View className="gap-xs min-h-[24px] flex-row">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>账户余额</Trans>
              </Text>
              <Text className="text-paragraph-p3 text-content-1">
                {BNumber.toFormatNumber(account.money, {
                  unit: account.currencyUnit,
                  volScale: account.currencyDecimal,
                })}
              </Text>
            </View>
          </View>

          <Checkbox
            checked={isSelected}
            onCheckedChange={() => {
              if (!isSelected) onPress?.()
            }}
          />
        </CardContent>
      </Card>
    </Pressable>
  )
})
