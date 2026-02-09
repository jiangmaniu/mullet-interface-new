import { View, ScrollView, Pressable, TextInput } from 'react-native'
import { useState, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'expo-router'
import { Trans, useLingui } from '@lingui/react/macro'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Text } from '@/components/ui/text'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { IconifySearch, IconDepth, IconDepthTB } from '@/components/ui/icons'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { AreaChart, ChartData } from '@/components/trading-view'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/ui/empty-state'

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
  },
  {
    id: 'XAU-USDC',
    symbol: 'XAU-USDC',
    name: '现货黄金',
    price: '148.00',
    change: -1.45,
    avatar: 'X',
    chartData: generateMockData(20, 148),
  },
  {
    id: 'BTC-USDC',
    symbol: 'BTC-USDC',
    name: 'Bitcoin',
    price: '43,250.00',
    change: 2.15,
    avatar: 'B',
    chartData: generateMockData(20, 43000),
  },
  {
    id: 'ETH-USDC',
    symbol: 'ETH-USDC',
    name: 'Ethereum',
    price: '2,280.50',
    change: -1.23,
    avatar: 'E',
    chartData: generateMockData(20, 2200),
  },
]

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

// ============ Main Search Page ============
export default function SearchPage() {
  const router = useRouter()
  const { t } = useLingui()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('list')
  const { colorMarketRise, colorMarketFall, colorBrandSecondary1 } = useThemeColors()

  const filteredSymbols = useMemo(() => {
    if (!searchQuery) return SYMBOLS
    const query = searchQuery.toLowerCase()
    return SYMBOLS.filter(
      s => s.symbol.toLowerCase().includes(query) || s.name.toLowerCase().includes(query)
    )
  }, [searchQuery])

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
          filteredSymbols.map((item) => (
            <SearchAssetRow key={item.id} symbol={item} onSelect={handleSelect} />
          ))
        )}
      </ScrollView>
    </View>
  )
}
