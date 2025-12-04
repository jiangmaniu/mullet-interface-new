'use client'

import { AccountDetails } from './_comps/account'
import { TradeAction } from './_comps/action'
import { TradeLayout } from './_comps/layout'
import { TradeLayoutKey } from './_comps/layout/types'
import { TradeMarket } from './_comps/market'
import { OrderBooks } from './_comps/order-books'
import { Overview } from './_comps/overview'
import { Records } from './_comps/records'
import { TradingPairTabs } from './_comps/tabs'

export default function TradeSymbolPage() {
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
            <TradeMarket />
          </>
        ),
        [TradeLayoutKey.Orderbooks]: (
          <>
            <OrderBooks />
          </>
        ),
        [TradeLayoutKey.Account]: (
          <>
            <AccountDetails />
          </>
        ),
        [TradeLayoutKey.Action]: (
          <>
            <TradeAction />
          </>
        ),
        [TradeLayoutKey.Position]: (
          <>
            <Records />
          </>
        ),
      }}
    />
  )
}
