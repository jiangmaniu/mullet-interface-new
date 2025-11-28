'use client'

const MOCK_HISTORY_TRADES = [
  {
    id: 1,
    chain: 'Solana',
    direction: 'buy',
    size: '0.5',
    entryPrice: '187.38',
    exitPrice: '189.50',
    pnl: '+1060.00',
    pnlPercent: '+1.13%',
    fee: '5.32 USDC',
    tradeHash: '6546...5342',
    openTime: '2025-08-24 10:00:00',
    closeTime: '2025-08-25 12:00:00',
  },
  {
    id: 2,
    chain: 'Bitcoin',
    direction: 'sell',
    size: '0.02',
    entryPrice: '43200.00',
    exitPrice: '42800.00',
    pnl: '+8.00',
    pnlPercent: '+0.93%',
    fee: '3.45 USDC',
    tradeHash: '8912...9876',
    openTime: '2025-08-23 14:30:00',
    closeTime: '2025-08-24 09:15:00',
  },
]

export function HistoryTrades() {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-sm">
        <thead className="text-gray-400 border-b border-gray-800">
          <tr>
            <th className="text-left p-3">链名</th>
            <th className="text-left p-3">方向</th>
            <th className="text-left p-3">数量</th>
            <th className="text-left p-3">开仓价</th>
            <th className="text-left p-3">平仓价</th>
            <th className="text-left p-3">已实现盈亏</th>
            <th className="text-left p-3">手续费</th>
            <th className="text-left p-3">交易哈希</th>
            <th className="text-left p-3">开仓时间</th>
            <th className="text-left p-3">平仓时间</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_HISTORY_TRADES.map((trade) => (
            <tr key={trade.id} className="border-b border-gray-800 hover:bg-gray-900/30">
              <td className="p-3 text-white">{trade.chain}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    trade.direction === 'buy'
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-red-500/20 text-red-500'
                  }`}
                >
                  {trade.direction === 'buy' ? '做多' : '做空'}
                </span>
              </td>
              <td className="p-3 text-white">{trade.size}</td>
              <td className="p-3 text-white">{trade.entryPrice}</td>
              <td className="p-3 text-white">{trade.exitPrice}</td>
              <td className="p-3">
                <div className="flex flex-col">
                  <span
                    className={
                      trade.pnl.startsWith('+') ? 'text-green-500' : 'text-red-500'
                    }
                  >
                    {trade.pnl}
                  </span>
                  <span
                    className={`text-xs ${
                      trade.pnl.startsWith('+') ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {trade.pnlPercent}
                  </span>
                </div>
              </td>
              <td className="p-3 text-gray-400">{trade.fee}</td>
              <td className="p-3">
                <a
                  href={`#${trade.tradeHash}`}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  {trade.tradeHash}
                  <span>↗</span>
                </a>
              </td>
              <td className="p-3 text-gray-400 text-xs">{trade.openTime}</td>
              <td className="p-3 text-gray-400 text-xs">{trade.closeTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {MOCK_HISTORY_TRADES.length === 0 && (
        <div className="flex items-center justify-center h-40 text-gray-500">
          暂无历史交易
        </div>
      )}
    </div>
  )
}
















