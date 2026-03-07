import { RefObject, useImperativeHandle } from 'react'
import { Pressable, View } from 'react-native'

import { useToggle } from 'ahooks'
import { useRouter } from 'expo-router'
import { Trans } from '@lingui/react/macro'

import { Card, CardContent } from '@/components/ui/card'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerRef } from '@/components/ui/drawer'
import { IconifyNavArrowRight } from '@/components/ui/icons'
import { Text } from '@/components/ui/text'

export type AddBalanceDrawerRef = DrawerRef

interface AddBalanceDrawerProps {
  accountInfo: User.AccountItem
  ref?: RefObject<AddBalanceDrawerRef | null>
}

export const AddBalanceDrawer = ({ accountInfo, ref }: AddBalanceDrawerProps) => {
  const [open, { toggle, setLeft: setClose, setRight: setOpen }] = useToggle(false)
  const router = useRouter()

  useImperativeHandle(ref, () => ({
    open: setOpen,
    close: setClose,
    toggle: toggle,
  }))

  const handleTransferPress = () => {
    setClose()
    router.push(`/(protected)/(assets)/transfer?accountId=${accountInfo.id}`)
  }

  const handleDepositPress = () => {
    setClose()
    router.push(`/(protected)/(assets)/deposit?accountId=${accountInfo.id}`)
  }

  return (
    <Drawer open={open} onOpenChange={toggle}>
      <DrawerContent>
        <DrawerHeader className="px-5 pt-xl">
          <DrawerTitle><Trans>添加余额</Trans></DrawerTitle>
        </DrawerHeader>

        <View className="px-5 gap-xl pb-3xl">
          {/* 划转选项 */}
          <Pressable onPress={handleTransferPress}>
            <Card>
              <CardContent className="py-xl px-xl">
                <View className="flex-row items-center justify-between">
                  <View className="gap-xs flex-1">
                    <Text className="text-paragraph-p2 text-content-1">
                      <Trans>划转</Trans>
                    </Text>
                    <Text className="text-paragraph-p3 text-content-4">
                      <Trans>账户之间的资金划转</Trans>
                    </Text>
                  </View>
                  <IconifyNavArrowRight width={16} height={16} className="text-content-4" />
                </View>
              </CardContent>
            </Card>
          </Pressable>

          {/* 入金选项 */}
          <Pressable onPress={handleDepositPress}>
            <Card>
              <CardContent className="py-xl px-xl">
                <View className="flex-row items-center justify-between">
                  <View className="gap-xs flex-1">
                    <Text className="text-paragraph-p2 text-content-1">
                      <Trans>入金</Trans>
                    </Text>
                    <Text className="text-paragraph-p3 text-content-4">
                      <Trans>从外部钱包充值入金</Trans>
                    </Text>
                  </View>
                  <IconifyNavArrowRight width={16} height={16} className="text-content-4" />
                </View>
              </CardContent>
            </Card>
          </Pressable>
        </View>
      </DrawerContent>
    </Drawer>
  )
}
