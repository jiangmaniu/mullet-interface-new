import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { createContext, useContext, useImperativeHandle, useState } from 'react'
import { Pressable, View } from 'react-native'
import { NumberFormatValues } from 'react-number-format'
import { useToggle } from 'ahooks'
import { Actions } from 'ahooks/lib/useToggle'

import { AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerRef, DrawerTitle } from '@/components/ui/drawer'
import { NumberInput, NumberInputSourceType } from '@/components/ui/number-input'
import { NumberInputSourceInfo } from '@/components/ui/number-input-primitive'
import { Slider } from '@/components/ui/slider'
import { Text } from '@/components/ui/text'
import { parseSymbolLotsVolScale, renderFormatSymbolName } from '@/helpers/symbol'
import { useClosePosition } from '@/hooks/use-close-position'
import { useI18n } from '@/hooks/use-i18n'
import { LOTS_UNIT_LABEL } from '@/options/trade/unit'
import { parseTradePositionInfo } from '@/pages/(protected)/(trade)/_helpers/position'
import { useTradeSettingsStore } from '@/stores/trade-settings'
import { getImgSource } from '@/utils/img'
import { useStores } from '@/v1/provider/mobxProvider'
import { Order } from '@/v1/services/tradeCore/order/typings'
import { useCovertProfitCallback } from '@/v1/utils/wsUtil'
import { BNumber } from '@mullet/utils/number'

import { PositionCurrentPrice } from '../../common/position-current-price'

interface ClosePositionDrawerProps {
  position: Order.BgaOrderPageListItem
}

const ClosePositionDrawerContent = observer(({ position }: ClosePositionDrawerProps) => {
  const [closedLots, setClosedLots] = useState('')
  const [sliderValue, setSliderValue] = useState(0)
  const closeConfirmation = useTradeSettingsStore((s) => s.closeConfirmation)
  const { setCloseConfirmation } = useTradeSettingsStore()
  const { trade } = useStores()

  const [dontAskAgain, setDontAskAgain] = useState(!closeConfirmation)
  const positionInfo = parseTradePositionInfo(position)
  const { renderLinguiMsg } = useI18n()
  const lotsVolScale = parseSymbolLotsVolScale(positionInfo?.conf)

  const covertProfit = useCovertProfitCallback(false)
  const positionProfit = covertProfit(position)
  const profitColor = BNumber.from(positionProfit)?.gt(0)
    ? 'text-market-rise'
    : BNumber.from(positionProfit)?.lt(0)
      ? 'text-market-fall'
      : 'text-content-1'
  const currentAccountInfo = trade.currentAccountInfo

  const { setLeft } = useClosePositionDrawerContext()

  // 使用平仓 hook
  const { mutate: closePosition, isPending: closePositionLoading } = useClosePosition()

  const handleSliderChange = (value: number) => {
    console.log('🎯 Slider changed:', value)
    setSliderValue(value)
    // 根据百分比计算平仓数量
    const calculatedQuantity = BNumber.fromPercent(value).toPercentRatio().multipliedBy(positionInfo?.orderVolume)
    const lots = calculatedQuantity?.decimalPlaces(lotsVolScale, BNumber.ROUND_UP)?.toFixed()
    console.log('📊 Calculated lots:', lots, 'from', value, '%')
    if (lots) {
      setClosedLots(lots)
    }
  }

  const handleInputClosedLots = ({ value }: NumberFormatValues, { source }: NumberInputSourceInfo) => {
    if (source === NumberInputSourceType.EVENT) {
      setClosedLots(value)

      const lots = BNumber.from(value).div(positionInfo?.orderVolume)?.toPercent().decimalPlaces(0)?.toFixed()
      if (lots) {
        setSliderValue(Number(lots))
      }
    }
  }

  const handleConfirm = () => {
    // 调用平仓 hook
    closePosition(
      {
        position,
        orderVolume: closedLots || undefined, // 如果没有输入，则全部平仓
      },
      {
        onSuccess: () => {
          // 更新"不再询问"设置
          if (dontAskAgain) {
            setCloseConfirmation(false)
          }
          // 关闭抽屉
          setLeft()
        },
      }
    )
  }

  return (
    <>
      <DrawerHeader className="pt-3xl px-5">
        <DrawerTitle>
          <Trans>平仓</Trans>
        </DrawerTitle>
      </DrawerHeader>

      <View className="gap-3xl px-5">
        {/* Symbol and Direction */}
        <View className="gap-medium flex-row items-center">
          <AvatarImage source={getImgSource(positionInfo.imgUrl)} className="size-6 rounded-full"></AvatarImage>
          <Text className="text-important-1 text-content-1">{renderFormatSymbolName(positionInfo)}</Text>
          <Badge color={positionInfo.isBuy ? 'rise' : 'fall'}>
            <Text>{positionInfo.isBuy ? <Trans>做多</Trans> : <Trans>做空</Trans>}</Text>
          </Badge>
        </View>

        {/* Position Info */}
        <View className="gap-medium">
          {/* Open Price */}
          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p2 text-content-4">
              <Trans>开仓价</Trans>
            </Text>
            <Text className="text-paragraph-p2 text-content-1">
              {BNumber.toFormatNumber(position.startPrice, { volScale: position.symbolDecimal })}
            </Text>
          </View>

          {/* Mark Price */}
          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p2 text-content-4">
              <Trans>标记价格</Trans>
            </Text>

            <PositionCurrentPrice className="text-paragraph-p2" info={position} />
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p2 text-content-4">
              <Trans>数量</Trans>
            </Text>

            <Text className="text-paragraph-p2 text-content-1">
              {BNumber.toFormatNumber(position.orderVolume, {
                volScale: lotsVolScale,
                unit: renderLinguiMsg(LOTS_UNIT_LABEL),
              })}
            </Text>
          </View>
        </View>

        {/* Close Quantity Input */}
        <View className="gap-3xl">
          <NumberInput
            labelText={<Trans>平仓数量</Trans>}
            displayLabelClassName="bg-special"
            value={closedLots}
            decimalScale={lotsVolScale}
            max={position.orderVolume}
            onValueChange={handleInputClosedLots}
            keyboardType="decimal-pad"
            RightContent={<Text className="text-content-1">{renderLinguiMsg(LOTS_UNIT_LABEL)}</Text>}
            variant="outlined"
            size="md"
          />

          {/* Slider with percentage labels */}
          <View className="gap-xs">
            <Slider min={0} max={100} step={1} value={sliderValue} interval={25} onValueChange={handleSliderChange} />
          </View>
        </View>

        {/* Floating Profit/Loss */}
        <View className="flex-row items-center justify-between">
          <Text className="text-paragraph-p2 text-content-4">
            <Trans>浮动盈亏</Trans>
          </Text>
          <Text className={`text-paragraph-p2 ${profitColor}`}>
            {BNumber.toFormatNumber(positionProfit, {
              volScale: currentAccountInfo.currencyDecimal,
              unit: currentAccountInfo.currencyUnit,
              forceSign: true,
              positive: false,
            })}
          </Text>
        </View>

        {/* Don't ask again checkbox */}
        <View className="flex-row items-center justify-end">
          <Pressable onPress={() => setDontAskAgain(!dontAskAgain)} className="flex-row items-center gap-[8px]">
            <Checkbox checked={dontAskAgain} onCheckedChange={setDontAskAgain} />
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>不再询问，您可以在设置-&gt;交易设置中重新设置</Trans>
            </Text>
          </Pressable>
        </View>
      </View>

      <DrawerFooter className="pb-3xl px-5">
        <Button color="primary" size="lg" block onPress={handleConfirm} loading={closePositionLoading}>
          <Text>
            <Trans>确定</Trans>
          </Text>
        </Button>
      </DrawerFooter>
    </>
  )
})

const ClosePositionDrawerContext = createContext<Actions<boolean>>({
  setLeft: () => {},
  setRight: () => {},
  set: () => {},
  toggle: () => {},
})
const useClosePositionDrawerContext = () => {
  const context = useContext(ClosePositionDrawerContext)
  if (!context) {
    throw new Error('useClosePositionDrawerContext must be used within a ClosePositionDrawerContext')
  }
  return context
}
export function ClosePositionDrawer({
  position,
  ref,
}: ClosePositionDrawerProps & {
  ref: React.RefObject<Nilable<DrawerRef>>
}) {
  const [open, toggleActions] = useToggle()
  const { setLeft: setFalse, setRight: setTrue, set: onSet, toggle } = toggleActions
  useImperativeHandle(ref, () => ({
    open: () => setTrue(),
    close: () => setFalse(),
    toggle: () => toggle(),
  }))

  return (
    <ClosePositionDrawerContext.Provider value={toggleActions}>
      <Drawer open={open} onOpenChange={onSet}>
        <DrawerContent>
          <ClosePositionDrawerContent position={position} />
        </DrawerContent>
      </Drawer>
    </ClosePositionDrawerContext.Provider>
  )
}
