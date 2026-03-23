import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { createContext, startTransition, useContext, useImperativeHandle, useState } from 'react'
import { Pressable, View } from 'react-native'
import { NumberFormatValues } from 'react-number-format'
import { useShallow } from 'zustand/react/shallow'
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
import { toast } from '@/components/ui/toast'
import { parseSymbolLotsVolScale, renderFormatSymbolName } from '@/helpers/symbol'
import { useClosePosition } from '@/hooks/use-close-position'
import { useI18n } from '@/hooks/use-i18n'
import { LOTS_UNIT_LABEL } from '@/options/trade/unit'
import { parseTradePositionInfo } from '@/pages/(protected)/(trade)/_helpers/position'
import { useRootStore } from '@/stores'
import { userInfoActiveTradeAccountCurrencyInfoSelector } from '@/stores/user-slice/infoSlice'
import { getImgSource } from '@/utils/img'
import { Order } from '@/v1/services/tradeCore/order/typings'
import { BNumber } from '@mullet/utils/number'

import { useMarketQuotePrice } from '@/hooks/market/use-market-quote'
import { getPositionGrossPnlInfo } from '@/hooks/trade/use-position-pnl'

import { PositionCurrentPrice } from '../../common/position-current-price'

interface ClosePositionDrawerProps {
  position: Order.BgaOrderPageListItem
}

const ClosePositionDrawerContent = observer(({ position }: ClosePositionDrawerProps) => {
  const [closedLots, setClosedLots] = useState(position.orderVolume?.toString() ?? '')
  const [sliderValue, setSliderValue] = useState(BNumber.from(position.orderVolume)?.gt(0) ? 100 : 0)
  const closeConfirmation = useRootStore((s) => s.trade.setting.closeConfirmation)
  const setCloseConfirmation = useRootStore((s) => s.trade.setting.setCloseConfirmation)
  const currentAccountCurrencyInfo = useRootStore(useShallow(userInfoActiveTradeAccountCurrencyInfoSelector))

  const [dontAskAgain, setDontAskAgain] = useState(!closeConfirmation)
  const positionInfo = parseTradePositionInfo(position)
  const { renderLinguiMsg } = useI18n()
  const lotsVolScale = parseSymbolLotsVolScale(positionInfo?.conf)

  // 获取持仓方向对应的报价价格（盈亏计算用）
  const currentPrice = useMarketQuotePrice(positionInfo.symbol, positionInfo.direction)

  // 浮动盈亏（换汇为账户本币）
  const grossPnlInfo = getPositionGrossPnlInfo({
    positionInfo,
    currentPrice,
    convertCurrency: true,
  })

  const profitColor = grossPnlInfo?.isProfit
    ? 'text-market-rise'
    : grossPnlInfo?.isLoss
      ? 'text-market-fall'
      : 'text-content-1'

  const { setLeft } = useClosePositionDrawerContext()

  // 使用平仓 hook
  const { mutate: closePosition, isPending: closePositionLoading } = useClosePosition()

  const handleSliderChange = (value: number) => {
    // value=0 时直接设 ''，否则向上取整保证至少有最小精度单位
    const lots =
      value === 0
        ? ''
        : BNumber.from(value)
            .div(100)
            .multipliedBy(positionInfo?.orderVolume)
            ?.cutDecimalPlaces(lotsVolScale, BNumber.ROUND_UP)
            ?.toFixed()

    // 反推真实百分比做吸附，保证 slider 与数量同步
    // 数量向上取整后反推百分比用 ROUND_DOWN，避免百分比超过实际值
    const lotsNum = BNumber.from(lots)
    const realPercent =
      lots !== undefined && lots !== '' && lotsNum?.gt(0)
        ? (lotsNum?.div(positionInfo?.orderVolume)?.toPercent().cutDecimalPlaces(0, BNumber.ROUND_DOWN)?.toNumber() ??
          value)
        : value

    // 同步更新 slider 位置
    setSliderValue(realPercent)

    // 更新输入框数量
    if (lots !== undefined) {
      setClosedLots(lots)
    }
  }

  const handleInputClosedLots = ({ value }: NumberFormatValues, { source }: NumberInputSourceInfo) => {
    if (source === NumberInputSourceType.EVENT) {
      setClosedLots(value)

      const lotsPercent = BNumber.from(value)
        .div(positionInfo?.orderVolume)
        ?.toPercent()
        .cutDecimalPlaces(0, BNumber.ROUND_DOWN)
        ?.toFixed()
      if (lotsPercent) {
        startTransition(() => setSliderValue(Number(lotsPercent)))
      }
    }
  }

  const handleConfirm = () => {
    // 验证平仓数量
    if (!BNumber.from(closedLots)?.gt(0)) {
      toast.error(<Trans>请输入平仓数量</Trans>)
      return
    }

    // 调用平仓 hook
    closePosition(
      {
        position,
        orderVolume: closedLots,
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
      },
    )
  }

  return (
    <>
      <DrawerHeader className="pt-3xl px-5">
        <DrawerTitle>
          <Trans>确认平仓</Trans>
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
            {BNumber.toFormatNumber(grossPnlInfo?.pnl, {
              volScale: currentAccountCurrencyInfo?.currencyDecimal,
              unit: currentAccountCurrencyInfo?.currencyUnit,
              forceSign: true,
              positive: false,
            })}
          </Text>
        </View>

        {/* Don't ask again checkbox */}
        <View className="flex-row items-center">
          <Pressable onPress={() => setDontAskAgain(!dontAskAgain)} className="flex-row items-center gap-[8px]">
            <Checkbox checked={dontAskAgain} onCheckedChange={setDontAskAgain} />
            <Text className="text-paragraph-p3 text-content-4 w-0 flex-1 break-words">
              <Trans>关闭平仓浮窗后平仓操作默认全部平仓，您可以在设置-交易设置中开启</Trans>
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
