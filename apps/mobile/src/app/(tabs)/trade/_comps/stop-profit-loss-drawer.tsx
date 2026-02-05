import { View, ScrollView } from 'react-native'
import { Trans } from '@lingui/react/macro'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  useDrawerContext,
} from '@/components/ui/drawer'
import { useState, useRef, useCallback } from 'react'
import { t } from '@/locales/i18n'

interface StopProfitLossDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  symbol: string
  direction: 'long' | 'short'
  openPrice: string
  markPrice: string
  onConfirm: (takeProfitPrice: string, takeProfitPercent: string, stopLossPrice: string, stopLossPercent: string) => void
}

function StopProfitLossDrawerContent({
  symbol,
  direction,
  openPrice,
  markPrice,
  onConfirm,
  onOpenChange,
}: Omit<StopProfitLossDrawerProps, 'open'>) {
  const { setFocusedInputY } = useDrawerContext()
  const [takeProfitPrice, setTakeProfitPrice] = useState('')
  const [takeProfitPercent, setTakeProfitPercent] = useState('')
  const [stopLossPrice, setStopLossPrice] = useState('')
  const [stopLossPercent, setStopLossPercent] = useState('')

  const scrollViewRef = useRef<ScrollView>(null)
  const inputRefs = useRef<{ [key: string]: View | null }>({})

  const handleConfirm = () => {
    onConfirm(takeProfitPrice, takeProfitPercent, stopLossPrice, stopLossPercent)
    onOpenChange(false)
  }

  // 当输入框获得焦点时，测量位置并通知 Drawer
  const handleInputFocus = useCallback((key: string) => {
    const input = inputRefs.current[key]
    if (input) {
      setTimeout(() => {
        input.measure((_x, _y, _width, _height, _pageX, pageY) => {
          // pageY 是相对于屏幕顶部的位置
          setFocusedInputY(pageY)
        })
      }, 100)
    }
  }, [setFocusedInputY])

  // 当输入框失去焦点时，清除位置
  const handleInputBlur = useCallback(() => {
    setFocusedInputY(null)
  }, [setFocusedInputY])

  // 计算止盈预计盈亏
  const calculateTakeProfitPL = () => {
    const takeProfitPriceNum = parseFloat(takeProfitPrice)
    const openPriceNum = parseFloat(openPrice)
    if (isNaN(takeProfitPriceNum) || isNaN(openPriceNum)) return '0.00'

    const diff = direction === 'long'
      ? takeProfitPriceNum - openPriceNum
      : openPriceNum - takeProfitPriceNum
    return diff.toFixed(2)
  }

  // 计算止损预计盈亏
  const calculateStopLossPL = () => {
    const stopLossPriceNum = parseFloat(stopLossPrice)
    const openPriceNum = parseFloat(openPrice)
    if (isNaN(stopLossPriceNum) || isNaN(openPriceNum)) return '0.00'

    const diff = direction === 'long'
      ? stopLossPriceNum - openPriceNum
      : openPriceNum - stopLossPriceNum
    return diff.toFixed(2)
  }

  // 根据百分比计算价格
  const handleTakeProfitPercentChange = (percent: string) => {
    setTakeProfitPercent(percent)
    const percentNum = parseFloat(percent)
    const openPriceNum = parseFloat(openPrice)
    if (!isNaN(percentNum) && !isNaN(openPriceNum)) {
      const newPrice = direction === 'long'
        ? openPriceNum * (1 + percentNum / 100)
        : openPriceNum * (1 - percentNum / 100)
      setTakeProfitPrice(newPrice.toFixed(2))
    }
  }

  const handleStopLossPercentChange = (percent: string) => {
    setStopLossPercent(percent)
    const percentNum = parseFloat(percent)
    const openPriceNum = parseFloat(openPrice)
    if (!isNaN(percentNum) && !isNaN(openPriceNum)) {
      const newPrice = direction === 'long'
        ? openPriceNum * (1 - percentNum / 100)
        : openPriceNum * (1 + percentNum / 100)
      setStopLossPrice(newPrice.toFixed(2))
    }
  }

  const isConfirmDisabled = !takeProfitPrice && !stopLossPrice

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>
          <Trans>止盈止损</Trans>
        </DrawerTitle>
      </DrawerHeader>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <View className="px-5 gap-xl pb-medium">
          {/* Symbol and Direction */}
          <View className="flex-row items-center gap-medium">
            <View className="size-[24px] rounded-full bg-button items-center justify-center">
              <Text className="text-paragraph-p3 text-content-1">S</Text>
            </View>
            <Text className="text-paragraph-p1 text-content-1">{symbol}</Text>
            <Badge color={direction === 'long' ? 'rise' : 'fall'}>
              <Text>{direction === 'long' ? <Trans>做空</Trans> : <Trans>做空</Trans>}</Text>
            </Badge>
          </View>

          {/* Price Info */}
          <View className="gap-medium">
            <View className="flex-row items-center justify-between">
              <Text className="text-paragraph-p2 text-content-4">
                <Trans>开仓价</Trans>
              </Text>
              <Text className="text-paragraph-p2 text-content-1">{openPrice} USDC</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-paragraph-p2 text-content-4">
                <Trans>标记价格</Trans>
              </Text>
              <Text className="text-paragraph-p2 text-market-rise">{markPrice} USDC</Text>
            </View>
          </View>

          {/* Take Profit Section */}
          <View className="gap-xs">
            <View className="flex-row gap-xl">
              <View
                ref={ref => { inputRefs.current['takeProfitPrice'] = ref }}
                className="flex-1"
              >
                <Input
                  labelText={t`止盈触发价`}
                  displayLabelClassName='bg-special'
                  value={takeProfitPrice}
                  onValueChange={setTakeProfitPrice}
                  onFocus={() => handleInputFocus('takeProfitPrice')}
                  onBlur={handleInputBlur}
                  keyboardType="decimal-pad"
                  placeholder={t`输入价格`}
                  variant="outlined"
                  size="md"
                />
              </View>
              <View
                ref={ref => { inputRefs.current['takeProfitPercent'] = ref }}
                className="w-[90px]"
              >
                <Input
                  labelText={t`百分比`}
                  displayLabelClassName='bg-special'
                  value={takeProfitPercent}
                  onValueChange={handleTakeProfitPercentChange}
                  onFocus={() => handleInputFocus('takeProfitPercent')}
                  onBlur={handleInputBlur}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  clean={false}
                  RightContent={<Text className="text-paragraph-p2 text-content-1">%</Text>}
                  variant="outlined"
                  size="md"
                />
              </View>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>范围</Trans> ≥ <Text className="text-content-1 text-paragraph-p3">1.17 USDC</Text>
              </Text>
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>预计盈亏</Trans> ≥ <Text className="text-content-1 text-paragraph-p3">{calculateTakeProfitPL()} USDC</Text>
              </Text>
            </View>
          </View>

          {/* Stop Loss Section */}
          <View className="gap-xs">
            <View className="flex-row gap-xl">
              <View
                ref={ref => { inputRefs.current['stopLossPrice'] = ref }}
                className="flex-1"
              >
                <Input
                  labelText={t`止损触发价`}
                  displayLabelClassName='bg-special'
                  value={stopLossPrice}
                  onValueChange={setStopLossPrice}
                  onFocus={() => handleInputFocus('stopLossPrice')}
                  onBlur={handleInputBlur}
                  keyboardType="decimal-pad"
                  placeholder={t`输入价格`}
                  variant="outlined"
                  size="md"
                />
              </View>
              <View
                ref={ref => { inputRefs.current['stopLossPercent'] = ref }}
                className="w-[90px]"
              >
                <Input
                  labelText={t`百分比`}
                  displayLabelClassName='bg-special'
                  value={stopLossPercent}
                  onValueChange={handleStopLossPercentChange}
                  onFocus={() => handleInputFocus('stopLossPercent')}
                  onBlur={handleInputBlur}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  clean={false}
                  RightContent={<Text className="text-paragraph-p2 text-content-1">%</Text>}
                  variant="outlined"
                  size="md"
                />
              </View>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>范围</Trans> ≥ <Text className="text-content-1 text-paragraph-p3">1.17 USDC</Text>
              </Text>
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>预计盈亏</Trans> ≥ <Text className="text-content-1 text-paragraph-p3">{calculateStopLossPL()} USDC</Text>
              </Text>
            </View>
          </View>

          {/* Warning */}
          <View className="">
            <Text className="text-paragraph-p4 text-status-warning">
              <Trans>由于行情变动快，止损触发价不宜离预估强平价过近，避免触发失败</Trans>
            </Text>
          </View>
        </View>
      </ScrollView>

      <DrawerFooter>
        <Button
          variant="solid"
          color='primary'
          size="lg"
          block
          onPress={handleConfirm}
          disabled={isConfirmDisabled}
        >
          <Text className={isConfirmDisabled ? 'text-content-6' : 'text-content-foreground'}>
            <Trans>确认</Trans>
          </Text>
        </Button>
      </DrawerFooter>
    </>
  )
}

export function StopProfitLossDrawer({
  open,
  onOpenChange,
  symbol,
  direction,
  openPrice,
  markPrice,
  onConfirm,
}: StopProfitLossDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className='max-h-[85vh]'>
        <StopProfitLossDrawerContent
          symbol={symbol}
          direction={direction}
          openPrice={openPrice}
          markPrice={markPrice}
          onConfirm={onConfirm}
          onOpenChange={onOpenChange}
        />
      </DrawerContent>
    </Drawer>
  )
}
