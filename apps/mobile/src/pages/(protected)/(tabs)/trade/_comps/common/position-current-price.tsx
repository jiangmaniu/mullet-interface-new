import { Order } from "@/v1/services/tradeCore/order/typings"
import { observer } from "mobx-react-lite"
import { Text } from '@/components/ui/text'
import { cn } from "@/lib/utils"
import { useGetCurrentQuoteCallback } from "@/v1/utils/wsUtil"
import { BNumber } from "@mullet/utils/number"
import { TradePositionDirectionEnum } from "@/options/trade/position"

export const PositionCurrentPrice = observer(({ position, className }: { position: Order.BgaOrderPageListItem, className?: string }) => {
  const getCurrentQuote = useGetCurrentQuoteCallback()
  const symbolMarketInfo = getCurrentQuote(position.symbol)
  const currentPrice = position.buySell === TradePositionDirectionEnum.BUY ? symbolMarketInfo?.bid : symbolMarketInfo?.ask
  const priceDiff = position.buySell === TradePositionDirectionEnum.BUY ? symbolMarketInfo?.bidDiff : symbolMarketInfo?.askDiff
  const priceDiffColor = BNumber.from(priceDiff).gt(0) ? 'text-market-rise' : BNumber.from(priceDiff).lt(0) ? 'text-market-fall' : 'text-content-1'

  return (
    <Text className={cn(priceDiffColor, className)}>
      {BNumber.toFormatNumber(currentPrice, { volScale: position.symbolDecimal })}
    </Text>
  )
})
