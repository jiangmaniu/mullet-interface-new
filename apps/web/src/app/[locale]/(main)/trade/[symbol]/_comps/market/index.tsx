'use client'

import { Trans } from '@lingui/react/macro'
import { useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@mullet/ui/tabs'

// import { MarketCharts } from './charts'
// import { MarketDepth } from './depth'
import { MarketDetails } from './details'
import { TradingviewWrapper } from './Tradingview/wrapper'

export const TradeMarket = () => {
  enum TabEnum {
    charts,
    depth,
    detail,
    old,
  }
  const [activeTab, setActiveTab] = useState(TabEnum.charts)

  return (
    <div className="bg-primary rounded-large h-full overflow-hidden">
      <Tabs className="h-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value={TabEnum.charts}>
            <span>
              <Trans>图表</Trans>
            </span>
          </TabsTrigger>
          {/* <TabsTrigger value={TabEnum.depth}>
            <span>
              <Trans>深度</Trans>
            </span>
          </TabsTrigger> */}
          {/* <TabsTrigger value={TabEnum.old}>
            <span>
              <Trans>老详情</Trans>
            </span>
          </TabsTrigger> */}
          <TabsTrigger value={TabEnum.detail}>
            <span>
              <Trans>详情</Trans>
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value={TabEnum.charts} forceMount>
          {/* <MarketCharts /> */}
          <TradingviewWrapper />
        </TabsContent>
        {/* <TabsContent value={TabEnum.depth} forceMount>
          <MarketDepth />
        </TabsContent> */}
        <TabsContent value={TabEnum.old}>{/* <Futures /> */}</TabsContent>
        <TabsContent value={TabEnum.detail}>
          <MarketDetails />
        </TabsContent>
      </Tabs>
    </div>
  )
}
