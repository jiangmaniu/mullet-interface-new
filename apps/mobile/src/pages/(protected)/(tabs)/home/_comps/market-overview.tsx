import { observer } from 'mobx-react-lite'
import React from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { router } from 'expo-router'

import { SparkLine } from '@/components/charts/spark-line'
import { AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { HOT_SYMBOL_LIST } from '@/constants/market'
import { renderFormatSymbolName } from '@/helpers/symbol'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { getImgSource } from '@/utils/img'
import { useStores } from '@/v1/provider/mobxProvider'
import { subscribeCurrentAndPositionSymbol, useGetCurrentQuoteCallback } from '@/v1/utils/wsUtil'
import { BNumber } from '@mullet/utils/number'

import { useSymbolKline } from '../_hooks/use-symbol-kline'

// ============ MarketCard ============
interface MarketCardProps {
  symbol: string
}

const MarketCard = observer(({ symbol }: MarketCardProps) => {
  const { trade } = useStores()

  // 检查账户信息和 symbolMapAll 是否已加载
  const hasAccountInfo = !!trade.currentAccountInfo?.id
  const symbolInfo = trade.getActiveSymbolInfo(symbol)
  const hasSymbolData = Object.keys(trade.symbolMapAll).length > 0

  // 如果账户信息未加载，或 symbolMapAll 未加载，或 symbolInfo 未加载，显示骨架屏
  const isDataLoading = !hasAccountInfo || !hasSymbolData || !symbolInfo

  if (isDataLoading) {
    return (
      <Card className="border-brand-default rounded-medium bg-navigation w-[153px] border p-0">
        <CardContent className="gap-medium">
          <View className="flex-row items-center gap-2">
            <View className="bg-content-5 size-4 rounded-full opacity-10" />
            <View className="bg-content-5 rounded-xs h-4 w-16 opacity-10" />
          </View>
          <View className="gap-1">
            <View className="bg-content-5 rounded-xs h-4 w-20 opacity-10" />
            <View className="bg-content-5 rounded-xs h-3 w-12 opacity-10" />
          </View>
          <View className="bg-content-5 rounded-xs h-[60px] w-full opacity-10" />
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
  const { colorStatusSuccess, colorStatusDanger } = useThemeColors()
  const { trade } = useStores()
  const symbolInfo = trade.getActiveSymbolInfo(symbol)
  const getCurrentQuote = useGetCurrentQuoteCallback()

  // 获取行情数据
  const symbolMarketInfo = getCurrentQuote(symbol)

  // 计算涨跌幅和价格（从订阅数据获取）
  const price = symbolMarketInfo?.ask
  const change = symbolMarketInfo?.percent

  const changeColor = BNumber.from(change).gt(0)
    ? colorStatusSuccess
    : BNumber.from(change).lt(0)
      ? colorStatusDanger
      : 'text-content-1'

  // 判断是否应该显示图表
  const shouldShowChart = !isChartLoading && chartData.length > 0

  const handlePress = () => {
    trade.switchSymbol(symbolInfo?.symbol)
    subscribeCurrentAndPositionSymbol({ cover: true })
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
            <Text className="text-content-1 text-sm font-medium">{BNumber.toFormatNumber(price, { volScale: 2 })}</Text>
            <Text style={{ color: changeColor }} className="text-paragraph-p3">
              {BNumber.toFormatPercent(change, { forceSign: true, isRaw: false })}
            </Text>
          </View>

          {/* Mini Chart - SVG */}
          <View className="overflow-hidden" style={{ height: CARD_CHART_HEIGHT }} pointerEvents="none">
            {isChartLoading ? (
              <View className="bg-content-5 rounded-xs mx-xl h-full opacity-10" />
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
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 12, gap: 12 }}>
      {HOT_SYMBOL_LIST.map((symbol) => (
        <MarketCard key={symbol} symbol={symbol} />
      ))}
    </ScrollView>
  )
}
