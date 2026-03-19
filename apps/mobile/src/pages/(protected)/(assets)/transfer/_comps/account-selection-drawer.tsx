import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { Pressable, ScrollView, View } from 'react-native'
import { useShallow } from 'zustand/react/shallow'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Drawer, DrawerContent, DrawerHeader } from '@/components/ui/drawer'
import { Text } from '@/components/ui/text'
import { useAccountSynopsis } from '@/hooks/account/use-account-synopsis'
import { useRootStore } from '@/stores'
import { userInfoRealAccountListSelector } from '@/stores/user-slice/infoSlice'
import { BNumber } from '@mullet/utils/number'

interface AccountSelectionDrawerProps {
  visible: boolean
  onClose: () => void
  onSelect: (account: User.AccountItem) => void
  selectedAccountId?: string
  title?: React.ReactNode
}

export const AccountSelectionDrawer = observer(
  ({ visible, onClose, onSelect, selectedAccountId, title }: AccountSelectionDrawerProps) => {
    const accountList = useRootStore(useShallow(userInfoRealAccountListSelector))
    return (
      <Drawer open={visible} onOpenChange={onClose}>
        <DrawerContent className="py-xl h-[240px] gap-0">
          {title && <DrawerHeader className="px-5">{title}</DrawerHeader>}

          <ScrollView className="pb-3xl flex-1" showsVerticalScrollIndicator={false}>
            {accountList.map((account) => (
              <AccountRow
                key={account.id}
                account={account}
                selectedAccountId={selectedAccountId}
                onPress={() => {
                  onSelect(account)
                  onClose()
                }}
              />
            ))}
            <View className="h-safe-bottom" />
          </ScrollView>
        </DrawerContent>
      </Drawer>
    )
  },
)

function AccountRow({
  account,
  selectedAccountId,
  onPress,
}: {
  account: User.AccountItem
  selectedAccountId?: string
  onPress: () => void
}) {
  const isSelected = account.id === selectedAccountId

  const synopsis = useAccountSynopsis(account.synopsis)
  return (
    <Pressable onPress={onPress}>
      <Card className="border-0 bg-transparent">
        <CardContent className="flex-row items-center justify-between px-5 py-[14px]">
          <View className="gap-xs">
            <View className="gap-medium flex-row items-center justify-between">
              <Text className="text-paragraph-p2 text-content-1">{account.id}</Text>

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

            <Text className="text-paragraph-p3 text-content-4">
              {BNumber.toFormatNumber(account.money, { unit: account.currencyUnit, volScale: account.currencyDecimal })}
            </Text>
          </View>

          <Checkbox checked={!!isSelected} onCheckedChange={() => onPress()} />
        </CardContent>
      </Card>
    </Pressable>
  )
}

export default AccountSelectionDrawer
