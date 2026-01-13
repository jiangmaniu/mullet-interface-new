'use client'

import { observer } from 'mobx-react'
import { startTransition, useState } from 'react'

import { GeneralTooltip } from '@/components/tooltip/general'
import { useStores } from '@/v1/provider/mobxProvider'
import { Button } from '@mullet/ui/button'
import { Input } from '@mullet/ui/input'
import { NumberInput, NumberInputSourceType } from '@mullet/ui/number-input'
import { SliderTooltip } from '@mullet/ui/slider-tooltip'
import { Switch } from '@mullet/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@mullet/ui/tabs'
import { TooltipTriggerDottedText } from '@mullet/ui/tooltip'
import { BNumber } from '@mullet/utils/number'

import { TRADE_ORDER_TYPE_OPTIONS } from '../../_options/order'
import { MarginModeSetting } from './margin-mode-setting'
import { TradeActionPanelOrderAmount } from './order-amount'
import { TradeActionPanelOrderDirection } from './order-direction'
import { TradeActionPanelOrderOverview } from './order-overview'
import { TradeActionPanelOrderPrice } from './order-price'
import { TradeActionPanelOrderSubmit } from './order-submit'
import { TradeActionPanelTpAndSl } from './order-tp-and-sl'
import { TradingLeverage } from './trading-leverage'

export const TradeActionPanel = observer(() => {
  const { trade } = useStores()

  const [selectedOrderType, setSelectedOrderType] = useState(trade.orderType)

  return (
    <div className="rounded-large bg-primary flex h-full flex-col gap-3 p-3">
      <div className="flex flex-col gap-2">
        <div className="gap-xl flex justify-between">
          <div className="flex-1">
            <MarginModeSetting />
          </div>
          <div className="flex-1">
            <TradingLeverage />
          </div>
        </div>

        <Tabs
          value={selectedOrderType}
          onValueChange={(value) => {
            startTransition(() => {
              trade.setOrderType(value)
              // 重置买卖类型
              trade.setBuySell('BUY')
              setSelectedOrderType(value)
            })
          }}
        >
          <TabsList className="gap-medium">
            {TRADE_ORDER_TYPE_OPTIONS.map((option, i) => {
              return (
                <TabsTrigger className="flex-1" key={i} value={option.value}>
                  {option.label}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* 交易表单 */}
      <div className="gap-xl flex flex-col">
        <TradeActionPanelOrderDirection />

        <TradeActionPanelOrderPrice />

        <TradeActionPanelOrderAmount />

        <TradeActionPanelTpAndSl />

        <TradeActionPanelOrderSubmit />

        <TradeActionPanelOrderOverview />
      </div>
    </div>
  )
})
