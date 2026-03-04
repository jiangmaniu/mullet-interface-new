import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { createContext, useContext, useEffect, useImperativeHandle, useLayoutEffect, useState } from 'react'
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
import { useStores } from '@/v1/provider/mobxProvider'
import { Order } from '@/v1/services/tradeCore/order/typings'
import { RecordModalItem } from '@/v1/stores/trade'
import { BNumber } from '@mullet/utils/number'

import { PositionCurrentPrice } from '../../common/position-current-price'

interface PositionTpSlDrawerProps {
  position: Order.BgaOrderPageListItem
}

const PositionTpSlDrawerContent = observer(({ position }: PositionTpSlDrawerProps) => {
  const positionInfo = parseTradePositionInfo(position)
  const { trade } = useStores()
  const currentAccountInfo = trade.currentAccountInfo
  let {
    setSp,
    setSl,
    sp_scope,
    sl_scope,
    spValueEstimateRaw, // 使用 formatNum 格式化之前的值
    // spValueEstimate,
    slValueEstimateRaw, // 使用 formatNum 格式化之前的值
    // slValueEstimate,
    spValuePrice,
    slValuePrice,
    disabledInput: disabled,
  } = useSpSl()

  const handleConfirm = () => {
    // onConfirm(takeProfitPrice, takeProfitPercent, stopLossPrice, stopLossPercent)
    // onOpenChange(false)
  }

  const isConfirmDisabled = !spValuePrice && !slValuePrice

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
                disabled={disabled}
                labelText={<Trans>止盈触发价</Trans>}
                displayLabelClassName="bg-special"
                value={BNumber.from(spValuePrice)?.toFixed()}
                onValueChange={({ value }, { source }) => {
                  if (source === NumberInputSourceType.EVENT) {
                    setSp(value)
                  }
                }}
                keyboardType="decimal-pad"
                placeholder={<Trans>输入价格</Trans>}
                variant="outlined"
                size="md"
              />
            </View>
            {/* <View className="w-[90px]">
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
            </View> */}
          </View>
          <View className="flex-row justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>范围</Trans>
              {` ${positionInfo.isBuy ? '≥' : '≤'} `}
              <Text className="text-content-1 text-paragraph-p3">
                {BNumber.toFormatNumber(sp_scope, {
                  volScale: positionInfo.symbolDecimal,
                })}
              </Text>
            </Text>
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>预计盈亏</Trans>
              <Text className="text-content-1 text-paragraph-p3">
                {BNumber.toFormatNumber(spValueEstimateRaw, {
                  volScale: currentAccountInfo.currencyDecimal,
                  unit: currentAccountInfo.currencyUnit,
                  positive: false,
                  forceSign: true,
                })}
              </Text>
            </Text>
          </View>
        </View>

        {/* Stop Loss Section */}
        <View className="gap-xs">
          <View className="gap-xl flex-row">
            <View className="flex-1">
              <NumberInput
                disabled={disabled}
                labelText={<Trans>止损触发价</Trans>}
                displayLabelClassName="bg-special"
                value={BNumber.from(slValuePrice)?.toFixed()}
                onValueChange={({ value }, { source }) => {
                  if (source === NumberInputSourceType.EVENT) {
                    setSl(value)
                  }
                }}
                keyboardType="decimal-pad"
                placeholder={<Trans>输入价格</Trans>}
                variant="outlined"
                size="md"
              />
            </View>
            {/* <View className="w-[90px]">
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
            </View> */}
          </View>
          <View className="flex-row justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>范围</Trans> {` ${positionInfo.isBuy ? '≤' : '≥'} `}{' '}
              <Text className="text-content-1 text-paragraph-p3">
                {BNumber.toFormatNumber(sl_scope, {
                  volScale: positionInfo.symbolDecimal,
                })}
              </Text>
            </Text>
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>预计盈亏</Trans>
              <Text className="text-content-1 text-paragraph-p3">
                {BNumber.toFormatNumber(slValueEstimateRaw, {
                  volScale: currentAccountInfo.currencyDecimal,
                  unit: currentAccountInfo.currencyUnit,
                })}
              </Text>
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

export const PositionTpSlDrawer = observer(
  ({
    position,
    ref,
  }: PositionTpSlDrawerProps & {
    ref: React.RefObject<Nilable<DrawerRef>>
  }) => {
    const [open, toggleActions] = useToggle()
    const { toggle, setLeft: setFalse, setRight: setTrue, set: onSet } = toggleActions
    const { trade } = useStores()

    useImperativeHandle(ref, () => ({
      open: () => setTrue(),
      close: () => setFalse(),
      toggle: () => toggle(),
    }))

    useLayoutEffect(() => {
      if (position) {
        trade.resetTradeAction({
          orderVolume: String(position.orderVolume),
        }) // 重置
        trade.resetSpSl() // 重置
        // 持仓列表核心赋值操作 ！！！
        if (!position.symbol) return
        console.log('====== 取【当前查看】持仓单数据与行情，计算止盈止损 ======')
        trade.setActiveSymbolName(position.symbol)
        trade.setRecordModalItem(position)
        if (position?.takeProfit) {
          trade.setSp(position?.takeProfit.toString())
        }

        if (position?.stopLoss) {
          trade.setSl(position?.stopLoss.toString())
        }
      }

      return () => {
        trade.resetSpSl()
        trade.setRecordModalItem({} as RecordModalItem)
        console.log('【当前查看】持仓单设为空')
      }
    }, [position])

    return (
      <PositionTpSlDrawerContext.Provider value={toggleActions}>
        <Drawer open={open} onOpenChange={onSet}>
          <DrawerContent>
            <PositionTpSlDrawerContent position={position} />
          </DrawerContent>
        </Drawer>
      </PositionTpSlDrawerContext.Provider>
    )
  },
)
