import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Trans, useLingui } from '@lingui/react/macro'
import React, { useState } from 'react'

import { AreaChart, ChartData } from '@/components/trading-view'
import { Button, IconButton } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { IconifyBell, IconifySearch, IconDepth, IconDepthTB } from '@/components/ui/icons'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleTab, CollapsibleTabScene, CollapsibleScrollView } from '@/components/ui/collapsible-tab'
import { Text } from '@/components/ui/text'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { useResolveClassNames } from 'uniwind'

// ============ HomeHeader ============
function HomeHeader() {
  const { t } = useLingui()
  const searchIconStyle = useResolveClassNames('text-content-4')

  return (
    <View className="flex-row items-center justify-between gap-medium px-xl py-1.5">
      <View className="relative flex-1 items-center justify-center">
        <Input placeholder={t`查询`} className="w-full h-8" LeftContent={<IconifySearch width={20} height={20} style={searchIconStyle} />} />
      </View>

      <IconButton>
        <IconifyBell width={22} height={22} />
      </IconButton>
    </View>
  )
}

// ============ MarketCard ============
interface MarketCardProps {
  symbol: string
  price: string
  change: number
  data: ChartData[]
}

function MarketCard({ symbol, price, change, data }: MarketCardProps) {
  const isPositive = change >= 0
  const { colorStatusSuccess, colorStatusDanger } = useThemeColors()
  const changeColor = (isPositive ? colorStatusSuccess : colorStatusDanger) as string

  return (
    <Card className="w-[153px] border border-brand-default rounded-medium bg-navigation p-0">
      <CardContent className='gap-medium'>
        <View className="flex-row items-center">
          <Avatar className="size-[18px] mr-2 bg-primary">
            <AvatarFallback className="bg-transparent">
              <Text className="!text-paragraph-p3 text-content-1">{symbol[0]}</Text>
            </AvatarFallback>
          </Avatar>
          <Text className="font-medium text-sm text-content-1">{symbol}</Text>
        </View>

        <View>
          <Text className="font-medium text-sm text-content-1">{price}</Text>
          <Text style={{ color: changeColor }} className="text-paragraph-p3">
            {isPositive ? '+' : ''}{change.toFixed(2)}%
          </Text>
        </View>

        {/* Mini Chart */}
        <View className="h-[60px] w-full overflow-hidden" pointerEvents="none">
          <AreaChart
            data={data}
            lineColor={changeColor}
            lineWidth={1}
            topColor={`${changeColor}99`}
            bottomColor={`${changeColor}00`}
          />
        </View>
      </CardContent>
    </Card>
  )
}

// ============ MarketOverview ============
function MarketOverview() {
  const generateMockData = (count: number, startValue: number) => {
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

  const mockData1 = React.useMemo(() => generateMockData(50, 40), [])
  const mockData2 = mockData1.map(d => ({ ...d, value: d.value * 1.2 }))
  const mockData3 = mockData1.map(d => ({ ...d, value: d.value * 0.8 }))

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ padding: 12, gap: 12 }}
    >
      <MarketCard symbol="SOL-USDC" price="142.00" change={1.56} data={mockData1} />
      <MarketCard symbol="BTC-USDC" price="91,988.00" change={-1.56} data={mockData2} />
      <MarketCard symbol="ETH-USDC" price="3,200.00" change={-0.85} data={mockData3} />
    </ScrollView>
  )
}

// ============ AssetRow ============
interface AssetRowProps {
  symbol: string
  name: string
  price: string
  change: number
  chartData?: ChartData[]
}

function AssetRow({ symbol, name, price, change, chartData = [] }: AssetRowProps) {
  const isPositive = change >= 0
  const { colorMarketRise, colorMarketFall } = useThemeColors()

  return (
    <View className="flex-row items-center p-xl gap-xl">
      <View className="flex-row items-center gap-medium flex-1">
        <Avatar className="size-6 flex-shrink-0">
          <AvatarFallback className="bg-brand-default">
            <Text className="text-content-1">{symbol[0]}</Text>
          </AvatarFallback>
        </Avatar>
        <View>
          <Text className="text-paragraph-p2 text-content-1">{symbol}</Text>
          <Text className="text-paragraph-p3 text-content-4">{name}</Text>
        </View>
      </View>

      <View className='flex-row flex-shrink-0 gap-xl w-[192px]'>
        <View className="w-[60px] h-8 items-center justify-center overflow-hidden">
          <AreaChart data={chartData} lineColor={isPositive ? colorMarketRise : colorMarketFall} />
        </View>
        <View className="flex-1 items-end">
          <Text className="text-paragraph-p1 text-content-1">{price}</Text>
          <Text className={cn('text-paragraph-p2', isPositive ? 'text-market-rise' : 'text-market-fall')}>
            {isPositive ? '+' : ''}{change.toFixed(2)}%
          </Text>
        </View>
      </View>
    </View>
  )
}

// ============ AssetListView ============
function AssetListView() {
  const generateMockData = (count: number, startValue: number) => {
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

  return (
    <View>
      <View className="flex-row items-center justify-between py-medium px-xl">
        <Text className="text-paragraph-p2 text-content-5 flex-1"><Trans>品类</Trans></Text>
        <View className='flex-row gap-xl flex-shrink-0'>
          <Text className="text-paragraph-p2 text-content-5 w-[90px]"><Trans>走势</Trans></Text>
          <Text className="text-paragraph-p2 text-content-5 w-[90px] text-right"><Trans>价格/涨跌幅</Trans></Text>
        </View>
      </View>
      <AssetRow symbol="SOL-USDC" name="Solana" price="148.00" change={1.45} chartData={generateMockData(20, 140)} />
      <AssetRow symbol="XAU-USDC" name="现货黄金" price="148.00" change={-1.45} chartData={generateMockData(20, 148)} />
      <AssetRow symbol="SOL-USDC" name="Solana" price="148.00" change={1.45} chartData={generateMockData(20, 140)} />
      <AssetRow symbol="XAU-USDC" name="现货黄金" price="148.00" change={-1.45} chartData={generateMockData(20, 148)} />
      <AssetRow symbol="SOL-USDC" name="Solana" price="148.00" change={1.45} chartData={generateMockData(20, 140)} />
      <AssetRow symbol="XAU-USDC" name="现货黄金" price="148.00" change={-1.45} chartData={generateMockData(20, 148)} />
    </View>
  )
}

// ============ AssetTradeRow ============
interface AssetTradeRowProps {
  symbol: string
  name: string
  buyPrice: string
  sellPrice: string
  highPrice: string
  lowPrice: string
}

function AssetTradeRow({ symbol, name, buyPrice, sellPrice, highPrice, lowPrice }: AssetTradeRowProps) {
  return (
    <View className="flex-row items-center p-xl gap-xl">
      <View className="flex-row items-center gap-medium flex-1">
        <Avatar className="size-6 flex-shrink-0">
          <AvatarFallback className="bg-brand-default">
            <Text className="text-content-1">{symbol[0]}</Text>
          </AvatarFallback>
        </Avatar>
        <View>
          <Text className="text-paragraph-p2 text-content-1">{symbol}</Text>
          <Text className="text-paragraph-p3 text-content-4">{name}</Text>
        </View>
      </View>

      <View className='flex-row flex-shrink-0 gap-xl w-[192px]'>
        <View className="gap-xs flex-1">
          <View className="bg-market-rise/15 border border-market-rise rounded-small flex-col items-center justify-center h-[24px]">
            <Text className="text-paragraph-p2 text-market-rise">{buyPrice}</Text>
          </View>
          <Text className="text-paragraph-p3 text-content-4">最高 {highPrice}</Text>
        </View>
        <View className="gap-xs flex-1">
          <View className="bg-market-fall/15 border border-market-fall rounded-small flex-col items-center justify-center h-[24px]">
            <Text className="text-paragraph-p2 text-market-fall">{sellPrice}</Text>
          </View>
          <Text className="text-content-4 text-paragraph-p3 text-right">最低 {lowPrice}</Text>
        </View>
      </View>
    </View>
  )
}

// ============ AssetTradeView ============
function AssetTradeView() {
  return (
    <View>
      <View className="flex-row items-center justify-between py-medium px-xl">
        <Text className="text-paragraph-p2 text-content-5 flex-1"><Trans>品类</Trans></Text>
        <View className='flex-row gap-xl flex-shrink-0'>
          <Text className="text-paragraph-p2 text-content-5 w-[90px]"><Trans>买价</Trans></Text>
          <Text className="text-paragraph-p2 text-content-5 w-[90px] text-right"><Trans>卖价</Trans></Text>
        </View>
      </View>
      <AssetTradeRow symbol="SOL-USDC" name="Solana" buyPrice="186.00" sellPrice="186.00" highPrice="180.00" lowPrice="180.00" />
      <AssetTradeRow symbol="XAU-USDC" name="现货黄金" buyPrice="486.00" sellPrice="486.00" highPrice="480.00" lowPrice="480.00" />
      <AssetTradeRow symbol="BTC-USDC" name="Bitcoin" buyPrice="198,652.0" sellPrice="198,186.00" highPrice="198,280.0" lowPrice="198,280.0" />
      <AssetTradeRow symbol="SOL-USDC" name="Solana" buyPrice="186.00" sellPrice="186.00" highPrice="180.00" lowPrice="180.00" />
      <AssetTradeRow symbol="XAU-USDC" name="现货黄金" buyPrice="486.00" sellPrice="486.00" highPrice="480.00" lowPrice="480.00" />
      <AssetTradeRow symbol="BTC-USDC" name="Bitcoin" buyPrice="198,652.0" sellPrice="198,186.00" highPrice="198,280.0" lowPrice="198,280.0" />
    </View>
  )
}

// ============ Main Index ============
export default function Index() {
  const [viewMode, setViewMode] = useState('list')
  const { colorMarketRise, colorMarketFall, colorBrandSecondary1 } = useThemeColors()

  const Header = () => (
    <SafeAreaView edges={['top']}>
      <HomeHeader />
      <ScrollView showsHorizontalScrollIndicator={false} horizontal>
        <MarketOverview />
      </ScrollView>
    </SafeAreaView>
  )

  return (
    // <SafeAreaView className="flex-1" edges={['top']}>
    <CollapsibleTab
      headerHeight={200}
      renderHeader={Header}
      variant="underline"
      size="md"
      tabBarClassName="border-b border-brand-default"
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
    >
      <CollapsibleTabScene name="watchlist" label="自选">
        <CollapsibleScrollView>
          {viewMode === 'list' ? <AssetListView /> : <AssetTradeView />}
        </CollapsibleScrollView>
      </CollapsibleTabScene>

      <CollapsibleTabScene name="all" label="全部">
        <CollapsibleScrollView>
          {viewMode === 'list' ? <AssetListView /> : <AssetTradeView />}
        </CollapsibleScrollView>
      </CollapsibleTabScene>

      <CollapsibleTabScene name="hot" label="热门">
        <CollapsibleScrollView>
          {viewMode === 'list' ? <AssetListView /> : <AssetTradeView />}
        </CollapsibleScrollView>
      </CollapsibleTabScene>

      <CollapsibleTabScene name="gainers" label="涨跌幅">
        <CollapsibleScrollView>
          {viewMode === 'list' ? <AssetListView /> : <AssetTradeView />}
        </CollapsibleScrollView>
      </CollapsibleTabScene>
    </CollapsibleTab>
    // </SafeAreaView>
  )
}
