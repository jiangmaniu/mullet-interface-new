import { Trans } from '@lingui/react/macro'
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useShallow } from 'zustand/react/shallow'
import { router, useRouter } from 'expo-router'
import { useResolveClassNames } from 'uniwind'

import { SparkLine } from '@/components/charts/spark-line'
import { EmptyState } from '@/components/states/empty-state'
import { AvatarImage } from '@/components/ui/avatar'
import {
  CollapsibleFlatList,
  CollapsibleStickyContent,
  CollapsibleStickyHeader,
  CollapsibleStickyNavBar,
  CollapsibleTab,
  CollapsibleTabScene,
} from '@/components/ui/collapsible-tab'
import { IconDepth, IconDepthTB, IconifyBell, IconifySearch } from '@/components/ui/icons'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Text } from '@/components/ui/text'
import { parseRiseAndFallInfo } from '@/helpers/market'
import { useMarketQuoteInfoWithSub } from '@/hooks/market/use-market-quote'
import { useI18n } from '@/hooks/use-i18n'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { cn } from '@/lib/utils'
import { SYMBOL_CATEGORY_OPTIONS, SymbolCategory, SymbolCategoryOption } from '@/options/market/symbol'
import { NotificationBadge } from '@/pages/(protected)/(home)/notifications/_comps/notification-badge'
import { useUnreadCount } from '@/pages/(protected)/(home)/notifications/_hooks/use-unread-count'
import { useTradeSwitchActiveSymbol } from '@/pages/(protected)/(trade)/_hooks/use-trade-switch-symbol'
import { Account } from '@/services/tradeCore/account/typings'
import { useRootStore } from '@/stores'
import { marketSymbolInfoListSelector } from '@/stores/market-slice'
import { marketCurrentFavoriteSymbolInfoListSelector } from '@/stores/market-slice/favorite-slice'
import { userInfoActiveTradeAccountIdSelector } from '@/stores/user-slice/infoSlice'
import { getImgSource } from '@/utils/img'
import { BNumber } from '@mullet/utils/number'

import { MarketOverview } from './_comps/market-overview'
import { useSymbolKline } from './_hooks/use-symbol-kline'

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
        <Pressable
          className="relative size-[22px] items-center justify-center"
          onPress={() => router.push('/notifications')}
        >
          <IconifyBell width={22} height={22} />
          <NotificationBadge count={unreadCount} />
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const SymbolInfoCell = ({ symbolInfo }: { symbolInfo: Account.TradeSymbolListItem }) => {
  return (
    <View className="gap-medium flex-1 flex-row items-center">
      <AvatarImage source={getImgSource(symbolInfo?.imgUrl)} className="size-6 flex-shrink-0 rounded-full" />
      <View className="flex-1">
        <Text className="text-paragraph-p2 text-content-1">{symbolInfo?.alias}</Text>
        <Text className="text-paragraph-p3 text-content-4">{symbolInfo?.alias}</Text>
      </View>
    </View>
  )
}

const MarketRow = ({ viewMode, symbolInfo }: { viewMode: ViewMode; symbolInfo: Account.TradeSymbolListItem }) => {
  const { switchTradeActiveSymbol } = useTradeSwitchActiveSymbol()

  const handlePress = () => {
    switchTradeActiveSymbol(symbolInfo?.symbol)
    router.push(`/${symbolInfo?.symbol}`)
  }

  return (
    <Pressable onPress={handlePress}>
      {/* 使用 display 控制显示/隐藏，避免重新挂载组件 */}
      <View style={{ display: viewMode === ViewMode.Market ? 'flex' : 'none' }}>
        <AssetMarketRow symbolInfo={symbolInfo} />
      </View>
      <View style={{ display: viewMode === ViewMode.Price ? 'flex' : 'none' }}>
        <AssetPriceRow symbolInfo={symbolInfo} />
      </View>
    </Pressable>
  )
}

// ============ AssetRow ============
interface AssetMarketRowProps {
  symbolInfo: Account.TradeSymbolListItem
}

const AssetMarketRow = ({ symbolInfo }: AssetMarketRowProps) => {
  const symbolMarketInfo = useMarketQuoteInfoWithSub(symbolInfo?.symbol)
  const { colorMarketRise, colorMarketFall, textColorContent1 } = useThemeColors()
  const userSellPricePriceChangeInfo = parseRiseAndFallInfo(symbolMarketInfo?.userSellPriceDiff)
  const percentChangeInfo = parseRiseAndFallInfo(symbolMarketInfo?.percent)

  // 获取 K线历史数据
  const { data: chartData = [], isLoading } = useSymbolKline(symbolInfo?.symbol)

  // 使用 useMemo 避免图表因行情数据变更而重绘
  const memoizedChartData = useMemo(() => chartData, [chartData])

  // 图表颜色
  const chartColor = percentChangeInfo.isRise
    ? colorMarketRise
    : percentChangeInfo.isFall
      ? colorMarketFall
      : textColorContent1

  return (
    <View className="p-xl gap-xl flex-row items-center">
      <SymbolInfoCell symbolInfo={symbolInfo} />

      <View className="gap-xl w-[192px] flex-shrink-0 flex-row">
        {/* K线图表 */}
        <View className="h-8 w-[70px] items-center justify-center overflow-hidden">
          {isLoading ? (
            <Skeleton className="h-full w-full rounded-xs" />
          ) : (
            <SparkLine data={memoizedChartData} color={chartColor} width={70} height={32} strokeWidth={1} />
          )}
        </View>

        <View className="flex-1 items-end">
          <Text
            className={cn(
              'text-paragraph-p1',
              userSellPricePriceChangeInfo.isRise
                ? 'text-market-rise'
                : userSellPricePriceChangeInfo.isFall
                  ? 'text-market-fall'
                  : 'text-content-1',
            )}
          >
            {BNumber.toFormatNumber(symbolMarketInfo?.userSellPrice, { volScale: symbolInfo?.symbolDecimal })}
          </Text>
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
}

function AssetTradeHeader({ viewMode }: { viewMode: ViewMode }) {
  return (
    <View className="py-medium px-xl mt-xl flex-row items-center justify-between">
      <Text className="text-paragraph-p3 text-content-5 flex-1">
        <Trans>品类</Trans>
      </Text>
      <View className="gap-xl flex-shrink-0 flex-row">
        <Text className="text-paragraph-p3 text-content-5 w-[90px]">
          {viewMode === ViewMode.Market ? <Trans>走势</Trans> : <Trans>买价</Trans>}
        </Text>
        <Text className="text-paragraph-p3 text-content-5 w-[90px] text-right">
          {viewMode === ViewMode.Market ? (
            <>
              <Trans>价格</Trans>/<Trans>涨跌幅</Trans>
            </>
          ) : (
            <Trans>卖价</Trans>
          )}
        </Text>
      </View>
    </View>
  )
}

// ============ AssetPriceRow ============
interface AssetPriceRowProps {
  symbolInfo: Account.TradeSymbolListItem
}

const AssetPriceRow = ({ symbolInfo }: AssetPriceRowProps) => {
  const symbolMarketInfo = useMarketQuoteInfoWithSub(symbolInfo?.symbol)
  return (
    <View className="p-xl gap-xl flex-row items-center">
      <SymbolInfoCell symbolInfo={symbolInfo} />

      <View className="gap-xl w-[192px] flex-shrink-0 flex-row">
        <View className="gap-xs flex-1">
          <View className="bg-market-rise/15 border-market-rise rounded-small h-[24px] flex-col items-center justify-center border">
            <Text className="text-paragraph-p2 text-market-rise">
              {BNumber.toFormatNumber(symbolMarketInfo?.userBuyPrice, { volScale: symbolInfo?.symbolDecimal })}
            </Text>
          </View>
          <Text className="text-paragraph-p3 text-content-4">
            最高 {BNumber.toFormatNumber(symbolMarketInfo?.high, { volScale: symbolInfo?.symbolDecimal })}
          </Text>
        </View>
        <View className="gap-xs flex-1">
          <View className="bg-market-fall/15 border-market-fall rounded-small h-[24px] flex-col items-center justify-center border">
            <Text className="text-paragraph-p2 text-market-fall">
              {BNumber.toFormatNumber(symbolMarketInfo?.userSellPrice, { volScale: symbolInfo?.symbolDecimal })}
            </Text>
          </View>
          <Text className="text-content-4 text-paragraph-p3 text-right">
            最低 {BNumber.toFormatNumber(symbolMarketInfo?.low, { volScale: symbolInfo?.symbolDecimal })}
          </Text>
        </View>
      </View>
    </View>
  )
}

// ============ Main Index ============
const AssetTabListContent = ({ viewMode, categoryOption }: { viewMode: ViewMode; categoryOption: SymbolCategoryOption }) => {
  const favoriteSymbolInfoList = useRootStore(marketCurrentFavoriteSymbolInfoListSelector)
  let tradeList: Account.TradeSymbolListItem[] = favoriteSymbolInfoList
  const symbolListAll = useRootStore(useShallow(marketSymbolInfoListSelector))

  if (categoryOption.value !== SymbolCategory.Favorite) {
    tradeList =
      categoryOption.value === SymbolCategory.All
        ? symbolListAll
        : symbolListAll.filter((item) => item.classify === categoryOption.value)
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
}

enum ViewMode {
  Market,
  Price,
}
export default function Index() {
  const [viewMode, setViewMode] = useState(ViewMode.Market)
  const { colorMarketRise, colorMarketFall, colorBrandSecondary1 } = useThemeColors()
  const { renderLinguiMsg } = useI18n()

  const initialTab = SYMBOL_CATEGORY_OPTIONS.find((item) => item.value === SymbolCategory.All)

  const renderHeader = useCallback(
    () => (
      <CollapsibleStickyHeader className="bg-secondary">
        <CollapsibleStickyNavBar>
          <HomeHeader />
        </CollapsibleStickyNavBar>

        <CollapsibleStickyContent>
          <MarketOverview />
        </CollapsibleStickyContent>
      </CollapsibleStickyHeader>
    ),
    [],
  )

  const activeTradeAccountId = useRootStore(userInfoActiveTradeAccountIdSelector)

  useLayoutEffect(() => {
    useRootStore.getState().market.symbol.fetchInfoList(activeTradeAccountId)
  }, [activeTradeAccountId])

  return (
    <View className="bg-secondary flex-1">
      <View className="flex-1">
        <CollapsibleTab
          lazy
          variant="underline"
          size="md"
          // minHeaderHeight={100}
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
            return (
              <CollapsibleTabScene
                key={categoryOption.value}
                name={categoryOption.value}
                label={renderLinguiMsg(categoryOption.label)}
              >
                <AssetTabListContent viewMode={viewMode} categoryOption={categoryOption} />
              </CollapsibleTabScene>
            )
          })}
        </CollapsibleTab>
      </View>
    </View>
  )
}
