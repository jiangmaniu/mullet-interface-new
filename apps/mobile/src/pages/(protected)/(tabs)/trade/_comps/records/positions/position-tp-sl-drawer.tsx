import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { createContext, useContext, useImperativeHandle, useState } from 'react'
import { View } from 'react-native'
import { useToggle } from 'ahooks'
import { Actions } from 'ahooks/lib/useToggle'

import { AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerRef, DrawerTitle } from '@/components/ui/drawer'
import { NumberInput, NumberInputSourceType } from '@/components/ui/number-input'
import { Text } from '@/components/ui/text'
import { renderFormatSymbolName } from '@/helpers/symbol'
import { t } from '@/locales/i18n'
import { parseTradePositionInfo } from '@/pages/(protected)/(trade)/_helpers/position'
import { getImgSource } from '@/utils/img'
import useSpSl from '@/v1/hooks/trade/useSpSl'
import { Order } from '@/v1/services/tradeCore/order/typings'
import { msg } from '@lingui/core/macro'
import { BNumber } from '@mullet/utils/number'

import { PositionCurrentPrice } from '../../common/position-current-price'

interface PositionTpSlDrawerProps {
  position: Order.BgaOrderPageListItem
}

const PositionTpSlDrawerContent = observer(({ position }: PositionTpSlDrawerProps) => {
  const positionInfo = parseTradePositionInfo(position)
  const [takeProfitPrice, setTakeProfitPrice] = useState('')
  const [takeProfitPercent, setTakeProfitPercent] = useState('')
  const [stopLossPrice, setStopLossPrice] = useState('')
  const [stopLossPercent, setStopLossPercent] = useState('')

  let {
    d,
    step,
    setSp,
    setSl,
    setSpAmount,
    setSlAmount,
    spValueEstimateRaw, // 使用 formatNum 格式化之前的值
    // spValueEstimate,
    slValueEstimateRaw, // 使用 formatNum 格式化之前的值
    // slValueEstimate,
    spValuePrice,
    slValuePrice,
    disabledInput: disabled,
    onSpAdd,
    onSpMinus,
    onSlAdd,
    onSlMinus,
  } = useSpSl()

  const handleConfirm = () => {
    // onConfirm(takeProfitPrice, takeProfitPercent, stopLossPrice, stopLossPercent)
    // onOpenChange(false)
  }

  // 计算止盈预计盈亏
  const calculateTakeProfitPL = () => {
    // const takeProfitPriceNum = parseFloat(takeProfitPrice)
    // const openPriceNum = parseFloat(openPrice)
    // if (isNaN(takeProfitPriceNum) || isNaN(openPriceNum)) return '0.00'
    // const diff = direction === 'long' ? takeProfitPriceNum - openPriceNum : openPriceNum - takeProfitPriceNum
    // return diff.toFixed(2)
  }

  // 计算止损预计盈亏
  const calculateStopLossPL = () => {
    // const stopLossPriceNum = parseFloat(stopLossPrice)
    // const openPriceNum = parseFloat(openPrice)
    // if (isNaN(stopLossPriceNum) || isNaN(openPriceNum)) return '0.00'
    // const diff = direction === 'long' ? stopLossPriceNum - openPriceNum : openPriceNum - stopLossPriceNum
    // return diff.toFixed(2)
  }

  // 根据百分比计算价格
  const handleTakeProfitPercentChange = (percent: string) => {
    // setTakeProfitPercent(percent)
    // const percentNum = parseFloat(percent)
    // const openPriceNum = parseFloat(openPrice)
    // if (!isNaN(percentNum) && !isNaN(openPriceNum)) {
    //   const newPrice =
    //     direction === 'long' ? openPriceNum * (1 + percentNum / 100) : openPriceNum * (1 - percentNum / 100)
    //   setTakeProfitPrice(newPrice.toFixed(2))
    // }
  }

  const handleStopLossPercentChange = (percent: string) => {
    // setStopLossPercent(percent)
    // const percentNum = parseFloat(percent)
    // const openPriceNum = parseFloat(openPrice)
    // if (!isNaN(percentNum) && !isNaN(openPriceNum)) {
    //   const newPrice =
    //     direction === 'long' ? openPriceNum * (1 - percentNum / 100) : openPriceNum * (1 + percentNum / 100)
    //   setStopLossPrice(newPrice.toFixed(2))
    // }
  }

  const isConfirmDisabled = !takeProfitPrice && !stopLossPrice

  return (
    <>
      <DrawerHeader className="pt-3xl px-5">
        <DrawerTitle>
          <Trans>止盈止损</Trans>
        </DrawerTitle>
      </DrawerHeader>

      <View className="gap-xl pb-medium px-5">
        {/* Symbol and Direction */}
        <View className="gap-medium flex-row items-center">
          <AvatarImage source={getImgSource(positionInfo.imgUrl)} className="size-6 rounded-full"></AvatarImage>
          <Text className="text-paragraph-p1 text-content-1">{renderFormatSymbolName(positionInfo)}</Text>
          <Badge color={positionInfo.isBuy ? 'rise' : 'fall'}>
            <Text>{positionInfo.isBuy ? <Trans>做多</Trans> : <Trans>做空</Trans>}</Text>
          </Badge>
        </View>

        {/* Price Info */}
        <View className="gap-medium">
          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p2 text-content-4">
              <Trans>开仓价</Trans>
            </Text>
            <Text className="text-paragraph-p2 text-content-1">
              {BNumber.toFormatNumber(positionInfo.startPrice, { volScale: positionInfo.symbolDecimal })}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p2 text-content-4">
              <Trans>标记价格</Trans>
            </Text>
            <PositionCurrentPrice className="text-paragraph-p2" info={positionInfo} />
          </View>
        </View>

        {/* Take Profit Section */}
        <View className="gap-xs">
          <View className="gap-xl flex-row">
            <View className="flex-1">
              <NumberInput
                labelText={<Trans>止盈触发价</Trans>}
                displayLabelClassName="bg-special"
                value={BNumber.from(spValuePrice)?.toFixed()}
                onValueChange={({ value }, { source }) => {
                  if (source === NumberInputSourceType.EVENT) {
                    setTakeProfitPrice(value)
                  }
                }}
                keyboardType="decimal-pad"
                placeholder={<Trans>输入价格</Trans>}
                variant="outlined"
                size="md"
              />
            </View>
            <View className="w-[90px]">
              <NumberInput
                labelText={<Trans>百分比</Trans>}
                displayLabelClassName="bg-special"
                value={BNumber.from(spValueEstimateRaw)?.toFixed()}
                onValueChange={({ value }, { source }) => {
                  if (source === NumberInputSourceType.EVENT) {
                    setTakeProfitPercent(value)
                  }
                }}
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
              <Trans>预计盈亏</Trans> ≥{' '}
              {/* <Text className="text-content-1 text-paragraph-p3">{calculateTakeProfitPL()} USDC</Text> */}
            </Text>
          </View>
        </View>

        {/* Stop Loss Section */}
        <View className="gap-xs">
          <View className="gap-xl flex-row">
            <View className="flex-1">
              <NumberInput
                labelText={<Trans>止损触发价</Trans>}
                displayLabelClassName="bg-special"
                value={stopLossPrice}
                onValueChange={({ value }, { source }) => {
                  if (source === NumberInputSourceType.EVENT) {
                    setStopLossPrice(value)
                  }
                }}
                keyboardType="decimal-pad"
                placeholder={<Trans>输入价格</Trans>}
                variant="outlined"
                size="md"
              />
            </View>
            <View className="w-[90px]">
              <NumberInput
                labelText={<Trans>百分比</Trans>}
                displayLabelClassName="bg-special"
                value={stopLossPercent}
                onValueChange={({ value }, { source }) => {
                  if (source === NumberInputSourceType.EVENT) {
                    setStopLossPercent(value)
                  }
                }}
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
              <Trans>预计盈亏</Trans> ≥{' '}
              {/* <Text className="text-content-1 text-paragraph-p3">{calculateStopLossPL()} USDC</Text> */}
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

      <DrawerFooter className="pb-3xl px-5">
        <Button variant="solid" color="primary" size="lg" block onPress={handleConfirm} disabled={isConfirmDisabled}>
          <Text className={isConfirmDisabled ? 'text-content-6' : 'text-content-foreground'}>
            <Trans>确认</Trans>
          </Text>
        </Button>
      </DrawerFooter>
    </>
  )
})

const PositionTpSlDrawerContext = createContext<Actions<boolean>>({
  setLeft: () => {},
  setRight: () => {},
  set: () => {},
  toggle: () => {},
})

const usePositionTpSlDrawerContext = () => {
  const context = useContext(PositionTpSlDrawerContext)
  if (!context) {
    throw new Error('usePositionTpSlDrawerContext must be used within a PositionTpSlDrawerContext')
  }
  return context
}

export function PositionTpSlDrawer({
  position,
  ref,
}: PositionTpSlDrawerProps & {
  ref: React.RefObject<Nilable<DrawerRef>>
}) {
  const [open, toggleActions] = useToggle()
  const { toggle, setLeft: setFalse, setRight: setTrue, set: onSet } = toggleActions

  useImperativeHandle(ref, () => ({
    open: () => setTrue(),
    close: () => setFalse(),
    toggle: () => toggle(),
  }))

  return (
    <PositionTpSlDrawerContext.Provider value={toggleActions}>
      <Drawer open={open} onOpenChange={onSet}>
        <DrawerContent>
          <PositionTpSlDrawerContent position={position} />
        </DrawerContent>
      </Drawer>
    </PositionTpSlDrawerContext.Provider>
  )
}
