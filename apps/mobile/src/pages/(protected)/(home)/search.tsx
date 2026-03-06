import { View, ScrollView, Pressable } from 'react-native'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { Trans, useLingui } from '@lingui/react/macro'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BNumber } from '@mullet/utils/number'

import { Text } from '@/components/ui/text'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { IconifySearch, IconDepth, IconDepthTB } from '@/components/ui/icons'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { AreaChart, ChartData } from '@/components/trading-view'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/states/empty-state'
import { parseRiseAndFallInfo } from '@/helpers/market'
import { useStores } from '@/v1/provider/mobxProvider'
import { useGetCurrentQuoteCallback } from '@/v1/utils/wsUtil'
import { Account } from '@/v1/services/tradeCore/account/typings'
import { HighlightText } from './_comps/highlight-text'

// Mock data
const SYMBOLS = [
  {
    id: 'SOL-USDC',
    symbol: 'SOL-USDC',
    name: 'Solana',
    price: '148.00',
    change: 1.45,
    avatar: 'S',
    chartData: generateMockData(20, 140),
    buyPrice: '186.00',
    sellPrice: '186.00',
    highPrice: '180.00',
    lowPrice: '180.00',
  },
  {
    id: 'XAU-USDC',
    symbol: 'XAU-USDC',
    name: '现货黄金',
    price: '148.00',
    change: -1.45,
    avatar: 'X',
    chartData: generateMockData(20, 148),
    buyPrice: '486.00',
    sellPrice: '486.00',
    highPrice: '480.00',
    lowPrice: '480.00',
  },
  {
    id: 'BTC-USDC',
    symbol: 'BTC-USDC',
    name: 'Bitcoin',
    price: '43,250.00',
    change: 2.15,
    avatar: 'B',
    chartData: generateMockData(20, 43000),
    buyPrice: '198,652.0',
    sellPrice: '198,186.00',
    highPrice: '198,280.0',
    lowPrice: '198,280.0',
  },
  {
    id: 'ETH-USDC',
    symbol: 'ETH-USDC',
    name: 'Ethereum',
    price: '2,280.50',
    change: -1.23,
    avatar: 'E',
    chartData: generateMockData(20, 2200),
    buyPrice: '2,285.00',
    sellPrice: '2,276.00',
    highPrice: '2,290.00',
    lowPrice: '2,270.00',
  },
]

// 热门品种列表
const HOT_SYMBOL_LIST = ['SOL', 'XAU', 'BTC', 'ETH', 'EURUSD']

// 筛选热门品种
function getHotSymbols(symbolListAll: Account.TradeSymbolListItem[]) {
  const hotSymbolsLower = HOT_SYMBOL_LIST.map(s => s.toLowerCase())
  return symbolListAll.filter(item =>
    hotSymbolsLower.some(hot => item.alias?.toLowerCase().includes(hot))
  )
}

// 计算匹配权重
function calculateMatchScore(
  item: Account.TradeSymbolListItem,
  searchChars: string[]
): number {
  const searchText = `${item.symbol} ${item.alias || ''}`.toLowerCase()
  return searchChars.filter(char =>
    searchText.includes(char.toLowerCase())
  ).length
}

// 搜索并排序品种
function searchAndSortSymbols(
  symbolListAll: Account.TradeSymbolListItem[],
  searchQuery: string
) {
  const searchChars = searchQuery.trim().split('').filter(c => c.trim())

  if (searchChars.length === 0) {
    return getHotSymbols(symbolListAll)
  }

  return symbolListAll
    .map(item => ({ item, score: calculateMatchScore(item, searchChars) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item)
}

function generateMockData(count: number, startValue: number): ChartData[] {
  const data = []
  let time = 1642425322
  let value = startValue
  for (let i = 0; i < count; i++) {
    data.push({ time, value })
    time += 86400
    value += (Math.random() - 0.5) * 5
  }
  return data
}

// ============ SearchAssetRow ============
function SearchAssetRow({ symbol, onSelect }: { symbol: typeof SYMBOLS[0]; onSelect: () => void }) {
  const isPositive = symbol.change >= 0
  const { colorMarketRise, colorMarketFall } = useThemeColors()

  return (
    <Pressable onPress={onSelect} className="flex-row items-center p-xl gap-xl">
      <View className="flex-row items-center gap-medium flex-1">
        <Avatar className="size-6 flex-shrink-0">
          <AvatarFallback className="bg-brand-default">
            <Text className="text-content-1">{symbol.avatar}</Text>
          </AvatarFallback>
        </Avatar>
        <View>
          <Text className="text-paragraph-p2 text-content-1">{symbol.symbol}</Text>
          <Text className="text-paragraph-p3 text-content-4">{symbol.name}</Text>
        </View>
      </View>

      <View className="flex-row flex-shrink-0 gap-xl w-[192px]">
        <View className="w-[60px] h-8 items-center justify-center overflow-hidden">
          <AreaChart
            data={symbol.chartData}
            lineColor={isPositive ? colorMarketRise : colorMarketFall}
          />
        </View>
        <View className="flex-1 items-end">
          <Text className="text-paragraph-p1 text-content-1">{symbol.price}</Text>
          <Text className={cn('text-paragraph-p2', isPositive ? 'text-market-rise' : 'text-market-fall')}>
            {isPositive ? '+' : ''}{symbol.change.toFixed(2)}%
          </Text>
        </View>
      </View>
    </Pressable>
  )
}

// ============ SearchAssetTradeRow ============
function SearchAssetTradeRow({ symbol, onSelect }: { symbol: typeof SYMBOLS[0]; onSelect: () => void }) {
  return (
    <Pressable onPress={onSelect} className="flex-row items-center p-xl gap-xl">
      <View className="flex-row items-center gap-medium flex-1">
        <Avatar className="size-6 flex-shrink-0">
          <AvatarFallback className="bg-brand-default">
            <Text className="text-content-1">{symbol.avatar}</Text>
          </AvatarFallback>
        </Avatar>
        <View>
          <Text className="text-paragraph-p2 text-content-1">{symbol.symbol}</Text>
          <Text className="text-paragraph-p3 text-content-4">{symbol.name}</Text>
        </View>
      </View>

      <View className="flex-row flex-shrink-0 gap-xl w-[192px]">
        <View className="gap-xs flex-1">
          <View className="bg-market-rise/15 border border-market-rise rounded-small flex-col items-center justify-center h-[24px]">
            <Text className="text-paragraph-p2 text-market-rise">{symbol.buyPrice}</Text>
          </View>
          <Text className="text-paragraph-p3 text-content-4">最高 {symbol.highPrice}</Text>
        </View>
        <View className="gap-xs flex-1">
          <View className="bg-market-fall/15 border border-market-fall rounded-small flex-col items-center justify-center h-[24px]">
            <Text className="text-paragraph-p2 text-market-fall">{symbol.sellPrice}</Text>
          </View>
          <Text className="text-content-4 text-paragraph-p3 text-right">最低 {symbol.lowPrice}</Text>
        </View>
      </View>
    </Pressable>
  )
}

// ============ Main Search Page ============
export default function SearchPage() {
  const router = useRouter()
  const { t } = useLingui()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [viewMode, setViewMode] = useState('list')
  const { colorMarketRise, colorMarketFall, colorBrandSecondary1 } = useThemeColors()
  const { trade } = useStores()

  // 防抖处理搜索输入
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    // 页面初始化时调用接口更新品种列表
    trade.getSymbolList()
  }, [])

  // 使用真实数据进行搜索和排序
  const filteredSymbols = useMemo(() => {
    return searchAndSortSymbols(trade.symbolListAll, debouncedQuery)
  }, [trade.symbolListAll, debouncedQuery])

  // 提取搜索字符用于高亮显示（Task 4 会使用）
  const searchChars = useMemo(() => {
    return debouncedQuery.trim().split('').filter(c => c.trim())
  }, [debouncedQuery])

  const handleSelect = useCallback(() => {
    router.back()
  }, [router])

  return (
    <View className="flex-1 bg-secondary">
      <SafeAreaView edges={['top']}>
        {/* Search Header */}
        <View className="flex-row items-center gap-[10px] px-xl py-1.5 mb-1.5">
          <View className="flex-1">
            <Input
              placeholder={t`查询`}
              className="h-8"
              size="sm"
              hideLabel
              value={searchQuery}
              onValueChange={setSearchQuery}
              autoFocus
              LeftContent={
                <IconifySearch width={20} height={20} />
              }
            />
          </View>
          <Pressable onPress={() => router.back()}>
            <Text className="text-paragraph-p2 text-content-1">
              <Trans>取消</Trans>
            </Text>
          </Pressable>
        </View>

        {/* Section Header */}
        <View className="flex-row items-center justify-between p-xl">
          <Text className="text-important-1 text-content-1">
            <Trans>热门品种</Trans>
          </Text>
          <Tabs value={viewMode} onValueChange={setViewMode} className="flex-shrink-0">
            <TabsList variant="icon" size="sm">
              <TabsTrigger value="list" className="size-5">
                <IconDepthTB
                  width={12}
                  height={12}
                  color={viewMode === 'list' ? colorMarketFall : colorBrandSecondary1}
                />
              </TabsTrigger>
              <TabsTrigger value="trade" className="size-5">
                <IconDepth
                  width={12}
                  height={12}
                  color={viewMode === 'trade' ? colorMarketFall : colorBrandSecondary1}
                  primaryColor={viewMode === 'trade' ? colorMarketRise : colorBrandSecondary1}
                />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </View>
      </SafeAreaView>

      {/* Asset List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {filteredSymbols.length === 0 ? (
          <View className='py-[96px]'>
            <EmptyState message={< Trans > 暂无内容</Trans >} iconWidth={107} iconHeight={76} className='gap-2xl' />
          </View>
        ) : (
          filteredSymbols.map((item) =>
            viewMode === 'trade' ? (
              <SearchAssetTradeRow key={item.id} symbol={item} onSelect={handleSelect} />
            ) : (
              <SearchAssetRow key={item.id} symbol={item} onSelect={handleSelect} />
            )
          )
        )}
      </ScrollView>
    </View>
  )
}
