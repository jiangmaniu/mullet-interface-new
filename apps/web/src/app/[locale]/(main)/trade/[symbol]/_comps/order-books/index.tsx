'use client'

import { Trans } from '@lingui/react/macro'

import { BNumber } from '@mullet/utils/number'

const MOCK_ASKS = [
  { price: '180.55', amount: '654.8', total: '836,307' },
  { price: '180.54', amount: '717.6', total: '836,307' },
  { price: '180.53', amount: '566.5', total: '836,307' },
  { price: '180.52', amount: '625.5', total: '836,307' },
  { price: '180.51', amount: '563.4', total: '836,307' },
  { price: '180.50', amount: '965.4', total: '836,307' },
  { price: '180.49', amount: '656.8', total: '836,307' },
  { price: '180.48', amount: '717.6', total: '836,307' },
]

const MOCK_BIDS = [
  { price: '180.35', amount: '654.8', total: '836,307' },
  { price: '180.34', amount: '717.6', total: '836,307' },
  { price: '180.33', amount: '566.5', total: '836,307' },
  { price: '180.32', amount: '625.5', total: '836,307' },
  { price: '180.31', amount: '563.4', total: '836,307' },
  { price: '180.30', amount: '965.4', total: '836,307' },
]

export function OrderBooks() {
  const askMaxAmount = BNumber.max(...MOCK_ASKS.map((ask) => ask.amount))
  const bidMaxAmount = BNumber.max(...MOCK_BIDS.map((bid) => bid.amount))
  return (
    <div className="bg-primary rounded-large py-medium flex h-full flex-col">
      {/* 标题 */}
      <div className="flex items-center justify-between border-b border-gray-800 p-3">
        <h3 className="font-medium text-white">盘口详评</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-green-500">0.01 / 0.008%</span>
        </div>
      </div>

      {/* 表头 */}
      <div className="text-content-5 text-paragraph-p3 grid grid-cols-3 gap-2 px-3 py-1">
        <div className="text-left">价格(USD)</div>
        <div className="text-left">数量(USD)</div>
        <div className="text-right">累计(USD)</div>
      </div>

      {/* 卖盘 */}
      <div className="flex-1 overflow-auto">
        {MOCK_ASKS.map((ask, index) => {
          const askDiffAmountParcent = BNumber.from(ask.amount).div(askMaxAmount).toPercent()
          console.log(askDiffAmountParcent.toString())
          return (
            <div
              key={`ask-${index}`}
              className="text-content-5 text-paragraph-p3 relative grid cursor-pointer grid-cols-3 gap-2 px-3 py-1 hover:bg-zinc-900/20"
            >
              <div className="absolute inset-0 px-1 py-0.5">
                <div
                  className="ml-auto h-full bg-[#ff445d]/10"
                  style={{ width: `${askDiffAmountParcent.toString()}%`, right: 0, left: 'auto' }}
                />
              </div>
              <div className="text-trade-sell relative z-10">{ask.price} </div>
              <div className="relative z-10 text-left text-white">{ask.amount}</div>
              <div className="relative z-10 text-right text-white">{ask.total}</div>
            </div>
          )
        })}
      </div>

      {/* 当前价格 */}
      <div className="flex justify-between gap-2 px-3 py-1.5">
        <div className="text-important-1 text-market-rise">180.35</div>
        <div className="text-content-1 text-paragraph-p3 flex items-center gap-2">
          <Trans>价差</Trans>
          <div className="text-content-5 text-paragraph-p3">
            {BNumber.toFormatNumber(0.01, { volScale: 2 })} / {BNumber.toFormatPercent(0.008)}
          </div>
        </div>
      </div>

      {/* 买盘 */}
      <div className="flex-1 overflow-auto">
        {MOCK_BIDS.map((bid, index) => {
          const bidDiffAmountParcent = BNumber.from(bid.amount).div(bidMaxAmount).toPercent()
          console.log(bidDiffAmountParcent.toString())
          return (
            <div
              key={`bid-${index}`}
              className="text-paragraph-p3 relative grid cursor-pointer grid-cols-3 gap-2 px-3 py-1.5 hover:bg-zinc-900/20"
            >
              <div className="absolute inset-0 px-1 py-0.5">
                <div
                  className="ml-auto h-full bg-[#00c980]/10"
                  style={{ width: `${bidDiffAmountParcent.toString()}%`, right: 0, left: 'auto' }}
                />
              </div>
              <div className="text-market-rise relative z-10">{bid.price}</div>
              <div className="relative z-10 text-left text-white">{bid.amount}</div>
              <div className="relative z-10 text-right text-white">{bid.total}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
