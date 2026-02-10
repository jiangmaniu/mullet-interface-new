import { View, ScrollView, Pressable, TextInput, Platform } from 'react-native'
import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'expo-router'
import { Trans } from '@lingui/react/macro'
import { Text } from '@/components/ui/text'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { IconifySearch, IconDepth, IconDepthTB } from '@/components/ui/icons'
import { SwipeableTabs, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Route } from 'react-native-tab-view'
import { AreaChart, ChartData } from '@/components/trading-view'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { ScreenHeader } from '@/components/ui/screen-header'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/states/empty-state'
import { Input } from '@/components/ui/input'

// Mock data - 币种列表
const SYMBOLS = [
  {
    id: 'SOL-USDC',
    symbol: 'SOL-USDC',
    name: 'Solana',
    price: '148.00',
    buyPrice: '148.50',
    sellPrice: '147.50',
    highPrice: '150.00',
    lowPrice: '145.00',
    change: 1.45,
    isFavorite: true,
    avatar: 'S',
    color: '#9945FF',
    chartData: generateMockData(20, 140)
  },
  {
    id: 'XAU-USDC',
    symbol: 'XAU-USDC',
    name: '现货黄金',
    price: '148.00',
    buyPrice: '148.50',
    sellPrice: '147.50',
    highPrice: '150.00',
    lowPrice: '145.00',
    change: -1.45,
    isFavorite: true,
    avatar: 'X',
    color: '#FFD700',
    chartData: generateMockData(20, 148)
  },
  {
    id: 'BTC-USDC',
    symbol: 'BTC-USDC',
    name: 'Bitcoin',
    price: '43,250.00',
    buyPrice: '43,350.00',
    sellPrice: '43,150.00',
    highPrice: '44,000.00',
    lowPrice: '42,500.00',
    change: 2.15,
    isFavorite: false,
    avatar: 'B',
    color: '#F7931A',
    chartData: generateMockData(20, 43000)
  },
  {
    id: 'ETH-USDC',
    symbol: 'ETH-USDC',
    name: 'Ethereum',
    price: '2,280.50',
    buyPrice: '2,290.00',
    sellPrice: '2,270.00',
    highPrice: '2,350.00',
    lowPrice: '2,200.00',
    change: -1.23,
    isFavorite: false,
    avatar: 'E',
    color: '#627EEA',
    chartData: generateMockData(20, 2200)
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

export default function SymbolSelectorModal() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('list')
  const { colorMarketRise, colorMarketFall, colorBrandSecondary1 } = useThemeColors()

  // 定义 tabs 路由
  const routes = useMemo<Route[]>(() => [
    { key: 'favorites', title: '自选' },
    { key: 'all', title: '全部' },
    { key: 'crypto', title: '加密货币' },
    { key: 'commodities', title: '大宗商品' },
  ], [])

  // 根据 tab 和搜索过滤币种
  const getFilteredSymbols = useCallback((tabKey: string) => {
    let symbols = SYMBOLS

    // 根据 tab 过滤
    if (tabKey === 'favorites') {
      symbols = symbols.filter(s => s.isFavorite)
    } else if (tabKey === 'crypto') {
      // 加密货币：BTC, ETH, SOL 等
      symbols = symbols.filter(s => ['BTC', 'ETH', 'SOL'].some(crypto => s.symbol.includes(crypto)))
    } else if (tabKey === 'commodities') {
      // 大宗商品：XAU (黄金) 等
      symbols = symbols.filter(s => s.symbol.includes('XAU'))
    }
    // 'all' 显示全部，不需要过滤

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      symbols = symbols.filter(
        s => s.symbol.toLowerCase().includes(query) ||
          s.name.toLowerCase().includes(query)
      )
    }

    return symbols
  }, [searchQuery])

  // 选择币种
  const handleSelectSymbol = useCallback(() => {
    // 这里可以通过路由参数或全局状态更新选中的币种
    router.back()
  }, [router])

  // 渲染列表视图的内容
  const renderListView = useCallback((filteredSymbols: typeof SYMBOLS) => {
    return (
      <View className="flex-1">
        {/* 列表头部 */}
        <View className="h-8 flex-row items-center justify-between px-xl py-medium">
          <Text className="text-paragraph-p3 text-content-5 flex-1">
            <Trans>品类</Trans>
          </Text>
          <View className='flex-row gap-0 flex-shrink-0'>
            <Text className="text-paragraph-p3 text-content-5 w-[80px]">
              <Trans>价格</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-5 w-[120px] text-right">
              <Trans>涨跌幅</Trans>
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {filteredSymbols.length === 0 ? (
            <EmptyState message={<Trans>暂无数据</Trans>} className="py-20" />
          ) : (
            filteredSymbols.map((item) => (
              <SymbolListItem
                key={item.id}
                symbol={item}
                onSelect={handleSelectSymbol}
              />
            ))
          )}
        </ScrollView>
      </View>
    )
  }, [handleSelectSymbol])

  // 渲染交易视图的内容
  const renderTradeView = useCallback((filteredSymbols: typeof SYMBOLS) => {
    return (
      <View className="flex-1">
        {/* 列表头部 */}
        <View className="h-8 flex-row items-center justify-between px-xl py-medium">
          <Text className="text-paragraph-p3 text-content-5 flex-1">
            <Trans>品类</Trans>
          </Text>
          <View className='flex-row gap-[8px] flex-shrink-0 w-[200px]'>
            <Text className="text-paragraph-p3 text-content-5 flex-1">
              <Trans>买价</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-5 flex-1 text-right">
              <Trans>卖价</Trans>
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {filteredSymbols.length === 0 ? (
            <EmptyState message={<Trans>暂无数据</Trans>} className="py-20" />
          ) : (
            filteredSymbols.map((item) => (
              <SymbolTradeItem
                key={item.id}
                symbol={item}
                onSelect={handleSelectSymbol}
              />
            ))
          )}
        </ScrollView>
      </View>
    )
  }, [handleSelectSymbol])

  // 渲染每个 tab 的内容
  const renderScene = useCallback(({ route }: { route: Route }) => {
    const filteredSymbols = getFilteredSymbols(route.key)
    return viewMode === 'list' ? renderListView(filteredSymbols) : renderTradeView(filteredSymbols)
  }, [getFilteredSymbols, viewMode, renderListView, renderTradeView])

  return (
    <View className="flex-1 bg-special">
      {Platform.OS === 'android' && <ScreenHeader content="选择币种" />}

      {/* 圆角指示器 */}
      {Platform.OS === 'ios' && <View className="items-center py-xl">
        <View className="w-[46px] h-1 bg-button rounded-full" />
      </View>}

      {/* 搜索框区域 */}
      <View className="px-xl">
        <Input
          LeftContent={<IconifySearch width={20} height={20} />}
          value={searchQuery}
          size="sm"
          onValueChange={setSearchQuery}
          hideLabel
          placeholder="搜索"
        />
      </View>

      {/* SwipeableTabs */}
      <View className="flex-1">
        <SwipeableTabs
          routes={routes}
          renderScene={renderScene}
          variant="underline"
          size="md"
          tabBarClassName="border-b border-brand-default px-xl"
          renderTabBarRight={() => (
            <Tabs value={viewMode} onValueChange={setViewMode} className='flex-shrink-0'>
              <TabsList variant='icon' size='sm'>
                <TabsTrigger value="list" className='size-5'>
                  <IconDepthTB width={12} height={12} color={viewMode === 'list' ? colorMarketFall : colorBrandSecondary1} />
                </TabsTrigger>
                <TabsTrigger value="trade" className='size-5'>
                  <IconDepth width={12} height={12} color={viewMode === 'trade' ? colorMarketFall : colorBrandSecondary1} primaryColor={viewMode === 'trade' ? colorMarketRise : colorBrandSecondary1} />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        />
      </View>
    </View>
  )
}

// 列表视图 - 币种列表项
interface SymbolListItemProps {
  symbol: typeof SYMBOLS[0]
  onSelect: () => void
}

function SymbolListItem({ symbol, onSelect }: SymbolListItemProps) {
  const isPositive = symbol.change >= 0
  const { colorMarketRise, colorMarketFall } = useThemeColors()

  return (
    <Pressable
      onPress={onSelect}
      className="flex-row items-center justify-between p-xl"
    >
      {/* 左侧：头像 + 币种信息 */}
      <View className="flex-row items-center gap-[8px] flex-shrink-0 w-[120px]">
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

      {/* 右侧：价格 + (图表 + 涨跌幅) */}
      <View className='flex-row flex-shrink-0 items-center gap-0'>
        <Text className="text-paragraph-p2 text-content-1 w-[80px]">{symbol.price}</Text>
        <View className="flex-row items-center justify-end gap-[8px] w-[120px]">
          <View className="w-[60px] h-8 items-center justify-center overflow-hidden">
            <AreaChart
              data={symbol.chartData}
              lineColor={isPositive ? colorMarketRise : colorMarketFall}
            />
          </View>
          <Text className={cn('text-paragraph-p2 text-right', isPositive ? 'text-market-rise' : 'text-market-fall')}>
            {isPositive ? '+' : ''}{symbol.change.toFixed(2)}%
          </Text>
        </View>
      </View>
    </Pressable>
  )
}

// 交易视图 - 币种列表项
interface SymbolTradeItemProps {
  symbol: typeof SYMBOLS[0]
  onSelect: () => void
}

function SymbolTradeItem({ symbol, onSelect }: SymbolTradeItemProps) {
  return (
    <Pressable
      onPress={onSelect}
      className="flex-row items-center justify-between p-xl"
    >
      {/* 左侧：头像 + 币种信息 */}
      <View className="flex-row items-center gap-[8px] flex-shrink-0 w-[120px]">
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

      {/* 右侧：买价 + 卖价 */}
      <View className='flex-row flex-shrink-0 gap-[8px] w-[200px]'>
        <View className="gap-xs flex-1">
          <View className="bg-market-rise/15 border border-market-rise rounded-small flex-col items-center justify-center h-[24px]">
            <Text className="text-paragraph-p2 text-market-rise">{symbol.buyPrice}</Text>
          </View>
          {/* <Text className="text-paragraph-p3 text-content-4">最高 {symbol.highPrice}</Text> */}
        </View>
        <View className="gap-xs flex-1">
          <View className="bg-market-fall/15 border border-market-fall rounded-small flex-col items-center justify-center h-[24px]">
            <Text className="text-paragraph-p2 text-market-fall">{symbol.sellPrice}</Text>
          </View>
          {/* <Text className="text-paragraph-p3 text-content-4 text-right">最低 {symbol.lowPrice}</Text> */}
        </View>
      </View>
    </Pressable>
  )
}
