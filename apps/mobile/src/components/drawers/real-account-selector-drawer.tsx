import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { RefObject, useImperativeHandle } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useShallow } from 'zustand/react/shallow'
import { useToggle } from 'ahooks'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Drawer, DrawerContent, DrawerHeader, DrawerRef } from '@/components/ui/drawer'
import { Text } from '@/components/ui/text'
import { useAccountSynopsis } from '@/hooks/account/use-account-synopsis'
import { useRootStore } from '@/stores'
import { userInfoRealAccountListSelector } from '@/stores/user-slice/infoSlice'
import { BNumber } from '@mullet/utils/number'

interface RealAccountSelectionDrawerProps {
  onSelect?: (account: User.AccountItem) => void
  selectedAccountId?: string
  title?: React.ReactNode
  ref?: RefObject<DrawerRef | null>
}

export const RealAccountSelectionDrawer = observer(
  ({ onSelect, selectedAccountId, title, ref }: RealAccountSelectionDrawerProps) => {
    const accountList = useRootStore(useShallow(userInfoRealAccountListSelector))
    const [isOpen, { toggle, setLeft: setClose, setRight: setOpen, set: setToggle }] = useToggle()

    useImperativeHandle(ref, () => ({
      open: setOpen,
      close: setClose,
      toggle: toggle,
    }))

    return (
      <Drawer open={isOpen} onOpenChange={setToggle}>
        <DrawerContent className="py-xl h-[240px] gap-0">
          {title && <DrawerHeader className="px-5">{title}</DrawerHeader>}

          <ScrollView className="pb-3xl flex-1" showsVerticalScrollIndicator={false}>
            {accountList.map((account) => (
              <AccountRow
                key={account.id}
                account={account}
                selectedAccountId={selectedAccountId}
                onPress={() => {
                  onSelect?.(account)
                  setClose()
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
