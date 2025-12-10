'use client'

import { useParams } from 'next/navigation'

import { useKeepRouter } from '@/hooks/common/use-keep-router'
import { Tabs, TabsList, TabsTrigger } from '@mullet/ui/tabs'

import { useActiveAccountTradeSymbolList } from '../../_hooks/use-trade-symbol-list'
import { TradeSymbolPageParams } from '../../layout'

export function TradingPairTabs() {
  const { symbol: activeSymbol } = useParams<TradeSymbolPageParams>()
  const { activeAccountTradeSymbolList } = useActiveAccountTradeSymbolList()
  // 过滤前三个交易对
  const list = activeAccountTradeSymbolList?.slice(0, 3)
  const { pushKeepQuery } = useKeepRouter()

  const handleChangePair = (symbol: string) => {
    pushKeepQuery(`#/${symbol}`)
  }
  return (
    <Tabs variant={'iconsAndText'} className="rounded-lg" value={activeSymbol} onValueChange={handleChangePair}>
      <TabsList className="flex items-center gap-2">
        {list?.map((symbolInfo) => (
          <TabsTrigger
            key={symbolInfo?.symbol}
            value={symbolInfo?.symbol}
            // className={`flex items-center gap-2 rounded px-4 py-2 transition-colors ${
            //   activeSymbol === symbolInfo.symbol ? 'bg-[#1a1f3a] text-white' : 'text-gray-400 hover:text-white'
            // }`}
          >
            <img
              src={`${process.env.NEXT_PUBLIC_IMAGE_DOMAIN}/${symbolInfo?.imgUrl}`}
              alt={'symbol logo'}
              className="size-6 rounded-full"
            />

            <span className="font-medium">{symbolInfo?.symbol}</span>
            {activeSymbol === symbolInfo?.symbol && (
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
