'use client'

import { useState } from 'react'

import { FundingFlow } from './funding-flow'
import { HistoryOrders } from './history-orders'
import { HistoryTrades } from './history-trades'
import { PendingOrders } from './pending-orders'
import { Positions } from './positions'

enum TabType {
  POSITIONS = 'positions',
  PENDING = 'pending',
  HISTORY_ORDERS = 'history-orders',
  HISTORY_TRADES = 'history-trades',
  FUNDING_FLOW = 'funding-flow',
}

const TABS = [
  { key: TabType.POSITIONS, label: '持仓', count: 2 },
  { key: TabType.PENDING, label: '挂单', count: 0 },
  { key: TabType.HISTORY_ORDERS, label: '历史委托', count: null },
  { key: TabType.HISTORY_TRADES, label: '历史交易', count: null },
  { key: TabType.FUNDING_FLOW, label: '资金清流', count: null },
]

export function Records() {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.POSITIONS)

  return (
    <div className="flex h-full flex-col rounded-lg bg-[#0a0e27]">
      {/* 标签页 */}
      <div className="flex items-center gap-6 border-b border-gray-800 px-4 pt-3">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 text-sm transition-colors ${
              activeTab === tab.key ? 'border-b-2 border-green-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.count !== null && <span>({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* 标签内容 */}
      {activeTab === TabType.POSITIONS && <Positions />}
      {activeTab === TabType.PENDING && <PendingOrders />}
      {activeTab === TabType.HISTORY_ORDERS && <HistoryOrders />}
      {activeTab === TabType.HISTORY_TRADES && <HistoryTrades />}
      {activeTab === TabType.FUNDING_FLOW && <FundingFlow />}
    </div>
  )
}
