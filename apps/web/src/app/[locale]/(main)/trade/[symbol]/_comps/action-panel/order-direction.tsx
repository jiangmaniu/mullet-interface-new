import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react'
import { startTransition } from 'react'

import { useCurrentQuote } from '@/v1/hooks/useCurrentQuote'
import { useStores } from '@/v1/provider/mobxProvider'
import { cn } from '@mullet/ui/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@mullet/ui/tabs'
import { BNumber } from '@mullet/utils/number'

import { TRADE_ORDER_DIRECTION_OPTIONS, TradeOrderDirectionEnum } from '../../_options/order'

export const TradeActionPanelOrderDirection = observer(() => {
  const { trade } = useStores()

  const quoteInfo = useCurrentQuote(trade.activeSymbolName)
  return (
    <div className={cn('gap-medium relative flex')}>
      <div
        className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-0.5',
          'text-paragraph-p3 text-content-foreground flex h-5 items-center justify-center rounded-xs bg-white',
        )}
      >
        {BNumber.toFormatNumber(quoteInfo?.spread)}
      </div>

      <div
        className={cn(
          'gap-xs py-small px-3xl rounded-small text-button-2 text-content-4 bg-button flex flex-1 flex-col',
          {
            'bg-market-rise text-content-foreground': trade.buySell === TradeOrderDirectionEnum.BUY,
            'cursor-pointer': trade.buySell !== TradeOrderDirectionEnum.BUY,
          },
        )}
        onClick={() => {
          startTransition(() => {
            trade.setBuySell(TradeOrderDirectionEnum.BUY)
          })
        }}
      >
        <div className="text-center">
          <Trans>买入/做多</Trans>
        </div>

        <div className="text-center">{BNumber.toFormatNumber(quoteInfo?.bid, { volScale: 2 })}</div>
      </div>

      <div
        className={cn(
          'gap-xs py-small px-3xl rounded-small text-button-2 text-content-4 bg-button flex flex-1 flex-col',
          {
            'bg-market-fall text-content-1': trade.buySell === TradeOrderDirectionEnum.SELL,
            'cursor-pointer': trade.buySell !== TradeOrderDirectionEnum.SELL,
          },
        )}
        onClick={() => {
          startTransition(() => {
            trade.setBuySell(TradeOrderDirectionEnum.SELL)
          })
        }}
      >
        <div className="text-center">
          <Trans>卖出/做空</Trans>
        </div>

        <div className="text-center">{BNumber.toFormatNumber(quoteInfo?.ask, { volScale: 2 })}</div>
      </div>
    </div>
  )
})
