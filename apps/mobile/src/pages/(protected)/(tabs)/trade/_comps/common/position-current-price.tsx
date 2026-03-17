import { observer } from 'mobx-react-lite'

import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { OrderTypeEnum } from '@/options/trade/order'
import { TradePositionDirectionEnum } from '@/options/trade/position'
import { Order } from '@/v1/services/tradeCore/order/typings'
import { useGetCurrentQuoteCallback } from '@/v1/utils/wsUtil'
import { BNumber } from '@mullet/utils/number'

export const PositionCurrentPrice = observer(
  ({
    info,
    className,
  }: {
    info: Pick<Order.BgaOrderPageListItem, 'symbol' | 'buySell' | 'symbolDecimal'>
    className?: string
  }) => {
    const getCurrentQuote = useGetCurrentQuoteCallback()
    const symbolMarketInfo = getCurrentQuote(info.symbol)
    const currentPrice = info.buySell === TradePositionDirectionEnum.BUY ? symbolMarketInfo?.ask : symbolMarketInfo?.bid
    const priceDiff =
      info.buySell === TradePositionDirectionEnum.BUY ? symbolMarketInfo?.askDiff : symbolMarketInfo?.bidDiff
    const priceDiffColor = BNumber.from(priceDiff).gt(0)
      ? 'text-market-rise'
      : BNumber.from(priceDiff).lt(0)
        ? 'text-market-fall'
        : 'text-content-1'

    return (
      <Text className={cn(priceDiffColor, className)}>
        {BNumber.toFormatNumber(currentPrice, { volScale: info.symbolDecimal })}
      </Text>
    )
  },
)

export const PendingCurrentPrice = observer(
  ({
    info,
    className,
  }: {
    info: Pick<Order.BgaOrderPageListItem, 'symbol' | 'buySell' | 'type' | 'symbolDecimal'>
    className?: string
  }) => {
    const getCurrentQuote = useGetCurrentQuoteCallback()
    const symbolMarketInfo = getCurrentQuote(info.symbol)

    const isLimitOrder = info.type !== OrderTypeEnum.MARKET_ORDER

    const currentPrice =
      info.buySell === TradePositionDirectionEnum.BUY
        ? isLimitOrder
          ? symbolMarketInfo?.bid
          : symbolMarketInfo?.ask
        : isLimitOrder
          ? symbolMarketInfo?.ask
          : symbolMarketInfo?.bid
    const priceDiff =
      info.buySell === TradePositionDirectionEnum.BUY
        ? isLimitOrder
          ? symbolMarketInfo?.bidDiff
          : symbolMarketInfo?.askDiff
        : isLimitOrder
          ? symbolMarketInfo?.askDiff
          : symbolMarketInfo?.bidDiff
    const priceDiffColor = BNumber.from(priceDiff).gt(0)
      ? 'text-market-rise'
      : BNumber.from(priceDiff).lt(0)
        ? 'text-market-fall'
        : 'text-content-1'

    return (
      <Text className={cn(priceDiffColor, className)}>
        {BNumber.toFormatNumber(currentPrice, { volScale: info.symbolDecimal })}
      </Text>
    )
  },
)
