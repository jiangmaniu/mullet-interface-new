'use client'

const MOCK_HISTORY_ORDERS = [
  {
    id: 1,
    chain: 'Solana',
    leverage: '10x',
    size: '0.5',
    orderPrice: '187.38',
    avgPrice: '187.20',
    type: '限价单',
    status: '已成交',
    orderHash: '6546...5342',
    createTime: '2025-08-25 12:00:00',
    completeTime: '2025-08-25 12:05:00',
  },
  {
    id: 2,
    chain: 'Ethereum',
    leverage: '5x',
    size: '1.2',
    orderPrice: '2450.00',
    avgPrice: '-',
    type: '市价单',
    status: '已取消',
    orderHash: '7892...1234',
    createTime: '2025-08-24 18:30:00',
    completeTime: '2025-08-24 18:31:00',
  },
]

export function HistoryOrders() {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-sm">
        <thead className="text-gray-400 border-b border-gray-800">
          <tr>
            <th className="text-left p-3">链名</th>
            <th className="text-left p-3">订单数量</th>
            <th className="text-left p-3">委托价</th>
            <th className="text-left p-3">成交均价</th>
            <th className="text-left p-3">类型</th>
            <th className="text-left p-3">状态</th>
            <th className="text-left p-3">订单哈希</th>
            <th className="text-left p-3">创建时间</th>
            <th className="text-left p-3">完成时间</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_HISTORY_ORDERS.map((order) => (
            <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-900/30">
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <span className="text-white">{order.chain}</span>
                  <span className="text-yellow-500 text-xs">{order.leverage}</span>
                </div>
              </td>
              <td className="p-3 text-white">{order.size}</td>
              <td className="p-3 text-white">{order.orderPrice}</td>
              <td className="p-3 text-white">{order.avgPrice}</td>
              <td className="p-3 text-white">{order.type}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    order.status === '已成交'
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td className="p-3">
                <a
                  href={`#${order.orderHash}`}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  {order.orderHash}
                  <span>↗</span>
                </a>
              </td>
              <td className="p-3 text-gray-400 text-xs">{order.createTime}</td>
              <td className="p-3 text-gray-400 text-xs">{order.completeTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {MOCK_HISTORY_ORDERS.length === 0 && (
        <div className="flex items-center justify-center h-40 text-gray-500">
          暂无历史委托
        </div>
      )}
    </div>
  )
}
















