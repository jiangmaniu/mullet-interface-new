import { View, TouchableOpacity } from 'react-native'
import { Text } from '@/components/ui/text'
import { IconifyUserCircle } from '@/components/ui/icons'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Trans } from '@lingui/react/macro'
import { t } from '@/locales/i18n'
import { Checkbox } from '@/components/ui/checkbox'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import {
  CollapsibleScrollView,
  CollapsibleTab,
  CollapsibleTabScene,
} from '@/components/ui/collapsible-tab'

// ============ Interfaces ============
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

// ============ AccountRow Component ============
interface AccountRowProps {
  account: Account
  isSelected: boolean
  onPress: () => void
}

function AccountRow({ account, isSelected, onPress }: AccountRowProps) {
  const { textColorContent1 } = useThemeColors()

  return (
    <TouchableOpacity onPress={onPress}>
      <Card className="border-0">
        <CardContent className="px-5 py-[14px] flex-row items-center justify-between">
          <View className="gap-xs">
            {/* Header: User Icon + Account ID + Badges */}
            <View className="flex-row items-center gap-medium">
              <View className="flex-row items-center gap-xs">
                <IconifyUserCircle width={24} height={24} color={textColorContent1} />
                <Text className="text-paragraph-p2 text-content-1">{account.id}</Text>
              </View>

              <View className="flex-row items-center gap-medium">
                <Badge color={account.isReal ? 'rise' : 'secondary'}>
                  <Text>{account.isReal ? <Trans>真实</Trans> : <Trans>模拟</Trans>}</Text>
                </Badge>
                <Badge color="default">
                  <Text>{account.type.toUpperCase()}</Text>
                </Badge>
              </View>
            </View>

            {/* Balance */}
            <View className="flex-row gap-xs">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>账户余额</Trans>
              </Text>
              <Text className="text-paragraph-p3 text-content-1">
                {account.balance} {account.currency}
              </Text>
            </View>
          </View>

          <Checkbox checked={isSelected} onCheckedChange={onPress} />
        </CardContent>
      </Card>
    </TouchableOpacity>
  )
}

// ============ TradeAccountSelectionDrawer Component ============
interface TradeAccountSelectionDrawerProps {
  visible: boolean
  onClose: () => void
  selectedAccountId?: string
  onSelect: (account: Account) => void
  realAccounts: Account[]
  mockAccounts: Account[]
}

export function TradeAccountSelectionDrawer({
  visible,
  onClose,
  selectedAccountId,
  onSelect,
  realAccounts,
  mockAccounts,
}: TradeAccountSelectionDrawerProps) {
  const handleSelect = (account: Account) => {
    onSelect(account)
    onClose()
  }

  return (
    <Drawer open={visible} onOpenChange={onClose}>
      <DrawerContent className="p-0">
        <View className="h-[320px] pt-xl">
          <CollapsibleTab
            initialTabName="real"
            size="md"
            variant="underline"
            minHeaderHeight={0}
            scrollEnabled={false}
            tabBarClassName="bg-special"
          >
            <CollapsibleTabScene name="real" label={t`真实账户`}>
              <CollapsibleScrollView className="flex-1 pt-xl">
                {realAccounts.map((account) => (
                  <AccountRow
                    key={account.id}
                    account={{ ...account, isReal: true }}
                    isSelected={selectedAccountId === account.id}
                    onPress={() => handleSelect({ ...account, isReal: true })}
                  />
                ))}
              </CollapsibleScrollView>
            </CollapsibleTabScene>

            <CollapsibleTabScene name="mock" label={t`模拟账户`}>
              <CollapsibleScrollView className="flex-1 pt-xl">
                {mockAccounts.map((account) => (
                  <AccountRow
                    key={account.id}
                    account={{ ...account, isReal: false }}
                    isSelected={selectedAccountId === account.id}
                    onPress={() => handleSelect({ ...account, isReal: false })}
                  />
                ))}
              </CollapsibleScrollView>
            </CollapsibleTabScene>
          </CollapsibleTab>
        </View>
      </DrawerContent>
    </Drawer>
  )
}
