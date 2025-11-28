'use client'

import { useEffect, useRef } from 'react'

import { TvChartContainer } from './tv-chart-container'

export function MarketCharts() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 这里集成 TradingView 图表库
    // 暂时显示占位符
  }, [])

  return (
    <div className="flex h-full flex-col rounded-lg bg-[#0a0e27]">
      {/* 图表工具栏 */}
      {/* <div className="flex items-center justify-between border-b border-gray-800 bg-yellow-500 p-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-content-1 text-2xl font-bold">184.33</span>
            <span className="text-sm text-red-500">-202.19</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 text-sm text-gray-400 hover:text-white">1分</button>
          <button className="px-2 py-1 text-sm text-gray-400 hover:text-white">5分</button>
          <button className="px-2 py-1 text-sm text-gray-400 hover:text-white">15分</button>
          <button className="px-2 py-1 text-sm text-gray-400 hover:text-white">30分</button>
          <button className="px-2 py-1 text-sm text-gray-400 hover:text-white">1小时</button>
          <button className="px-2 py-1 text-sm text-gray-400 hover:text-white">4小时</button>
          <button className="px-2 py-1 text-sm text-gray-400 hover:text-white">天</button>
          <button className="px-2 py-1 text-sm text-gray-400 hover:text-white">周</button>
          <button className="px-2 py-1 text-sm text-gray-400 hover:text-white">月</button>
        </div>
      </div> */}

      {/* 图表区域 */}
      <div ref={containerRef} className="relative flex-1">
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <TvChartContainer />
        </div>
      </div>

      {/* 成交量图表 */}
      {/* <div className="h-24 border-t border-gray-800 p-2">
        <div className="text-xs text-gray-400">Voume: 2,399M</div>
      </div> */}
    </div>
  )
}
