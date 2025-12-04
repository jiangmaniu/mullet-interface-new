'use client'

import { useState } from 'react'

import { Tabs, TabsList, TabsTrigger } from '@mullet/ui/tabs'

const TRADING_PAIRS = [
  { symbol: 'SOL-USD', icon: '◎' },
  { symbol: 'BTC-USD', icon: '₿' },
  { symbol: 'ETH-USD', icon: 'Ξ' },
  { symbol: 'DOGE-USD', icon: 'Ð' },
]

export function TradingPairTabs() {
  const [activePair, setActivePair] = useState('SOL-USD')

  const handleChangePair = (pair: string) => {
    setActivePair(pair)
  }
  return (
    <Tabs variant={'iconsAndText'} className="rounded-lg" value={activePair} onValueChange={handleChangePair}>
      <TabsList className="flex items-center gap-2">
        {TRADING_PAIRS.map((pair) => (
          <TabsTrigger
            key={pair.symbol}
            value={pair.symbol}
            // className={`flex items-center gap-2 rounded px-4 py-2 transition-colors ${
            //   activePair === pair.symbol ? 'bg-[#1a1f3a] text-white' : 'text-gray-400 hover:text-white'
            // }`}
          >
            <span className="size-6 rounded-full bg-white">{}</span>
            <span className="font-medium">{pair.symbol}</span>
            {activePair === pair.symbol && (
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  // 关闭标签逻辑
                }}
                className="ml-2 text-gray-500 hover:text-white"
              >
                ✕
              </div>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
