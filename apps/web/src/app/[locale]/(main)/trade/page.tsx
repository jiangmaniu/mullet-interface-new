'use client'

import { TradeAction } from './_comps/action'
import { TradeLayout } from './_comps/layout'
import { TradeLayoutKey } from './_comps/layout/types'
import { TradeMarket } from './_comps/market'
import { OrderBooks } from './_comps/order-books'
import { Overview } from './_comps/overview'
import { Records } from './_comps/records'
import { TradingPairTabs } from './_comps/tabs'

export default function TradePage() {
  return (
    <TradeLayout
      slots={{
        [TradeLayoutKey.Tabs]: (
          <div className="h-full">
            <TradingPairTabs />
          </div>
        ),
        [TradeLayoutKey.Overview]: (
          <div className="h-full">
            <Overview />
          </div>
        ),
        [TradeLayoutKey.Tradingview]: (
          <>
            <div className="drag-handle absolute top-2 right-2 z-10 cursor-move rounded bg-gray-800/50 px-2 py-1 transition-colors hover:bg-gray-700/50">
              ⋮⋮
            </div>
            <TradeMarket />
          </>
        ),
        [TradeLayoutKey.Orderbooks]: (
          <>
            <div className="drag-handle absolute top-2 right-2 z-10 cursor-move rounded bg-gray-800/50 px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-700/50">
              ⋮⋮
            </div>
            <OrderBooks />
          </>
        ),
        [TradeLayoutKey.Action]: (
          <>
            <div className="drag-handle absolute top-2 right-2 z-10 cursor-move rounded bg-gray-800/50 px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-700/50">
              ⋮⋮
            </div>
            <TradeAction />
          </>
        ),
        [TradeLayoutKey.Position]: (
          <>
            <div className="drag-handle absolute top-2 right-2 z-10 cursor-move rounded bg-gray-800/50 px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-700/50">
              ⋮⋮
            </div>
            <Records />
          </>
        ),
      }}
    />
  )
}
