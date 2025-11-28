'use client'

const MOCK_FUNDING_FLOWS = [
  {
    id: 1,
    type: 'funding_fee',
    chain: 'Solana',
    amount: '-0.52 USDC',
    rate: '-0.01%',
    timestamp: '2025-08-25 08:00:00',
    txHash: '6546...5342',
  },
  {
    id: 2,
    type: 'deposit',
    chain: 'Ethereum',
    amount: '+1000.00 USDC',
    rate: '-',
    timestamp: '2025-08-24 15:30:00',
    txHash: '7892...1234',
  },
  {
    id: 3,
    type: 'withdraw',
    chain: 'Solana',
    amount: '-500.00 USDC',
    rate: '-',
    timestamp: '2025-08-23 10:20:00',
    txHash: '9123...4567',
  },
  {
    id: 4,
    type: 'funding_fee',
    chain: 'Bitcoin',
    amount: '+0.32 USDC',
    rate: '+0.01%',
    timestamp: '2025-08-23 00:00:00',
    txHash: '4567...8901',
  },
]

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    funding_fee: '资金费用',
    deposit: '充值',
    withdraw: '提现',
    trade_fee: '交易手续费',
  }
  return labels[type] || type
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    funding_fee: 'bg-purple-500/20 text-purple-500',
    deposit: 'bg-green-500/20 text-green-500',
    withdraw: 'bg-orange-500/20 text-orange-500',
    trade_fee: 'bg-blue-500/20 text-blue-500',
  }
  return colors[type] || 'bg-gray-500/20 text-gray-400'
}

export function FundingFlow() {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-sm">
        <thead className="text-gray-400 border-b border-gray-800">
          <tr>
            <th className="text-left p-3">类型</th>
            <th className="text-left p-3">链名</th>
            <th className="text-left p-3">金额</th>
            <th className="text-left p-3">费率</th>
            <th className="text-left p-3">时间</th>
            <th className="text-left p-3">交易哈希</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_FUNDING_FLOWS.map((flow) => (
            <tr key={flow.id} className="border-b border-gray-800 hover:bg-gray-900/30">
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs ${getTypeColor(flow.type)}`}>
                  {getTypeLabel(flow.type)}
                </span>
              </td>
              <td className="p-3 text-white">{flow.chain}</td>
              <td className="p-3">
                <span
                  className={
                    flow.amount.startsWith('+') ? 'text-green-500' : 'text-red-500'
                  }
                >
                  {flow.amount}
                </span>
              </td>
              <td className="p-3 text-gray-400">{flow.rate}</td>
              <td className="p-3 text-gray-400 text-xs">{flow.timestamp}</td>
              <td className="p-3">
                <a
                  href={`#${flow.txHash}`}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  {flow.txHash}
                  <span>↗</span>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {MOCK_FUNDING_FLOWS.length === 0 && (
        <div className="flex items-center justify-center h-40 text-gray-500">
          暂无资金流水
        </div>
      )}
    </div>
  )
}
















