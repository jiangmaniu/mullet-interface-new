import { observer } from 'mobx-react-lite'
import React from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useShallow } from 'zustand/react/shallow'
import { router } from 'expo-router'

import { SparkLine } from '@/components/charts/spark-line'
import { AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { MARKET_OVERVIEW_SYMBOL_LIST, MarketOverviewSymbol } from '@/constants/market'
import { parseRiseAndFallInfo } from '@/helpers/market'
import { renderFormatSymbolName } from '@/helpers/symbol'
import { useMarketQuoteInfoWithSub } from '@/hooks/market/use-market-quote'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { cn } from '@/lib/utils'
import { useTradeSwitchActiveSymbol } from '@/pages/(protected)/(trade)/_hooks/use-trade-switch-symbol'
import { useRootStore } from '@/stores'
import { marketSymbolInfoListSelector, useMarketSymbolInfo } from '@/stores/market-slice'
import { userInfoActiveTradeAccountIdSelector } from '@/stores/user-slice/infoSlice'
import { getImgSource } from '@/utils/img'
import { BNumber } from '@mullet/utils/number'

import { useSymbolKline } from '../_hooks/use-symbol-kline'

// ============ MarketCard ============
interface MarketCardProps {
  symbol: string
}

const MarketCard = observer(({ symbol }: MarketCardProps) => {
  const activeTradeAccountId = useRootStore(userInfoActiveTradeAccountIdSelector)
  const hasSymbolData = useRootStore((s) => marketSymbolInfoListSelector(s).length > 0)

  // 检查账户信息和 symbolMapAll 是否已加载
  const hasAccountInfo = !!activeTradeAccountId
  const symbolInfo = useMarketSymbolInfo(symbol)

  // 如果账户信息未加载，或 symbolMapAll 未加载，或 symbolInfo 未加载，显示骨架屏
  const isDataLoading = !hasAccountInfo || !hasSymbolData || !symbolInfo

  if (isDataLoading) {
    return (
      <Card className="border-brand-default rounded-medium bg-navigation w-[153px] border p-0">
        <CardContent className="gap-medium">
          <View className="flex-row items-center gap-2">
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-4 w-16 rounded-xs" />
          </View>
          <View className="gap-1">
            <Skeleton className="h-4 w-20 rounded-xs" />
            <Skeleton className="h-3 w-12 rounded-xs" />
          </View>
          <Skeleton className="h-[60px] w-full rounded-xs" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <MarketCardContent symbol={symbol} />
    </>
  )
})

const CARD_CHART_WIDTH = 153
const CARD_CHART_HEIGHT = 60

const MarketCardContent = observer(({ symbol }: MarketCardProps) => {
  // 获取 K线历史数据
  const { data: chartData = [], isLoading: isChartLoading } = useSymbolKline(symbol)
  const { colorStatusSuccess, colorStatusDanger, textColorContent1 } = useThemeColors()
  const symbolInfo = useMarketSymbolInfo(symbol)
  // 获取行情数据
  const symbolMarketInfo = useMarketQuoteInfoWithSub(symbol)

  // 计算涨跌幅和价格（从订阅数据获取）
  const price = symbolMarketInfo?.userSellPrice
  const priceChangeInfo = parseRiseAndFallInfo(price)
  const change = symbolMarketInfo?.percent

  const changeColor = BNumber.from(change)?.gt(0)
    ? colorStatusSuccess
    : BNumber.from(change)?.lt(0)
      ? colorStatusDanger
      : textColorContent1

  // 判断是否应该显示图表
  const shouldShowChart = !isChartLoading && chartData.length > 0

  const { switchTradeActiveSymbol } = useTradeSwitchActiveSymbol()

  const handlePress = () => {
    if (!symbolInfo?.symbol) {
      return
    }

    switchTradeActiveSymbol(symbolInfo?.symbol)
    router.push(`/${symbolInfo?.symbol}`)
  }

  return (
    <Pressable onPress={handlePress}>
      <Card className="border-brand-default rounded-medium bg-navigation w-[153px] border p-0">
        <CardContent className="gap-medium">
          <View className="flex-row items-center gap-2">
            <AvatarImage source={getImgSource(symbolInfo?.imgUrl)} className="size-4 flex-shrink-0 rounded-full" />
            <Text className="text-content-1 text-sm font-medium">{renderFormatSymbolName(symbolInfo)}</Text>
          </View>

          <View>
            <Text
              className={cn(
                'text-sm font-medium',
                priceChangeInfo.isRise
                  ? 'text-market-rise'
                  : priceChangeInfo.isFall
                    ? 'text-market-fall'
                    : 'text-content-1',
              )}
            >
              {BNumber.toFormatNumber(price, { volScale: symbolInfo?.symbolDecimal })}
            </Text>
            <Text style={{ color: changeColor }} className="text-paragraph-p3">
              {BNumber.toFormatPercent(change, { forceSign: true, isRaw: false })}
            </Text>
          </View>

          {/* Mini Chart - SVG */}
          <View className="overflow-hidden" style={{ height: CARD_CHART_HEIGHT }} pointerEvents="none">
            {isChartLoading ? (
              <Skeleton className="mx-xl h-[60px] w-full rounded-xs" />
            ) : shouldShowChart ? (
              <SparkLine
                data={chartData}
                color={changeColor}
                width={CARD_CHART_WIDTH}
                height={CARD_CHART_HEIGHT}
                strokeWidth={1}
                fillEnabled
              />
            ) : null}
          </View>
        </CardContent>
      </Card>
    </Pressable>
  )
})

// ============ MarketOverview ============
export const MarketOverview = () => {
  const marketOverviewSymbolInfoList = useRootStore(
    useShallow((s) => {
      const list = marketSymbolInfoListSelector(s) ?? []
      return list.filter((symbolInfo) =>
        MARKET_OVERVIEW_SYMBOL_LIST.includes(symbolInfo.symbol as MarketOverviewSymbol),
      )
    }),
  )

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 12, gap: 12 }}>
      {marketOverviewSymbolInfoList.length <= 0 ? (
        <>
          {MARKET_OVERVIEW_SYMBOL_LIST.map((symbol) => (
            <MarketCard key={symbol} symbol={symbol} />
          ))}
        </>
      ) : (
        marketOverviewSymbolInfoList.map((symbolInfo) => (
          <MarketCard key={symbolInfo.symbol} symbol={symbolInfo.symbol} />
        ))
      )}
    </ScrollView>
  )
}
