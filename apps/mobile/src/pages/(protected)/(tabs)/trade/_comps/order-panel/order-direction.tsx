import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { Pressable, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'

import { Text } from '@/components/ui/text'
import { TradePositionDirectionEnum } from '@/options/trade/position'
import { useStores } from '@/v1/provider/mobxProvider'
import { useGetCurrentQuoteCallback } from '@/v1/utils/wsUtil'
import { BNumber } from '@mullet/utils/number'

export const OrderDirection = observer(({ symbol }: { symbol: string }) => {
  const { trade } = useStores()
  const { buySell, setBuySell } = trade
  const isBuy = buySell === TradePositionDirectionEnum.BUY
  const isSell = buySell === TradePositionDirectionEnum.SELL

  const symbolInfo = trade.getActiveSymbolInfo(symbol)
  const getCurrentQuote = useGetCurrentQuoteCallback()
  const quoteInfo = getCurrentQuote(symbol)

  // Get URL params
  const { direction } = useLocalSearchParams<{ direction?: TradePositionDirectionEnum }>()

  useEffect(() => {
    if (direction) {
      setBuySell(direction)
    }
  }, [direction])

  console.log(quoteInfo?.spread)
  return (
    <View className="gap-medium relative flex-row items-center">
      <Pressable
        onPress={() => setBuySell(TradePositionDirectionEnum.BUY)}
        className={`px-xl rounded-small h-[40px] flex-1 flex-row items-center justify-center ${isBuy ? 'bg-market-rise' : 'bg-button'}`}
      >
        <Text className={`text-button-2 font-medium ${isBuy ? 'text-market-rise-foreground' : 'text-content-4'}`}>
          {BNumber.toFormatNumber(quoteInfo?.bid, { volScale: symbolInfo?.symbolDecimal })}
        </Text>
        <Text className={`text-button-2 ml-xs ${isBuy ? 'text-market-rise-foreground' : 'text-content-4'}`}>
          <Trans>买入/做多</Trans>
        </Text>
      </Pressable>

      {/* Spread Badge - Centered */}
      <View className="absolute top-1/2 left-1/2 z-10 size-[20px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xs bg-white p-[2px]">
        <Text className="text-paragraph-p3 text-content-foreground">{BNumber.toFormatNumber(quoteInfo?.spread)}</Text>
      </View>

      <Pressable
        onPress={() => setBuySell(TradePositionDirectionEnum.SELL)}
        className={`px-xl rounded-small h-[40px] flex-1 flex-row items-center justify-center ${
          isSell ? 'bg-market-fall' : 'bg-button'
        }`}
      >
        <Text className={`text-button-2 font-medium ${isSell ? 'text-market-fall-foreground' : 'text-content-4'}`}>
          {BNumber.toFormatNumber(quoteInfo?.ask, { volScale: symbolInfo?.symbolDecimal })}
        </Text>
        <Text className={`text-button-2 ml-xs ${isSell ? 'text-market-fall-foreground' : 'text-content-4'}`}>
          <Trans>卖出/做空</Trans>
        </Text>
      </Pressable>
    </View>
  )
})
