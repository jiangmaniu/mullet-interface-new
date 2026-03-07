import { Trans, useLingui } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useLayoutEffect, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useRouter } from 'expo-router'
import { useResolveClassNames } from 'uniwind'

import { EmptyState } from '@/components/states/empty-state'
import { AreaChart, ChartData } from '@/components/trading-view'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import {
  CollapsibleFlatList,
  CollapsibleStickyContent,
  CollapsibleStickyHeader,
  CollapsibleStickyNavBar,
  CollapsibleTab,
  CollapsibleTabScene,
} from '@/components/ui/collapsible-tab'
import { IconDepth, IconDepthTB, IconifyBell, IconifySearch } from '@/components/ui/icons'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Text } from '@/components/ui/text'
import { parseRiseAndFallInfo } from '@/helpers/market'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { cn } from '@/lib/utils'
import { SYMBOL_CATEGORY_OPTIONS, SymbolCategory, SymbolCategoryOption } from '@/options/market/symbol'
import { getImgSource } from '@/utils/img'
import { stores, useStores } from '@/v1/provider/mobxProvider'
import { Account } from '@/v1/services/tradeCore/account/typings'
import { subscribeCurrentAndPositionSymbol, useGetCurrentQuoteCallback } from '@/v1/utils/wsUtil'
import { BNumber } from '@mullet/utils/number'
import { useUnreadCount } from '@/pages/(protected)/(home)/notifications/_hooks/use-unread-count'
import { NotificationBadge } from '@/pages/(protected)/(home)/notifications/_comps/notification-badge'

// ============ HomeHeader ============
function HomeHeader() {
  const searchIconStyle = useResolveClassNames('text-content-4')
  const router = useRouter()
  const { data: unreadCount = 0 } = useUnreadCount()

  return (
    <SafeAreaView edges={['top']}>
      <View className="px-xl flex-row items-center gap-[10px] py-1.5">
        <Pressable
          className="gap-medium px-xl border-brand-default rounded-medium h-8 flex-1 flex-row items-center border"
          onPress={() => router.push('/search')}
        >
          <IconifySearch width={20} height={20} style={searchIconStyle} />
          <Text className="text-paragraph-p2 text-content-5">
            <Trans>查询</Trans>
          </Text>
        </Pressable>
        <Pressable className="size-[22px] items-center justify-center relative" onPress={() => router.push('/notifications')}>
          <IconifyBell width={22} height={22} />
          <NotificationBadge count={unreadCount} />
        </Pressable>
      </View>
    </SafeAreaView>
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
    <Card className="border-brand-default rounded-medium bg-navigation w-[153px] border p-0">
      <CardContent className="gap-medium">
        <View className="flex-row items-center">
          <Avatar className="bg-primary mr-2 size-[18px]">
            <AvatarFallback className="bg-transparent">
              <Text className="!text-paragraph-p3 text-content-1">{symbol[0]}</Text>
            </AvatarFallback>
          </Avatar>
          <Text className="text-content-1 text-sm font-medium">{symbol}</Text>
        </View>

        <View>
          <Text className="text-content-1 text-sm font-medium">{price}</Text>
          <Text style={{ color: changeColor }} className="text-paragraph-p3">
            {isPositive ? '+' : ''}
            {change.toFixed(2)}%
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
  const mockData2 = mockData1.map((d) => ({ ...d, value: d.value * 1.2 }))
  const mockData3 = mockData1.map((d) => ({ ...d, value: d.value * 0.8 }))

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 12, gap: 12 }}>
      <MarketCard symbol="SOL-USDC" price="142.00" change={1.56} data={mockData1} />
      <MarketCard symbol="BTC-USDC" price="91,988.00" change={-1.56} data={mockData2} />
      <MarketCard symbol="ETH-USDC" price="3,200.00" change={-0.85} data={mockData3} />
    </ScrollView>
  )
}

const SymbolInfoCell = observer(({ symbolInfo }: { symbolInfo: Account.TradeSymbolListItem }) => {
  return (
    <View className="gap-medium flex-1 flex-row items-center">
      <AvatarImage source={getImgSource(symbolInfo.imgUrl)} className="size-6 flex-shrink-0 rounded-full" />
      <View>
        <Text className="text-paragraph-p2 text-content-1">{symbolInfo.symbol}</Text>
        <Text className="text-paragraph-p3 text-content-4">{symbolInfo.alias}</Text>
      </View>
    </View>
  )
})

const MarketRow = observer(
  ({ viewMode, symbolInfo }: { viewMode: ViewMode; symbolInfo: Account.TradeSymbolListItem }) => {
    const { trade } = useStores()

    const handlePress = () => {
      trade.switchSymbol(symbolInfo.symbol)
      subscribeCurrentAndPositionSymbol({ cover: true })
      router.push(`/${symbolInfo.symbol}`)
    }

    return (
      <Pressable onPress={handlePress}>
        {viewMode === ViewMode.Market ? (
          <AssetMarketRow symbolInfo={symbolInfo} />
        ) : (
          <AssetPriceRow symbolInfo={symbolInfo} />
        )}
      </Pressable>
    )
  },
)

// ============ AssetRow ============
interface AssetMarketRowProps {
  symbolInfo: Account.TradeSymbolListItem
}

const AssetMarketRow = observer(({ symbolInfo }: AssetMarketRowProps) => {
  const getCurrentQuote = useGetCurrentQuoteCallback()
  const symbolMarketInfo = getCurrentQuote(symbolInfo.symbol)
  // const { colorMarketRise, colorMarketFall } = useThemeColors()
  const askPriceChangeInfo = parseRiseAndFallInfo(symbolMarketInfo.askDiff)
  const percentChangeInfo = parseRiseAndFallInfo(symbolMarketInfo.percent)

  return (
    <View className="p-xl gap-xl flex-row items-center">
      <SymbolInfoCell symbolInfo={symbolInfo} />

      <View className="gap-xl w-[192px] flex-shrink-0 flex-row">
        {/* <View className="w-[60px] h-8 items-center justify-center overflow-hidden">
          <AreaChart data={generateMockData(20, 91000)} lineColor={askPriceChangeInfo.isRise ? colorMarketRise : colorMarketFall} />
        </View> */}
        <View>
          <Text
            className={cn(
              'text-paragraph-p1',
              askPriceChangeInfo.isRise
                ? 'text-market-rise'
                : askPriceChangeInfo.isFall
                  ? 'text-market-fall'
                  : 'text-content-1',
            )}
          >
            {BNumber.toFormatNumber(symbolMarketInfo.ask, { volScale: symbolInfo?.symbolDecimal })}
          </Text>
        </View>
        <View className="flex-1 items-end">
          <Text
            className={cn(
              'text-paragraph-p2',
              percentChangeInfo.isRise
                ? 'text-market-rise'
                : percentChangeInfo.isFall
                  ? 'text-market-fall'
                  : 'text-content-1',
            )}
          >
            {BNumber.toFormatPercent(symbolMarketInfo?.percent, { forceSign: true, isRaw: false })}
          </Text>
        </View>
      </View>
    </View>
  )
})

// ============ Mock Data ============
function generateMockData(count: number, startValue: number): ChartData[] {
  const data: ChartData[] = []
  let time = 1642425322
  let value = startValue
  for (let i = 0; i < count; i++) {
    data.push({ time, value })
    time += 86400
    value += (Math.random() - 0.5) * 5
  }
  return data
}

function AssetTradeHeader({ viewMode }: { viewMode: ViewMode }) {
  return (
    <View className="py-medium px-xl mt-xl flex-row items-center justify-between">
      <Text className="text-paragraph-p3 text-content-5 flex-1">
        <Trans>品类</Trans>
      </Text>
      <View className="gap-xl flex-shrink-0 flex-row">
        <Text className="text-paragraph-p3 text-content-5 w-[90px]">
          {viewMode === ViewMode.Market ? <Trans>价格</Trans> : <Trans>买价</Trans>}
        </Text>
        <Text className="text-paragraph-p3 text-content-5 w-[90px] text-right">
          {viewMode === ViewMode.Market ? <Trans>涨跌幅</Trans> : <Trans>卖价</Trans>}
        </Text>
      </View>
    </View>
  )
}

// ============ AssetPriceRow ============
interface AssetPriceRowProps {
  symbolInfo: Account.TradeSymbolListItem
}

const AssetPriceRow = observer(({ symbolInfo }: AssetPriceRowProps) => {
  const getCurrentQuote = useGetCurrentQuoteCallback()
  const symbolMarketInfo = getCurrentQuote(symbolInfo.symbol)

  return (
    <View className="p-xl gap-xl flex-row items-center">
      <SymbolInfoCell symbolInfo={symbolInfo} />

      <View className="gap-xl w-[192px] flex-shrink-0 flex-row">
        <View className="gap-xs flex-1">
          <View className="bg-market-rise/15 border-market-rise rounded-small h-[24px] flex-col items-center justify-center border">
            <Text className="text-paragraph-p2 text-market-rise">
              {BNumber.toFormatNumber(symbolMarketInfo?.bid, { volScale: symbolInfo?.symbolDecimal })}
            </Text>
          </View>
          <Text className="text-paragraph-p3 text-content-4">
            最高 {BNumber.toFormatNumber(symbolMarketInfo?.high, { volScale: symbolInfo?.symbolDecimal })}
          </Text>
        </View>
        <View className="gap-xs flex-1">
          <View className="bg-market-fall/15 border-market-fall rounded-small h-[24px] flex-col items-center justify-center border">
            <Text className="text-paragraph-p2 text-market-fall">
              {BNumber.toFormatNumber(symbolMarketInfo?.ask, { volScale: symbolInfo?.symbolDecimal })}
            </Text>
          </View>
          <Text className="text-content-4 text-paragraph-p3 text-right">
            最低 {BNumber.toFormatNumber(symbolMarketInfo?.low, { volScale: symbolInfo?.symbolDecimal })}
          </Text>
        </View>
      </View>
    </View>
  )
})

// ============ Main Index ============
const AssetTabListContent = observer(
  ({ viewMode, categoryOption }: { viewMode: ViewMode; categoryOption: SymbolCategoryOption }) => {
    const { trade } = useStores()
    let tradeList = trade.favoriteList

    if (categoryOption.value !== SymbolCategory.Favorite) {
      tradeList =
        categoryOption.value === SymbolCategory.All
          ? trade.symbolListAll
          : trade.symbolListAll.filter((item) => item.classify === categoryOption.value)
    }

    return (
      <CollapsibleFlatList
        data={tradeList}
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }: { item: Account.TradeSymbolListItem }) => {
          return <MarketRow viewMode={viewMode} symbolInfo={item} />
        }}
        ListEmptyComponent={
          <View className="py-[96px]">
            <EmptyState message={<Trans>暂无数据</Trans>} />
          </View>
        }
      />
    )
  },
)

enum ViewMode {
  Market,
  Price,
}
export default function Index() {
  const [viewMode, setViewMode] = useState(ViewMode.Market)
  const { colorMarketRise, colorMarketFall, colorBrandSecondary1 } = useThemeColors()
  const { i18n } = useLingui()

  const initialTab = SYMBOL_CATEGORY_OPTIONS.find((item) => item.value === SymbolCategory.All)

  const renderHeader = useCallback(
    () => (
      <CollapsibleStickyHeader className="bg-secondary">
        <CollapsibleStickyContent>
          <HomeHeader />
          <MarketOverview />
        </CollapsibleStickyContent>
      </CollapsibleStickyHeader>
    ),
    [],
  )

  useLayoutEffect(() => {
    // 重新刷新品种列表
    stores.trade.getSymbolList()
  }, [])

  return (
    <View className="bg-secondary flex-1">
      <CollapsibleTab
        variant="underline"
        size="md"
        initialTabName={initialTab?.value}
        renderHeader={renderHeader}
        renderTabBarRight={() => (
          <Tabs value={viewMode} onValueChange={setViewMode} className="flex-none">
            <TabsList variant="icon" size="sm">
              <TabsTrigger value={ViewMode.Market} className="size-5">
                <IconDepthTB
                  width={12}
                  height={12}
                  color={viewMode === ViewMode.Market ? colorMarketFall : colorBrandSecondary1}
                />
              </TabsTrigger>
              <TabsTrigger value={ViewMode.Price} className="size-5">
                <IconDepth
                  width={12}
                  height={12}
                  color={viewMode === ViewMode.Price ? colorMarketFall : colorBrandSecondary1}
                  primaryColor={viewMode === ViewMode.Price ? colorMarketRise : colorBrandSecondary1}
                />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        renderTabBarBottom={() => <AssetTradeHeader viewMode={viewMode} />}
      >
        {SYMBOL_CATEGORY_OPTIONS.map((categoryOption) => {
          const label = i18n._(categoryOption.label)
          return (
            <CollapsibleTabScene key={categoryOption.value} name={categoryOption.value} label={label}>
              <AssetTabListContent viewMode={viewMode} categoryOption={categoryOption} />
            </CollapsibleTabScene>
          )
        })}
      </CollapsibleTab>
    </View>
  )
}
