import { observer } from 'mobx-react-lite'

import { Text } from '@/components/ui/text'
import { useMarketQuoteInfoWithSub } from '@/hooks/market/use-market-quote'
import { cn } from '@/lib/utils'
import { OrderTypeEnum } from '@/options/trade/order'
import { TradePositionDirectionEnum } from '@/options/trade/position'
import { Order } from '@/v1/services/tradeCore/order/typings'
import { BNumber } from '@mullet/utils/number'

export const PositionCurrentPrice = observer(
  ({
    info,
    className,
  }: {
    info?: Pick<Order.BgaOrderPageListItem, 'symbol' | 'buySell' | 'symbolDecimal'>
    className?: string
  }) => {
    const symbolMarketInfo = useMarketQuoteInfoWithSub(info?.symbol)
    const currentPrice =
      info?.buySell === TradePositionDirectionEnum.BUY
        ? symbolMarketInfo?.userSellPrice
        : info?.buySell === TradePositionDirectionEnum.SELL
          ? symbolMarketInfo?.userBuyPrice
          : undefined
    const priceDiff =
      info?.buySell === TradePositionDirectionEnum.BUY
        ? symbolMarketInfo?.userSellPriceDiff
        : info?.buySell === TradePositionDirectionEnum.SELL
          ? symbolMarketInfo?.userBuyPriceDiff
          : undefined

    const priceDiffColor = BNumber.from(priceDiff)?.gt(0)
      ? 'text-market-rise'
      : BNumber.from(priceDiff)?.lt(0)
        ? 'text-market-fall'
        : 'text-content-1'

    return (
      <Text className={cn(priceDiffColor, className)}>
        {BNumber.toFormatNumber(currentPrice, { volScale: info?.symbolDecimal })}
      </Text>
    )
  },
)

export const PendingCurrentPrice = observer(
  ({
    info,
    className,
  }: {
    info?: Pick<Order.BgaOrderPageListItem, 'symbol' | 'buySell' | 'type' | 'symbolDecimal'>
    className?: string
  }) => {
    const symbolMarketInfo = useMarketQuoteInfoWithSub(info?.symbol)

    const isLimitOrder = info?.type !== OrderTypeEnum.MARKET_ORDER

    const currentPrice =
      info?.buySell === TradePositionDirectionEnum.BUY
        ? isLimitOrder
          ? symbolMarketInfo?.userBuyPrice
          : symbolMarketInfo?.userSellPrice
        : isLimitOrder
          ? symbolMarketInfo?.userSellPrice
          : symbolMarketInfo?.userBuyPrice
    const priceDiff =
      info?.buySell === TradePositionDirectionEnum.BUY
        ? isLimitOrder
          ? symbolMarketInfo?.userBuyPriceDiff
          : symbolMarketInfo?.userSellPriceDiff
        : isLimitOrder
          ? symbolMarketInfo?.userSellPriceDiff
          : symbolMarketInfo?.userBuyPriceDiff

    const priceDiffColor = BNumber.from(priceDiff)?.gt(0)
      ? 'text-market-rise'
      : BNumber.from(priceDiff)?.lt(0)
        ? 'text-market-fall'
        : 'text-content-1'

    return (
      <Text className={cn(priceDiffColor, className)}>
        {BNumber.toFormatNumber(currentPrice, { volScale: info?.symbolDecimal })}
      </Text>
    )
  },
)
