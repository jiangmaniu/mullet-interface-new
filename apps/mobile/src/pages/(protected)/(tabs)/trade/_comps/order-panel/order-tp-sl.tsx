import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { View } from 'react-native'
import { useShallow } from 'zustand/react/shallow'

import { NumberInput, NumberInputSourceType } from '@/components/ui/number-input'
import { Switch } from '@/components/ui/switch'
import { Text } from '@/components/ui/text'
import { calcOrderTpSlScopePriceInfo, calcPnlInfo, TpSlDirectionEnum } from '@/helpers/calc/order'
import { calcCurrencyExchangeRate } from '@/helpers/calc/trade'
import { cn } from '@/lib/utils'
import { useDisabledTrade } from '@/pages/(protected)/(trade)/_hooks/use-disabled-trade'
import { useRootStore } from '@/stores'
import { useMarketSymbolInfo } from '@/stores/market-slice'
import { tradeFormDataSelector } from '@/stores/trade-slice/formDataSlice'
import { useStores } from '@/v1/provider/mobxProvider'
import { BNumber } from '@mullet/utils/number'

import { useCreateOrderPrice } from './_hooks/use-order-price'

export const OrderTpSl = observer(({ symbol }: { symbol?: string }) => {
  const hasTpSl = useRootStore((s) => {
    return tradeFormDataSelector(s).hasTpSl
  })

  return (
    <View className="gap-xl">
      {/* Stop Loss Toggle */}
      <View className="gap-medium flex-row items-center">
        <Switch
          checked={hasTpSl}
          onCheckedChange={(v) => {
            tradeFormDataSelector(useRootStore.getState()).setFormData({ hasTpSl: v })
          }}
        />
        <Text className="text-paragraph-p3 text-content-4">
          <Trans>止盈/止损</Trans>
        </Text>
      </View>

      {/* Stop Loss/Take Profit Inputs - Only show when enabled */}
      {hasTpSl && (
        <>
          {/* Take Profit Section */}
          <SetTakeProfit symbol={symbol} />

          {/* Stop Loss Section */}
          <SetStopLoss symbol={symbol} />
        </>
      )}
    </View>
  )
})

const SetTakeProfit = observer(({ symbol }: { symbol?: string }) => {
  const { trade } = useStores()
  const { currentAccountInfo } = trade

  const { disabledInput } = useDisabledTrade({ symbol, accountId: currentAccountInfo.id })

  const symbolInfo = useMarketSymbolInfo(symbol)
  const { direction, tpPrice, amount, setFormData } = useRootStore(
    useShallow((s) => {
      const { amount, direction, tpPrice, setFormData } = tradeFormDataSelector(s)
      return {
        amount,
        direction,
        tpPrice,
        setFormData,
      }
    }),
  )

  const createOrderPrice = useCreateOrderPrice({ symbol })

  const pnlInfo = calcPnlInfo({
    direction,
    openPrice: createOrderPrice,
    amount: amount,
    contractSize: symbolInfo?.symbolConf?.contractSize,
    closePrice: tpPrice,
  })

  const pnlInAccountCurrency = calcCurrencyExchangeRate({
    value: pnlInfo?.pnl,
    unit: symbolInfo?.symbolConf?.profitCurrency,
    buySell: direction,
  })

  const { scopePrice, scopePriceFlag, isGte, isLte } = useMemo(() => {
    const tpScopePriceInfo = calcOrderTpSlScopePriceInfo({
      direction,
      price: createOrderPrice,
      TpSlDirection: TpSlDirectionEnum.TP,
      level: symbolInfo?.symbolConf?.limitStopLevel,
      decimals: symbolInfo?.symbolDecimal,
    })
    return tpScopePriceInfo
  }, [createOrderPrice, direction, symbolInfo?.symbolConf?.limitStopLevel, symbolInfo?.symbolDecimal])

  const isOutScope = isGte
    ? BNumber.from(tpPrice)?.lt(scopePrice)
    : isLte
      ? BNumber.from(tpPrice)?.gt(scopePrice)
      : false

  return (
    <View className="gap-xs">
      <View className="gap-xl flex-row">
        <NumberInput
          labelText={<Trans>止盈触发价</Trans>}
          value={tpPrice}
          onValueChange={({ value }, { source }) => {
            if (source === NumberInputSourceType.EVENT) {
              setFormData({ tpPrice: value })
            }
          }}
          keyboardType="decimal-pad"
          placeholder={<Trans>输入价格</Trans>}
          variant="outlined"
          size="md"
          className="flex-1"
          disabled={disabledInput}
        />
        {/* <Input
        labelText={t`百分比`}
        value={takeProfitPercent}
        onValueChange={setTakeProfitPercent}
        keyboardType="decimal-pad"
        placeholder="0.00"
        clean={false}
        RightContent={<Text className="text-paragraph-p2 text-content-1">%</Text>}
        variant="outlined"
        size="md"
        className="w-[90px]"
      /> */}
      </View>
      <View className="flex-row justify-between">
        <Text className="text-paragraph-p3 text-content-4">
          <Trans>范围</Trans> {` ${scopePriceFlag} `}
          <Text className={cn('text-paragraph-p3', isOutScope ? 'text-market-fall' : 'text-content-1')}>
            {BNumber.toFormatNumber(scopePrice, {
              volScale: symbolInfo?.symbolDecimal,
            })}
          </Text>
        </Text>

        <Text className="text-paragraph-p3 text-content-4">
          <Trans>预计盈亏</Trans>{' '}
          <Text
            className={cn(
              'text-paragraph-p3',
              pnlInfo?.isProfit ? 'text-market-rise' : pnlInfo?.isLoss ? 'text-market-fall' : 'text-content-1',
            )}
          >
            {BNumber.toFormatNumber(pnlInAccountCurrency, {
              forceSign: true,
              positive: false,
              volScale: currentAccountInfo.currencyDecimal,
              unit: currentAccountInfo.currencyUnit,
            })}
          </Text>
        </Text>
      </View>
    </View>
  )
})

const SetStopLoss = observer(({ symbol }: { symbol?: string }) => {
  const { trade } = useStores()
  const { currentAccountInfo } = trade
  const { disabledInput } = useDisabledTrade({
    accountId: currentAccountInfo.id,
    symbol,
  })

  const symbolInfo = useMarketSymbolInfo(symbol)

  const { direction, slPrice, amount, setFormData } = useRootStore(
    useShallow((s) => {
      const { amount, direction, slPrice, setFormData } = tradeFormDataSelector(s)
      return {
        direction,
        slPrice,
        amount,
        setFormData,
      }
    }),
  )

  const createOrderPrice = useCreateOrderPrice({ symbol })

  const pnlInfo = calcPnlInfo({
    direction,
    openPrice: createOrderPrice,
    contractSize: symbolInfo?.symbolConf?.contractSize,
    amount: amount,
    closePrice: slPrice,
  })

  const pnlInAccountCurrency = calcCurrencyExchangeRate({
    value: pnlInfo?.pnl,
    unit: symbolInfo?.symbolConf?.profitCurrency,
    buySell: direction,
  })

  const { scopePrice, scopePriceFlag, isGte, isLte } = useMemo(() => {
    const tpScopePriceInfo = calcOrderTpSlScopePriceInfo({
      direction,
      price: createOrderPrice,
      TpSlDirection: TpSlDirectionEnum.SL,
      level: symbolInfo?.symbolConf?.limitStopLevel,
      decimals: symbolInfo?.symbolDecimal,
    })
    return tpScopePriceInfo
  }, [createOrderPrice, direction, symbolInfo?.symbolConf?.limitStopLevel, symbolInfo?.symbolDecimal])

  const isOutScope = isGte
    ? BNumber.from(slPrice)?.lt(scopePrice)
    : isLte
      ? BNumber.from(slPrice)?.gt(scopePrice)
      : false

  return (
    <View className="gap-xs">
      <View className="gap-xl flex-row">
        <NumberInput
          labelText={<Trans>止损触发价</Trans>}
          value={slPrice}
          onValueChange={({ value }, { source }) => {
            if (source === NumberInputSourceType.EVENT) {
              setFormData({ slPrice: value })
            }
          }}
          keyboardType="decimal-pad"
          placeholder={<Trans>输入价格</Trans>}
          variant="outlined"
          size="md"
          className="flex-1"
          disabled={disabledInput}
        />
        {/* <Input
        labelText={t`百分比`}
        value={takeProfitPercent}
        onValueChange={setTakeProfitPercent}
        keyboardType="decimal-pad"
        placeholder="0.00"
        clean={false}
        RightContent={<Text className="text-paragraph-p2 text-content-1">%</Text>}
        variant="outlined"
        size="md"
        className="w-[90px]"
      /> */}
      </View>
      <View className="flex-row justify-between">
        <Text className="text-paragraph-p3 text-content-4">
          <Trans>范围</Trans> {` ${scopePriceFlag} `}
          <Text className={cn('text-paragraph-p3', isOutScope ? 'text-market-fall' : 'text-content-1')}>
            {BNumber.toFormatNumber(scopePrice, {
              volScale: symbolInfo?.symbolDecimal,
            })}
          </Text>
        </Text>

        <Text className="text-paragraph-p3 text-content-4">
          <Trans>预计盈亏</Trans>{' '}
          <Text
            className={cn(
              'text-paragraph-p3',
              pnlInfo?.isProfit ? 'text-market-rise' : pnlInfo?.isLoss ? 'text-market-fall' : 'text-content-1',
            )}
          >
            {BNumber.toFormatNumber(pnlInAccountCurrency, {
              forceSign: true,
              positive: false,
              volScale: currentAccountInfo.currencyDecimal,
              unit: currentAccountInfo.currencyUnit,
            })}
          </Text>
        </Text>
      </View>
    </View>
  )
})
