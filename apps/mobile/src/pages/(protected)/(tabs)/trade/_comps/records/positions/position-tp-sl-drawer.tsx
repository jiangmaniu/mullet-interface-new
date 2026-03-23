import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import React, { createContext, Dispatch, SetStateAction, useContext, useImperativeHandle, useState } from 'react'
import { View } from 'react-native'
import { useShallow } from 'zustand/react/shallow'
import { useToggle } from 'ahooks'
import { Actions } from 'ahooks/lib/useToggle'

import { AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerRef, DrawerTitle } from '@/components/ui/drawer'
import { NumberInput, NumberInputSourceType } from '@/components/ui/number-input'
import { Text } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'
import { calcOrderTpSlScopePriceInfo, TpSlDirectionEnum } from '@/helpers/calc/order'
import { calcPnlInfo } from '@/helpers/calc/pnl'
import { calcCurrencyExchangeRate } from '@/helpers/calc/trade'
import { renderFormatSymbolName } from '@/helpers/symbol'
import { cn } from '@/lib/utils'
import { parseTradePositionInfo } from '@/pages/(protected)/(trade)/_helpers/position'
import { useDisabledTrade } from '@/pages/(protected)/(trade)/_hooks/use-disabled-trade'
import { useRootStore } from '@/stores'
import {
  userInfoActiveTradeAccountCurrencyInfoSelector,
  userInfoActiveTradeAccountIdSelector,
} from '@/stores/user-slice/infoSlice'
import { getImgSource } from '@/utils/img'
import { useStores } from '@/v1/provider/mobxProvider'
import { modifyStopProfitLoss } from '@/v1/services/tradeCore/order'
import { Order } from '@/v1/services/tradeCore/order/typings'
import { BNumber } from '@mullet/utils/number'

import { useVerifyOrderTpSlData } from '../../../_hooks/use-verify-order'
import { PositionCurrentPrice } from '../../common/position-current-price'

interface PositionTpSlDrawerProps {
  position: Order.BgaOrderPageListItem
}

type PositionTpSlDrawerContextType = Actions<boolean> & {
  tpPrice: string
  setTpPrice: Dispatch<SetStateAction<string>>
  slPrice: string
  setSlPrice: Dispatch<SetStateAction<string>>
  amount: string
  setAmount: Dispatch<SetStateAction<string>>
  position: Order.BgaOrderPageListItem
}

const PositionTpSlDrawerContext = createContext<PositionTpSlDrawerContextType>({
  setLeft: () => {},
  setRight: () => {},
  set: () => {},
  toggle: () => {},

  tpPrice: '',
  setTpPrice: () => {},
  slPrice: '',
  setSlPrice: () => {},
  amount: '',
  setAmount: () => {},
  position: {} as Order.BgaOrderPageListItem,
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

    useImperativeHandle(ref, () => ({
      open: () => setTrue(),
      close: () => setFalse(),
      toggle: () => toggle(),
    }))

    const [tpPrice, setTpPrice] = useState(position?.takeProfit?.toString() || '')
    const [slPrice, setSlPrice] = useState(position?.stopLoss?.toString() || '')
    const [amount, setAmount] = useState(position?.orderVolume?.toString() || '')

    return (
      <PositionTpSlDrawerContext.Provider
        value={{
          ...toggleActions,
          tpPrice,
          setTpPrice,
          slPrice,
          setSlPrice,
          amount,
          setAmount,
          position,
        }}
      >
        <Drawer open={open} onOpenChange={onSet}>
          <DrawerContent>
            <PositionTpSlDrawerContent />
          </DrawerContent>
        </Drawer>
      </PositionTpSlDrawerContext.Provider>
    )
  },
)

const PositionTpSlDrawerContent = observer(() => {
  const currentAccountId = useRootStore(userInfoActiveTradeAccountIdSelector)
  const { trade } = useStores()

  const { tpPrice, slPrice, position, setLeft: setFalse } = usePositionTpSlDrawerContext()

  const positionInfo = parseTradePositionInfo(position)
  const { disabledBtn } = useDisabledTrade({
    accountId: currentAccountId,
    symbol: positionInfo.symbol,
  })

  const [loading, toggleLoading] = useToggle(false)
  const { verifyOrderTpSlData } = useVerifyOrderTpSlData()

  const handleConfirm = async () => {
    try {
      if (loading) return
      toggleLoading.setRight()

      if (disabledBtn) {
        toast.warning(<Trans>账户禁用或休市，无法进行交易</Trans>)
        return
      }

      const isTpSlValid = verifyOrderTpSlData({
        tpPrice,
        slPrice,
        openPrice: positionInfo.startPrice,
        level: positionInfo.conf?.limitStopLevel,
        decimals: positionInfo.symbolDecimal,
        direction: positionInfo.direction,
      })
      if (!isTpSlValid) {
        return
      }

      const params: Partial<Order.ModifyStopProfitLossParams> = {
        bagOrderId: position.id,
        stopLoss: slPrice,
        takeProfit: tpPrice,
      }

      // if (BNumber.from(slPrice).gt(0)) {
      //   params.stopLoss = slPrice
      // }

      const res = await modifyStopProfitLoss(params as Order.ModifyStopProfitLossParams)

      if (res.success) {
        await useRootStore.getState().trade.position.fetch(true)
        toast.success(<Trans>修改止盈止损成功</Trans>)
        setFalse()
      }
    } finally {
      toggleLoading.setLeft()
    }
  }

  const isConfirmDisabled = !tpPrice && !slPrice

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
          <Badge color={positionInfo?.isBuy ? 'rise' : 'fall'}>
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
        <PositionTpForm />

        {/* Stop Loss Section */}
        <PositionSlForm />

        {/* Warning */}
        <View className="">
          <Text className="text-paragraph-p4 text-status-warning">
            <Trans>由于行情变动快，止损触发价不宜离预估强平价过近，避免触发失败</Trans>
          </Text>
        </View>
      </View>

      <DrawerFooter className="pb-3xl px-5">
        <Button
          variant="solid"
          color="primary"
          size="lg"
          block
          onPress={handleConfirm}
          disabled={isConfirmDisabled}
          loading={loading}
        >
          <Text className={isConfirmDisabled ? 'text-content-6' : 'text-content-foreground'}>
            <Trans>确认</Trans>
          </Text>
        </Button>
      </DrawerFooter>
    </>
  )
})

const PositionTpForm = observer(() => {
  const currentAccountCurrencyInfo = useRootStore(useShallow(userInfoActiveTradeAccountCurrencyInfoSelector))
  const { setTpPrice, position, amount, tpPrice } = usePositionTpSlDrawerContext()

  const positionInfo = parseTradePositionInfo(position)

  const { disabledInput } = useDisabledTrade({
    accountId: currentAccountCurrencyInfo?.id,
    symbol: positionInfo.symbol,
  })

  const pnlInfo = calcPnlInfo({
    contractSize: positionInfo?.conf?.contractSize,
    direction: positionInfo.direction,
    openPrice: positionInfo.startPrice,
    amount: amount,
    closePrice: tpPrice,
  })

  const pnlInAccountCurrency = calcCurrencyExchangeRate({
    value: pnlInfo?.pnl,
    unit: positionInfo?.conf?.profitCurrency,
    buySell: positionInfo.direction,
  })

  const { scopePrice, scopePriceFlag, isGte, isLte } = calcOrderTpSlScopePriceInfo({
    direction: positionInfo.direction,
    price: positionInfo.startPrice,
    TpSlDirection: TpSlDirectionEnum.TP,
    level: positionInfo?.conf?.limitStopLevel,
    decimals: positionInfo?.symbolDecimal,
  })

  const isOutScope = isGte
    ? BNumber.from(tpPrice)?.lt(scopePrice)
    : isLte
      ? BNumber.from(tpPrice)?.gt(scopePrice)
      : false

  return (
    <View className="gap-xs">
      <View className="gap-xl flex-row">
        <View className="flex-1">
          <NumberInput
            disabled={disabledInput}
            labelText={<Trans>止盈触发价</Trans>}
            displayLabelClassName="bg-special"
            value={tpPrice}
            onValueChange={({ value }, { source }) => {
              if (source === NumberInputSourceType.EVENT) {
                setTpPrice(value)
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
          {` ${scopePriceFlag} `}
          <Text className={cn('text-paragraph-p3', isOutScope ? 'text-market-fall' : 'text-content-1')}>
            {BNumber.toFormatNumber(scopePrice, {
              volScale: positionInfo.symbolDecimal,
            })}
          </Text>
        </Text>
        <Text className="text-paragraph-p3 text-content-4">
          <Trans>预计盈亏</Trans>
          <Text
            className={cn(
              'text-paragraph-p3',
              pnlInfo?.isProfit ? 'text-market-rise' : pnlInfo?.isLoss ? 'text-market-fall' : 'text-content-1',
            )}
          >
            {BNumber.toFormatNumber(pnlInAccountCurrency, {
              volScale: currentAccountCurrencyInfo?.currencyDecimal,
              unit: currentAccountCurrencyInfo?.currencyUnit,
              positive: false,
              forceSign: true,
            })}
          </Text>
        </Text>
      </View>
    </View>
  )
})

const PositionSlForm = observer(() => {
  const currentAccountCurrencyInfo = useRootStore(useShallow(userInfoActiveTradeAccountCurrencyInfoSelector))
  const { slPrice, setSlPrice, position } = usePositionTpSlDrawerContext()

  const positionInfo = parseTradePositionInfo(position)

  const { disabledInput } = useDisabledTrade({
    accountId: currentAccountCurrencyInfo?.id,
    symbol: positionInfo.symbol,
  })

  const pnlInfo = calcPnlInfo({
    direction: positionInfo.direction,
    openPrice: positionInfo.startPrice,
    amount: positionInfo.orderVolume,
    contractSize: positionInfo?.conf?.contractSize,
    closePrice: slPrice,
  })

  const pnlInAccountCurrency = calcCurrencyExchangeRate({
    value: pnlInfo?.pnl,
    unit: positionInfo?.conf?.profitCurrency,
    buySell: positionInfo.direction,
  })

  const { scopePrice, scopePriceFlag, isGte, isLte } = calcOrderTpSlScopePriceInfo({
    direction: positionInfo.direction,
    price: positionInfo.startPrice,
    TpSlDirection: TpSlDirectionEnum.SL,
    level: positionInfo?.conf?.limitStopLevel,
    decimals: positionInfo?.symbolDecimal,
  })

  const isOutScope = isGte
    ? BNumber.from(slPrice)?.lt(scopePrice)
    : isLte
      ? BNumber.from(slPrice)?.gt(scopePrice)
      : false

  return (
    <View className="gap-xs">
      <View className="gap-xl flex-row">
        <View className="flex-1">
          <NumberInput
            disabled={disabledInput}
            labelText={<Trans>止损触发价</Trans>}
            displayLabelClassName="bg-special"
            value={slPrice}
            onValueChange={({ value }, { source }) => {
              if (source === NumberInputSourceType.EVENT) {
                setSlPrice(value)
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
          <Trans>范围</Trans> {` ${scopePriceFlag} `}{' '}
          <Text className={cn('text-paragraph-p3', isOutScope ? 'text-market-fall' : 'text-content-1')}>
            {BNumber.toFormatNumber(scopePrice, {
              volScale: positionInfo.symbolDecimal,
            })}
          </Text>
        </Text>
        <Text className="text-paragraph-p3 text-content-4">
          <Trans>预计盈亏</Trans>
          <Text
            className={cn(
              'text-paragraph-p3',
              pnlInfo?.isProfit ? 'text-market-rise' : pnlInfo?.isLoss ? 'text-market-fall' : 'text-content-1',
            )}
          >
            {BNumber.toFormatNumber(pnlInAccountCurrency, {
              volScale: currentAccountCurrencyInfo?.currencyDecimal,
              unit: currentAccountCurrencyInfo?.currencyUnit,
              positive: false,
              forceSign: true,
            })}
          </Text>
        </Text>
      </View>
    </View>
  )
})
