import { observer } from "mobx-react-lite"

import { View, Pressable } from 'react-native'
import { Text } from '@/components/ui/text'
import { Trans } from '@lingui/react/macro'
import { useStores } from "@/v1/provider/mobxProvider"
import { useGetCurrentQuoteCallback } from "@/v1/utils/wsUtil"
import { BNumber } from "@mullet/utils/number"

export const OrderDirection = observer(({ symbol }: { symbol: string }) => {
  const { trade } = useStores()
  const { buySell, setBuySell } = trade
  const isBuy = buySell === 'BUY'
  const isSell = buySell === 'SELL'

  const symbolInfo = trade.getActiveSymbolInfo(symbol)
  const getCurrentQuote = useGetCurrentQuoteCallback()
  const quoteInfo = getCurrentQuote(symbol)
  console.log(quoteInfo?.spread)
  return (
    <View className="flex-row gap-medium items-center relative">
      <Pressable
        onPress={() => setBuySell('BUY')}
        className={`flex-1 h-[40px] px-xl rounded-small flex-row items-center justify-center ${isBuy ? 'bg-market-rise' : 'bg-button'}`}
      >
        <Text
          className={`text-button-2 font-medium ${isBuy ? 'text-market-rise-foreground' : 'text-content-4'}`}
        >
          {BNumber.toFormatNumber(quoteInfo?.bid, { volScale: symbolInfo.symbolDecimal })}
        </Text>
        <Text
          className={`text-button-2 ml-xs ${isBuy ? 'text-market-rise-foreground' : 'text-content-4'}`}
        >
          <Trans>买入/做多</Trans>
        </Text>
      </Pressable>

      {/* Spread Badge - Centered */}
      <View className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xs p-[2px] z-10 items-center justify-center size-[20px]">
        <Text className="text-paragraph-p3 text-content-foreground">{BNumber.toFormatNumber(quoteInfo?.spread)}</Text>
      </View>

      <Pressable
        onPress={() => setBuySell('SELL')}
        className={`flex-1 h-[40px] px-xl rounded-small flex-row items-center justify-center ${isSell ? 'bg-market-fall' : 'bg-button'
          }`}
      >
        <Text
          className={`text-button-2 font-medium ${isSell ? 'text-market-fall-foreground' : 'text-content-4'}`}
        >
          {BNumber.toFormatNumber(quoteInfo?.ask, { volScale: symbolInfo.symbolDecimal })}
        </Text>
        <Text
          className={`text-button-2 ml-xs ${isSell ? 'text-market-fall-foreground' : 'text-content-4'}`}
        >
          <Trans>卖出/做空</Trans>
        </Text>
      </Pressable>
    </View>
  )
})
