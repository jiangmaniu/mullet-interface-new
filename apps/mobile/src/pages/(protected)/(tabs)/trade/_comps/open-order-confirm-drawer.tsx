import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useImperativeHandle, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useToggle } from 'ahooks'

import { AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerRef, DrawerTitle } from '@/components/ui/drawer'
import { Text } from '@/components/ui/text'
import { renderFormatSymbolName } from '@/helpers/symbol'
import { TradePositionDirectionEnum } from '@/options/trade/position'
import { useTradeSettingsStore } from '@/stores/trade-settings'
import { getImgSource } from '@/utils/img'
import { useStores } from '@/v1/provider/mobxProvider'

interface OrderConfirmDrawerProps {
  ref: React.RefObject<Nilable<DrawerRef>>
  onConfirm?: () => void
}

export function OrderConfirmDrawer({ ref, onConfirm }: OrderConfirmDrawerProps) {
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

        <OrderConfirmDrawerContent onConfirm={onConfirm} onClose={setFalse} />
      </DrawerContent>
    </Drawer>
  )
}

const OrderConfirmDrawerContent = observer(
  ({ onConfirm, onClose }: { onConfirm?: () => void; onClose: () => void }) => {
    const [isConfirmLoading, { setLeft: setFalse, setRight: setTrue }] = useToggle(false)
    const { trade } = useStores()
    const activeSymbolInfo = trade.getActiveSymbolInfo(trade.activeSymbolName)
    const isBuy = trade.buySell === TradePositionDirectionEnum.BUY

    const orderConfirmation = useTradeSettingsStore((s) => s.orderConfirmation)
    const [dontAskAgain, setDontAskAgain] = useState(!orderConfirmation)
    const setOrderConfirmation = useTradeSettingsStore((s) => s.setOrderConfirmation)

    const handleConfirm = async () => {
      try {
        setTrue()
        await Promise.resolve(onConfirm?.())
        setOrderConfirmation(dontAskAgain)
        onClose?.()
      } catch {
      } finally {
        setFalse()
      }
    }

    return (
      <>
        <View className="gap-3xl px-5">
          <View className="gap-xl">
            {/* Symbol and Direction */}
            <View className="gap-medium flex-row items-center">
              <AvatarImage source={getImgSource(activeSymbolInfo?.imgUrl)} className="size-6 rounded-full" />

              <Text className="text-important-1 text-content-1">{renderFormatSymbolName(activeSymbolInfo)}</Text>
              <Badge color={isBuy ? 'rise' : 'fall'}>
                <Text>{isBuy ? <Trans>做多</Trans> : <Trans>做空</Trans>}</Text>
              </Badge>
            </View>

            {/* Order Details */}
            <View className="gap-medium">
              {/* Price */}
              <View className="flex-row items-center justify-between">
                <Text className="text-paragraph-p2 text-content-4">
                  <Trans>价格</Trans>
                </Text>
                {/* <Text className>="text-paragraph-p2 text-market-rise">{price}</Text> */}
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
            <Pressable onPress={() => setDontAskAgain(!dontAskAgain)} className="gap-medium flex-row items-center">
              <Checkbox checked={dontAskAgain} onCheckedChange={setDontAskAgain} />
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>不再询问，您可以在设置-&gt;交易设置中重新设置</Trans>
              </Text>
            </Pressable>
          </View>
        </View>

        <DrawerFooter className="pb-3xl px-5">
          <Button color="primary" size="lg" block loading={isConfirmLoading} onPress={handleConfirm}>
            <Text>
              <Trans>确定</Trans>
            </Text>
          </Button>
        </DrawerFooter>
      </>
    )
  },
)
