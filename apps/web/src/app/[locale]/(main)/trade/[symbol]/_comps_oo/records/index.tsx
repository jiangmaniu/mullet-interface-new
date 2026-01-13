'use client'

import { Trans } from '@lingui/react/macro'
import { useState } from 'react'

import { Button } from '@mullet/ui/button'
import { Checkbox } from '@mullet/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@mullet/ui/tabs'

import { FundingFlow } from './funding-flow'
import { HistoryOrders } from './history-orders'
import { HistoryTrades } from './history-trades'
import { PendingOrders } from './pending-orders'
import { Positions } from './positions'
import { CloseAllPositions } from './positions/close-all'

enum TabType {
  POSITIONS = 'positions',
  PENDING = 'pending',
  HISTORY_ORDERS = 'history-orders',
  HISTORY_TRADES = 'history-trades',
  FUNDING_FLOW = 'funding-flow',
}

export function Records() {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.POSITIONS)

  const TABS_OPTIONS = [
    { key: TabType.POSITIONS, label: <Trans>持仓</Trans>, content: <Positions />, count: 2 },
    { key: TabType.PENDING, label: <Trans>挂单</Trans>, content: <PendingOrders />, count: 0 },
    { key: TabType.HISTORY_ORDERS, label: <Trans>历史委托</Trans>, content: <HistoryOrders />, count: null },
    { key: TabType.HISTORY_TRADES, label: <Trans>历史交易</Trans>, content: <HistoryTrades />, count: null },
    { key: TabType.FUNDING_FLOW, label: <Trans>资金清流</Trans>, content: <FundingFlow />, count: null },
  ]

  const tabActionMap: Record<string, React.ReactNode[]> = {
    [TabType.POSITIONS]: [<CloseAllPositions />],
  }

  return (
    <>
      <Tabs className="bg-primary rounded-4 h-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex justify-between gap-3">
          <div className="flex gap-2">
            {TABS_OPTIONS.map((tab) => {
              return (
                <TabsTrigger key={tab.key} value={tab.key}>
                  {tab.label}
                </TabsTrigger>
              )
            })}
          </div>
          <div className="flex items-center gap-4">
            <Checkbox htmlFor="trade-only-show-current-pair" label="只展示当前" />

            {tabActionMap[activeTab]?.map((action, i) => {
              return <div key={i}>{action}</div>
            })}
          </div>
        </TabsList>

        <div className="">
          {TABS_OPTIONS.map((tab) => (
            <TabsContent key={tab.key} value={tab.key}>
              {tab.content}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </>
  )
}
