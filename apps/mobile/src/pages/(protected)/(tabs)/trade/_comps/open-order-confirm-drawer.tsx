import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useImperativeHandle, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useToggle } from 'ahooks'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerRef, DrawerTitle } from '@/components/ui/drawer'
import { Text } from '@/components/ui/text'
import { useTradeSettingsStore } from '@/stores/trade-settings'

interface OrderConfirmDrawerProps {
  ref: React.RefObject<Nilable<DrawerRef>>
}

export function OrderConfirmDrawer({ ref }: OrderConfirmDrawerProps) {
  // const [dontAskAgain, setDontAskAgain] = useState(false)
  // const setOrderConfirmation = useTradeSettingsStore((s) => s.setOrderConfirmation)

  const [open, { toggle, setLeft: setFalse, setRight: setTrue, set: onSet }] = useToggle()
  useImperativeHandle(ref, () => ({
    open: () => setTrue(),
    close: () => setFalse(),
    toggle: () => toggle(),
  }))

  return (
    <Drawer open={open} onOpenChange={onSet}>
      <DrawerContent>
        <DrawerHeader className="pt-3xl px-5">
          <DrawerTitle>
            <Trans>订单确认</Trans>
          </DrawerTitle>
        </DrawerHeader>

        <OrderConfirmDrawerContent />
      </DrawerContent>
    </Drawer>
  )
}

const OrderConfirmDrawerContent = observer(() => {
  const handleConfirm = () => {
    // if (dontAskAgain) {
    //   setOrderConfirmation(false)
    // }
    // onConfirm()
    // onOpenChange(false)
  }

  return (
    <>
      <View className="gap-3xl px-5">
        <View className="gap-xl">
          {/* Symbol and Direction */}
          <View className="gap-medium flex-row items-center">
            <View className="bg-button size-[24px] items-center justify-center rounded-full">
              <Text className="text-paragraph-p3 text-content-1">S</Text>
            </View>
            {/* <Text className="text-important-1 text-content-1">{symbol}</Text> */}
            {/* <Badge color={direction === 'long' ? 'rise' : 'fall'}>
                <Text>{direction === 'long' ? <Trans>做多</Trans> : <Trans>做空</Trans>}</Text>
              </Badge> */}
          </View>

          {/* Order Details */}
          <View className="gap-medium">
            {/* Price */}
            <View className="flex-row items-center justify-between">
              <Text className="text-paragraph-p2 text-content-4">
                <Trans>价格</Trans>
              </Text>
              {/* <Text className="text-paragraph-p2 text-market-rise">{price}</Text> */}
            </View>

            {/* Margin */}
            <View className="flex-row items-center justify-between">
              <Text className="text-paragraph-p2 text-content-4">
                <Trans>保证金</Trans>
              </Text>
              {/* <Text className="text-paragraph-p2 text-content-1">{margin} USDC</Text> */}
            </View>

            {/* Contract Value */}
            <View className="flex-row items-center justify-between">
              <Text className="text-paragraph-p2 text-content-4">
                <Trans>合约价值</Trans>
              </Text>
              {/* <Text className="text-paragraph-p2 text-content-1">{contractValue} USDC</Text> */}
            </View>

            {/* Take Profit */}
            <View className="flex-row items-center justify-between">
              <Text className="text-paragraph-p2 text-content-4">
                <Trans>止盈</Trans>
              </Text>
              <Text className="text-paragraph-p2 text-content-4">{/* {takeProfit || <Trans>未设置</Trans>} */}</Text>
            </View>

            {/* Stop Loss */}
            <View className="flex-row items-center justify-between">
              <Text className="text-paragraph-p2 text-content-4">
                <Trans>止损</Trans>
              </Text>
              <Text className="text-paragraph-p2 text-content-4">{/* {stopLoss || <Trans>未设置</Trans>} */}</Text>
            </View>
          </View>
        </View>

        {/* Don't ask again checkbox */}
        <View className="flex-row items-center justify-center">
          {/* <Pressable
              onPress={() => setDontAskAgain(!dontAskAgain)}
              className="flex-row items-center gap-medium"
            >
              <Checkbox checked={dontAskAgain} onCheckedChange={setDontAskAgain} />
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>不再询问，您可以在设置-&gt;交易设置中重新设置</Trans>
              </Text>
            </Pressable> */}
        </View>
      </View>

      <DrawerFooter className="pb-3xl px-5">
        <Button
          color="primary"
          size="lg"
          block
          // onPress={handleConfirm}
        >
          <Text>
            <Trans>确定</Trans>
          </Text>
        </Button>
      </DrawerFooter>
    </>
  )
})
