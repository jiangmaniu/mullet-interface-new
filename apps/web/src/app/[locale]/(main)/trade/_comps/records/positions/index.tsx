'use client'

const MOCK_POSITIONS = [
  {
    id: 1,
    chain: 'Solana',
    leverage: '10x',
    size: '0.5',
    entryPrice: '187.38',
    markPrice: '187.17',
    type: '限价挂单',
    pnl: '+245.32',
    pnlPercent: '+2.45%',
    liquidationPrice: '165.42',
    margin: '50.00 USDC',
  },
]

export function Positions() {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-sm">
        <thead className="text-gray-400 border-b border-gray-800">
          <tr>
            <th className="text-left p-3">链名</th>
            <th className="text-left p-3">仓位大小</th>
            <th className="text-left p-3">开仓价</th>
            <th className="text-left p-3">标记价</th>
            <th className="text-left p-3">未实现盈亏</th>
            <th className="text-left p-3">保证金</th>
            <th className="text-left p-3">强平价</th>
            <th className="text-left p-3">操作</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_POSITIONS.map((position) => (
            <tr key={position.id} className="border-b border-gray-800 hover:bg-gray-900/30">
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <span className="text-white">{position.chain}</span>
                  <span className="text-yellow-500 text-xs">{position.leverage}</span>
                </div>
              </td>
              <td className="p-3 text-white">{position.size}</td>
              <td className="p-3 text-white">{position.entryPrice}</td>
              <td className="p-3 text-white">{position.markPrice}</td>
              <td className="p-3">
                <div className="flex flex-col">
                  <span className="text-green-500">{position.pnl}</span>
                  <span className="text-green-500 text-xs">{position.pnlPercent}</span>
                </div>
              </td>
              <td className="p-3 text-white">{position.margin}</td>
              <td className="p-3 text-white">{position.liquidationPrice}</td>
              <td className="p-3">
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-white text-xs">
                    平仓
                  </button>
                  <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-white text-xs">
                    调整
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {MOCK_POSITIONS.length === 0 && (
        <div className="flex items-center justify-center h-40 text-gray-500">
          暂无持仓
        </div>
      )}
    </div>
  )
}












