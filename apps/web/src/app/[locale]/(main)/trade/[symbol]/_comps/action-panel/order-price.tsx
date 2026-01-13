import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react'

import { useCurrentQuote } from '@/v1/hooks/useCurrentQuote'
import useTrade from '@/v1/hooks/useTrade'
import { useStores } from '@/v1/provider/mobxProvider'
import { cn } from '@mullet/ui/lib/utils'
import { NumberInput, NumberInputSourceType } from '@mullet/ui/number-input'

import { TradeOrderTypeEnum } from '../../_options/order'

export const TradeActionPanelOrderPrice = observer(() => {
  const { trade } = useStores()
  const { disabledTrade, orderPrice, setOrderPrice, isBuy, onPriceMinus, onPriceAdd } = useTrade()
  const selectedOrderType = trade.orderType
  const quoteInfo = useCurrentQuote(trade.activeSymbolName)

  const isSellOrder = trade.buySell === 'SELL'
  const isBuyOrder = trade.buySell === 'BUY'

  const handleSetLatestPrice = () => {
    if (isBuyOrder) {
      setOrderPrice(quoteInfo?.bid)
    } else {
      setOrderPrice(quoteInfo?.ask)
    }
  }

  const isMarket = selectedOrderType === TradeOrderTypeEnum.MARKET

  if (isMarket) {
    return (
      <div className={cn('rounded-small border-default py-large px-xl border', 'text-paragraph-p2')}>
        <span className="text-content-5">
          <Trans>以当前最优价</Trans>
        </span>
      </div>
    )
  }

  return (
    <div>
      <NumberInput
        placeholder="0.00"
        value={orderPrice}
        size="md"
        labelText={<Trans>价格</Trans>}
        RightContent={
          <>
            <div className="text-paragraph-p2 flex gap-1">
              <div className={'text-brand-primary cursor-pointer'} onClick={handleSetLatestPrice}>
                最新
              </div>
            </div>
          </>
        }
        disabled={disabledTrade}
        onValueChange={({ value }, { source }) => {
          if (isMarket) {
            return
          }

          if (source === NumberInputSourceType.EVENT) {
            setOrderPrice(value)
          }
        }}
      />
    </div>
  )
})
