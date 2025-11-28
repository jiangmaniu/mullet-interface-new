import { Trans } from '@lingui/react/macro'
import { Activity, useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@mullet/ui/tabs'

import { MarketCharts } from './charts'
import { MarketDepth } from './depth'
import { MarketDetails } from './details'

export const TradeMarket = () => {
  enum TabEnum {
    charts,
    depth,
    detail,
  }
  const [activeTab, setActiveTab] = useState(TabEnum.charts)

  return (
    <div className="h-full rounded-[10px] bg-[#0A0C27]">
      <Tabs className="h-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value={TabEnum.charts}>
            <span>
              <Trans>图表</Trans>
            </span>
          </TabsTrigger>
          <TabsTrigger value={TabEnum.depth}>
            <span>
              <Trans>深度</Trans>
            </span>
          </TabsTrigger>
          <TabsTrigger value={TabEnum.detail}>
            <span>
              <Trans>详情</Trans>
            </span>
          </TabsTrigger>
        </TabsList>
        <Activity mode={activeTab === TabEnum.charts ? 'visible' : 'hidden'}>
          <TabsContent value={TabEnum.charts}>
            <MarketCharts />
          </TabsContent>
        </Activity>
        <Activity mode={activeTab === TabEnum.depth ? 'visible' : 'hidden'}>
          <TabsContent value={TabEnum.depth}>
            <MarketDepth />
          </TabsContent>
        </Activity>
        <Activity mode={activeTab === TabEnum.detail ? 'visible' : 'hidden'}>
          <TabsContent value={TabEnum.detail}>
            <MarketDetails />
          </TabsContent>
        </Activity>
      </Tabs>
    </div>
  )
}
