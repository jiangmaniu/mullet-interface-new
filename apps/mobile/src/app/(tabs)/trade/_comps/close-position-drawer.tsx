import { View, Pressable } from 'react-native'
import { Trans } from '@lingui/react/macro'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Slider } from '@/components/ui/slider'
import { useState } from 'react'
import { t } from '@/locales/i18n'
import { useTradeSettingsStore } from '@/stores/trade-settings'

interface ClosePositionDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  symbol: string
  direction: 'long' | 'short'
  quantity: number
  openPrice: string
  currentPrice: string
  profit: string
  isProfitable: boolean
  onConfirm: (quantity: number, orderType: 'market' | 'limit', limitPrice?: string) => void
}

function ClosePositionDrawerContent({
  symbol,
  direction,
  quantity,
  openPrice,
  currentPrice,
  profit,
  isProfitable,
  onConfirm,
  onOpenChange,
}: Omit<ClosePositionDrawerProps, 'open'>) {
  const [closeQuantity, setCloseQuantity] = useState('100.00')
  const [sliderValue, setSliderValue] = useState(100)
  const [dontAskAgain, setDontAskAgain] = useState(false)
  const setCloseConfirmation = useTradeSettingsStore((s) => s.setCloseConfirmation)

  const handleSliderChange = (value: number) => {
    setSliderValue(value)
    // 根据百分比计算平仓数量
    const calculatedQuantity = ((value / 100) * quantity).toFixed(2)
    setCloseQuantity(calculatedQuantity)
  }

  const handleQuantityChange = (value: string) => {
    setCloseQuantity(value)
    // 根据数量计算百分比
    const numValue = parseFloat(value) || 0
    const percent = (numValue / quantity) * 100
    setSliderValue(Math.min(100, Math.max(0, percent)))
  }

  const handleConfirm = () => {
    const qty = parseFloat(closeQuantity)
    if (qty > 0 && qty <= quantity) {
      if (dontAskAgain) {
        setCloseConfirmation(false)
      }
      onConfirm(qty, 'market')
      onOpenChange(false)
    }
  }

  return (
    <>
      <DrawerHeader className="px-5 pt-3xl">
        <DrawerTitle>
          <Trans>平仓</Trans>
        </DrawerTitle>
      </DrawerHeader>

      <View className="px-5 gap-3xl">
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

        {/* Position Info */}
        <View className="gap-medium">
          {/* Open Price */}
          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p2 text-content-4">
              <Trans>开仓价</Trans>
            </Text>
            <Text className="text-paragraph-p2 text-content-1">{openPrice} USDC</Text>
          </View>

          {/* Mark Price */}
          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p2 text-content-4">
              <Trans>标记价格</Trans>
            </Text>
            <Text className={`text-paragraph-p2 ${isProfitable ? 'text-market-rise' : 'text-market-fall'}`}>
              {currentPrice} USDC
            </Text>
          </View>
        </View>

        {/* Close Quantity Input */}
        <View className="gap-3xl">
          <Input
            labelText={t`平仓数量`}
            displayLabelClassName='bg-special'
            value={closeQuantity}
            onValueChange={handleQuantityChange}
            keyboardType="decimal-pad"
            RightContent={<Text className="text-content-1"><Trans>手</Trans></Text>}
            variant="outlined"
            size="md"
          />

          {/* Slider with percentage labels */}
          <View className="gap-xs">
            <Slider
              min={0}
              max={100}
              step={1}
              value={sliderValue}
              interval={25}
              onValueChange={handleSliderChange}
            />
          </View>
        </View>

        {/* Floating Profit/Loss */}
        <View className="flex-row items-center justify-between">
          <Text className="text-paragraph-p2 text-content-4">
            <Trans>浮动盈亏</Trans>
          </Text>
          <Text className={`text-paragraph-p2 ${isProfitable ? 'text-market-rise' : 'text-market-fall'}`}>
            {profit} USDC
          </Text>
        </View>

        {/* Don't ask again checkbox */}
        <View className="flex-row items-center justify-center">
          <Pressable
            onPress={() => setDontAskAgain(!dontAskAgain)}
            className="flex-row items-center gap-[8px]"
          >
            <Checkbox checked={dontAskAgain} onCheckedChange={setDontAskAgain} />
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>不再询问，您可以在设置-&gt;交易设置中重新提醒</Trans>
            </Text>
          </Pressable>
        </View>
      </View>

      <DrawerFooter className="px-5 pb-3xl">
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
    </>
  )
}

export function ClosePositionDrawer({
  open,
  onOpenChange,
  symbol,
  direction,
  quantity,
  openPrice,
  currentPrice,
  profit,
  isProfitable,
  onConfirm,
}: ClosePositionDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <ClosePositionDrawerContent
          symbol={symbol}
          direction={direction}
          quantity={quantity}
          openPrice={openPrice}
          currentPrice={currentPrice}
          profit={profit}
          isProfitable={isProfitable}
          onConfirm={onConfirm}
          onOpenChange={onOpenChange}
        />
      </DrawerContent>
    </Drawer>
  )
}
