'use client'

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
  return (
    <div className="bg-[#0a0e27] rounded-lg h-full flex flex-col">
      {/* 标题 */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <h3 className="text-white font-medium">盘口详评</h3>
        <div className="flex items-center gap-2">
          <span className="text-green-500 text-xs">0.01 / 0.008%</span>
        </div>
      </div>

      {/* 表头 */}
      <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs text-gray-400">
        <div className="text-left">价格(USD)</div>
        <div className="text-right">数量(USD)</div>
        <div className="text-right">累计(USD)</div>
      </div>

      {/* 卖盘 */}
      <div className="flex-1 overflow-auto">
        {MOCK_ASKS.map((ask, index) => (
          <div
            key={`ask-${index}`}
            className="grid grid-cols-3 gap-2 px-3 py-1 text-sm hover:bg-gray-900/30 cursor-pointer relative"
          >
            <div
              className="absolute inset-0 bg-red-500/10"
              style={{ width: '60%', right: 0, left: 'auto' }}
            />
            <div className="text-red-500 relative z-10">{ask.price} ↑</div>
            <div className="text-white text-right relative z-10">{ask.amount}</div>
            <div className="text-gray-400 text-right relative z-10">{ask.total}</div>
          </div>
        ))}
      </div>

      {/* 当前价格 */}
      <div className="px-3 py-3 bg-red-500/10 border-y border-gray-800">
        <div className="text-2xl font-bold text-red-500">180.35 ↑</div>
      </div>

      {/* 买盘 */}
      <div className="flex-1 overflow-auto">
        {MOCK_BIDS.map((bid, index) => (
          <div
            key={`bid-${index}`}
            className="grid grid-cols-3 gap-2 px-3 py-1 text-sm hover:bg-gray-900/30 cursor-pointer relative"
          >
            <div className="absolute inset-0 bg-green-500/10" style={{ width: '50%' }} />
            <div className="text-green-500 relative z-10">{bid.price}</div>
            <div className="text-white text-right relative z-10">{bid.amount}</div>
            <div className="text-gray-400 text-right relative z-10">{bid.total}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
















