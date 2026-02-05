import { View, Pressable } from 'react-native'
import { Trans } from '@lingui/react/macro'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer'
import { useState } from 'react'

interface OrderConfirmationDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  symbol: string
  direction: 'long' | 'short'
  price: string
  margin: string
  contractValue: string
  takeProfit?: string
  stopLoss?: string
  onConfirm: () => void
}

export function OrderConfirmationDrawer({
  open,
  onOpenChange,
  symbol,
  direction,
  price,
  margin,
  contractValue,
  takeProfit,
  stopLoss,
  onConfirm,
}: OrderConfirmationDrawerProps) {
  const [dontAskAgain, setDontAskAgain] = useState(false)

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            <Trans>订单确认</Trans>
          </DrawerTitle>
        </DrawerHeader>

        <View className="px-5 gap-3xl">
          <View className='gap-xl'>
            {/* Symbol and Direction */}
            <View className="flex-row items-center gap-medium">
              <View className="size-[24px] rounded-full bg-button items-center justify-center">
                <Text className="text-paragraph-p3 text-content-1">S</Text>
              </View>
              <Text className="text-important-1 text-content-1">{symbol}</Text>
              <Badge color={direction === 'long' ? 'rise' : 'fall'}>
                <Text>{direction === 'long' ? <Trans>做多</Trans> : <Trans>做空</Trans>}</Text>
              </Badge>
            </View>

            {/* Order Details */}
            <View className="gap-medium">
              {/* Price */}
              <View className="flex-row items-center justify-between">
                <Text className="text-paragraph-p2 text-content-4">
                  <Trans>价格</Trans>
                </Text>
                <Text className="text-paragraph-p2 text-market-rise">{price}</Text>
              </View>

              {/* Margin */}
              <View className="flex-row items-center justify-between">
                <Text className="text-paragraph-p2 text-content-4">
                  <Trans>保证金</Trans>
                </Text>
                <Text className="text-paragraph-p2 text-content-1">{margin} USDC</Text>
              </View>

              {/* Contract Value */}
              <View className="flex-row items-center justify-between">
                <Text className="text-paragraph-p2 text-content-4">
                  <Trans>合约价值</Trans>
                </Text>
                <Text className="text-paragraph-p2 text-content-1">{contractValue} USDC</Text>
              </View>

              {/* Take Profit */}
              <View className="flex-row items-center justify-between">
                <Text className="text-paragraph-p2 text-content-4">
                  <Trans>止盈</Trans>
                </Text>
                <Text className="text-paragraph-p2 text-content-4">
                  {takeProfit || <Trans>未设置</Trans>}
                </Text>
              </View>

              {/* Stop Loss */}
              <View className="flex-row items-center justify-between">
                <Text className="text-paragraph-p2 text-content-4">
                  <Trans>止损</Trans>
                </Text>
                <Text className="text-paragraph-p2 text-content-4">
                  {stopLoss || <Trans>未设置</Trans>}
                </Text>
              </View>
            </View>
          </View>

          {/* Don't ask again checkbox */}
          <View className="flex-row items-center justify-center">
            <Pressable
              onPress={() => setDontAskAgain(!dontAskAgain)}
              className="flex-row items-center gap-medium"
            >
              <Checkbox checked={dontAskAgain} onCheckedChange={setDontAskAgain} />
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>不再询问，您可以在设置-&gt;交易设置中重新设置</Trans>
              </Text>
            </Pressable>

          </View>
        </View>

        <DrawerFooter>
          <Button
            color="primary"
            size="lg"
            block
            onPress={handleConfirm}
          >
            <Text>
              <Trans>确定</Trans>
            </Text>
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
