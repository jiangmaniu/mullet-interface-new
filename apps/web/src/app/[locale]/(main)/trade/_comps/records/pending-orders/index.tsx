'use client'

const MOCK_PENDING_ORDERS = [
  {
    id: 1,
    chain: 'Solana',
    leverage: '10x',
    size: '0.5',
    orderPrice: '187.38',
    markPrice: '187.17',
    type: '限价挂单',
    orderHash: '6546...5342',
    createTime: '2025-08-25 12:00:00',
  },
]

export function PendingOrders() {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-sm">
        <thead className="text-gray-400 border-b border-gray-800">
          <tr>
            <th className="text-left p-3">链名</th>
            <th className="text-left p-3">挂单数量</th>
            <th className="text-left p-3">挂单价</th>
            <th className="text-left p-3">标记价</th>
            <th className="text-left p-3">类型</th>
            <th className="text-left p-3">止盈/止损</th>
            <th className="text-left p-3">订单哈希</th>
            <th className="text-left p-3">创建时间</th>
            <th className="text-left p-3">操作</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_PENDING_ORDERS.map((order) => (
            <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-900/30">
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <span className="text-white">{order.chain}</span>
                  <span className="text-yellow-500 text-xs">{order.leverage}</span>
                </div>
              </td>
              <td className="p-3 text-white">{order.size}</td>
              <td className="p-3 text-white">{order.orderPrice}</td>
              <td className="p-3 text-white">{order.markPrice}</td>
              <td className="p-3 text-white">{order.type}</td>
              <td className="p-3">
                <button className="text-green-500 hover:text-green-400">+</button>
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
              <td className="p-3">
                <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-white text-xs">
                  取消
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {MOCK_PENDING_ORDERS.length === 0 && (
        <div className="flex items-center justify-center h-40 text-gray-500">
          暂无挂单
        </div>
      )}
    </div>
  )
}
















