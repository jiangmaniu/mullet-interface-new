import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { View } from 'react-native'

import { NumberInput, NumberInputSourceType } from '@/components/ui/number-input'
import { Switch } from '@/components/ui/switch'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { TradePositionDirectionEnum } from '@/options/trade/position'
import useSpSl from '@/v1/hooks/trade/useSpSl'
import { useStores } from '@/v1/provider/mobxProvider'
import { BNumber } from '@mullet/utils/number'

export const OrderTpSl = observer(({ symbol }: { symbol: string }) => {
  const { trade } = useStores()
  const { setOrderSpslChecked, orderSpslChecked } = trade

  return (
    <View className="gap-xl">
      {/* Stop Loss Toggle */}
      <View className="gap-medium flex-row items-center">
        <Switch checked={orderSpslChecked} onCheckedChange={setOrderSpslChecked} />
        <Text className="text-paragraph-p3 text-content-4">
          <Trans>止盈/止损</Trans>
        </Text>
      </View>

      {/* Stop Loss/Take Profit Inputs - Only show when enabled */}
      {orderSpslChecked && (
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

const SetTakeProfit = observer(({ symbol }: { symbol: string }) => {
  const { trade } = useStores()
  const { currentAccountInfo } = trade

  let {
    setSp,
    sp_scope,
    spValueEstimateRaw, // 使用 formatNum 格式化之前的值
    spValuePrice,
    disabledInput: disabled,
  } = useSpSl()
  const symbolInfo = trade.getActiveSymbolInfo(symbol)
  const isOrderDirectionBuy = trade.buySell === TradePositionDirectionEnum.BUY

  const takeProfitPrice = BNumber.from(spValuePrice)?.cutDecimalPlaces(symbolInfo?.symbolDecimal)?.toString()

  return (
    <View className="gap-xs">
      <View className="gap-xl flex-row">
        <NumberInput
          labelText={<Trans>止盈触发价</Trans>}
          value={takeProfitPrice}
          onValueChange={({ value }, { source }) => {
            if (source === NumberInputSourceType.EVENT) {
              setSp(value)
            }
          }}
          keyboardType="decimal-pad"
          placeholder={<Trans>输入价格</Trans>}
          variant="outlined"
          size="md"
          className="flex-1"
          disabled={disabled}
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
          <Trans>范围</Trans> {` ${isOrderDirectionBuy ? '≥' : '≤'} `}
          <Text className="text-market-fall text-paragraph-p3">
            {BNumber.toFormatNumber(sp_scope, {
              volScale: symbolInfo?.symbolDecimal,
            })}
          </Text>
        </Text>
        <Text className="text-paragraph-p3 text-content-4">
          <Trans>预计盈亏</Trans>{' '}
          <Text
            className={cn(
              'text-paragraph-p3',
              BNumber.from(spValueEstimateRaw).gt(0)
                ? 'text-market-rise'
                : BNumber.from(spValueEstimateRaw).lt(0)
                  ? 'text-market-fall'
                  : 'text-content-1',
            )}
          >
            {BNumber.toFormatNumber(spValueEstimateRaw, {
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

const SetStopLoss = observer(({ symbol }: { symbol: string }) => {
  const { trade } = useStores()
  const { currentAccountInfo } = trade
  let {
    setSl,
    sl_scope,
    slValueEstimateRaw, // 使用 formatNum 格式化之前的值
    slValuePrice,
    disabledInput: disabled,
  } = useSpSl()
  const symbolInfo = trade.getActiveSymbolInfo(symbol)
  const isOrderDirectionBuy = trade.buySell === TradePositionDirectionEnum.BUY

  const stopLossPrice = BNumber.from(slValuePrice)?.cutDecimalPlaces(symbolInfo?.symbolDecimal)?.toString()

  return (
    <View className="gap-xs">
      <View className="gap-xl flex-row">
        <NumberInput
          labelText={<Trans>止损触发价</Trans>}
          value={stopLossPrice}
          onValueChange={({ value }, { source }) => {
            if (source === NumberInputSourceType.EVENT) {
              setSl(value)
            }
          }}
          keyboardType="decimal-pad"
          placeholder={<Trans>输入价格</Trans>}
          variant="outlined"
          size="md"
          className="flex-1"
          disabled={disabled}
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
          <Trans>范围</Trans> {` ${isOrderDirectionBuy ? '≤' : '≥'} `}
          <Text className="text-market-fall text-paragraph-p3">
            {BNumber.toFormatNumber(sl_scope, {
              volScale: symbolInfo?.symbolDecimal,
            })}
          </Text>
        </Text>
        <Text className="text-paragraph-p3 text-content-4">
          <Trans>预计盈亏</Trans>{' '}
          <Text
            className={cn(
              'text-paragraph-p3',
              BNumber.from(slValueEstimateRaw).gt(0)
                ? 'text-market-rise'
                : BNumber.from(slValueEstimateRaw).lt(0)
                  ? 'text-market-fall'
                  : 'text-content-1',
            )}
          >
            {BNumber.toFormatNumber(slValueEstimateRaw, {
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
