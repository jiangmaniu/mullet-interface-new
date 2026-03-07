// React & React Native
import { Trans, useLingui } from '@lingui/react/macro'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
// 第三方库
import { useRouter } from 'expo-router'

import { EmptyState } from '@/components/states/empty-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { IconDepth, IconDepthTB, IconifySearch } from '@/components/ui/icons'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
// 项目内部模块
import { Text } from '@/components/ui/text'
import { parseRiseAndFallInfo } from '@/helpers/market'
import { renderFormatSymbolName } from '@/helpers/symbol'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { cn } from '@/lib/utils'
import { getImgSource } from '@/utils/img'
import { useStores } from '@/v1/provider/mobxProvider'
import { Account } from '@/v1/services/tradeCore/account/typings'
import { subscribeCurrentAndPositionSymbol, useGetCurrentQuoteCallback } from '@/v1/utils/wsUtil'
import { BNumber } from '@mullet/utils/number'

// 相对路径导入
import { HighlightText } from './_comps/highlight-text'

// 热门品种列表
const HOT_SYMBOL_LIST = ['SOL', 'XAU', 'BTC', 'ETH', 'EURUSD']

/**
 * 筛选热门品种
 * 根据预定义的热门品种列表，从所有品种中筛选出匹配的品种
 */
function getHotSymbols(symbolListAll: Account.TradeSymbolListItem[]) {
  const hotSymbolsLower = HOT_SYMBOL_LIST.map((s) => s.toLowerCase())
  return symbolListAll.filter((item) => hotSymbolsLower.some((hot) => item.alias?.toLowerCase().includes(hot)))
}

/**
 * 计算匹配权重
 * 根据搜索字符在品种名称和别名中出现的次数计算匹配分数
 */
function calculateMatchScore(item: Account.TradeSymbolListItem, searchChars: string[]): number {
  const searchText = `${item.symbol} ${item.alias || ''}`.toLowerCase()
  return searchChars.filter((char) => searchText.includes(char.toLowerCase())).length
}

/**
 * 搜索并排序品种
 * 如果没有搜索关键词，返回热门品种；否则根据匹配权重排序
 */
function searchAndSortSymbols(symbolListAll: Account.TradeSymbolListItem[], searchQuery: string) {
  const searchChars = searchQuery
    .trim()
    .split('')
    .filter((c) => c.trim())

  if (searchChars.length === 0) {
    return getHotSymbols(symbolListAll)
  }

  return symbolListAll
    .map((item) => ({ item, score: calculateMatchScore(item, searchChars) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item)
}

// ============ SearchAssetRow ============
function SearchAssetRow({
  symbolInfo,
  searchChars,
  onSelect,
}: {
  symbolInfo: Account.TradeSymbolListItem
  searchChars: string[]
  onSelect: () => void
}) {
  const getCurrentQuote = useGetCurrentQuoteCallback()
  const symbolMarketInfo = getCurrentQuote(symbolInfo.symbol)
  const percentChangeInfo = parseRiseAndFallInfo(symbolMarketInfo.percent)

  return (
    <Pressable onPress={onSelect} className="p-xl gap-xl flex-row items-center">
      <View className="gap-medium flex-1 flex-row items-center">
        <AvatarImage source={getImgSource(symbolInfo.imgUrl)} className="size-6 flex-shrink-0 rounded-full" />
        <View className="flex-1">
          <HighlightText
            text={renderFormatSymbolName(symbolInfo)}
            searchChars={searchChars}
            className="text-paragraph-p2 text-content-1"
          />
          <HighlightText
            text={symbolInfo.remark ?? ''}
            searchChars={searchChars}
            className="text-paragraph-p3 text-content-4"
          />
        </View>
      </View>

      <View className="gap-xl w-[192px] flex-shrink-0 flex-row">
        <View className="flex-1">
          <Text className="text-paragraph-p1 text-content-1">
            {BNumber.toFormatNumber(symbolMarketInfo.ask, { volScale: symbolInfo.symbolDecimal })}
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
            {BNumber.toFormatPercent(symbolMarketInfo.percent, { forceSign: true, isRaw: false })}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}

// ============ SearchAssetTradeRow ============
function SearchAssetTradeRow({
  symbolInfo,
  searchChars,
  onSelect,
}: {
  symbolInfo: Account.TradeSymbolListItem
  searchChars: string[]
  onSelect: () => void
}) {
  const getCurrentQuote = useGetCurrentQuoteCallback()
  const symbolMarketInfo = getCurrentQuote(symbolInfo.symbol)

  return (
    <Pressable onPress={onSelect} className="p-xl gap-xl flex-row items-center">
      <View className="gap-medium flex-1 flex-row items-center">
        <AvatarImage source={getImgSource(symbolInfo.imgUrl)} className="size-6 flex-shrink-0 rounded-full" />
        <View>
          <HighlightText
            text={renderFormatSymbolName(symbolInfo)}
            searchChars={searchChars}
            className="text-paragraph-p2 text-content-1"
          />
          <HighlightText
            text={symbolInfo.remark ?? ''}
            searchChars={searchChars}
            className="text-paragraph-p3 text-content-4"
          />
        </View>
      </View>

      <View className="gap-xl w-[192px] flex-shrink-0 flex-row">
        <View className="gap-xs flex-1">
          <View className="bg-market-rise/15 border-market-rise rounded-small h-[24px] flex-col items-center justify-center border">
            <Text className="text-paragraph-p2 text-market-rise">
              {BNumber.toFormatNumber(symbolMarketInfo.bid, { volScale: symbolInfo.symbolDecimal })}
            </Text>
          </View>
          <Text className="text-paragraph-p3 text-content-4">
            <Trans>最高</Trans> {BNumber.toFormatNumber(symbolMarketInfo.high, { volScale: symbolInfo.symbolDecimal })}
          </Text>
        </View>
        <View className="gap-xs flex-1">
          <View className="bg-market-fall/15 border-market-fall rounded-small h-[24px] flex-col items-center justify-center border">
            <Text className="text-paragraph-p2 text-market-fall">
              {BNumber.toFormatNumber(symbolMarketInfo.ask, { volScale: symbolInfo.symbolDecimal })}
            </Text>
          </View>
          <Text className="text-content-4 text-paragraph-p3 text-right">
            <Trans>最低</Trans> {BNumber.toFormatNumber(symbolMarketInfo.low, { volScale: symbolInfo.symbolDecimal })}
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

  console.log(trade.symbolListAll)

  // 使用真实数据进行搜索和排序
  const filteredSymbols = useMemo(() => {
    return searchAndSortSymbols(trade.symbolListAll, debouncedQuery)
  }, [trade.symbolListAll, debouncedQuery])

  // 提取搜索字符用于高亮显示（Task 4 会使用）
  const searchChars = useMemo(() => {
    return debouncedQuery
      .trim()
      .split('')
      .filter((c) => c.trim())
  }, [debouncedQuery])

  const handleSelect = useCallback(
    (symbol: string) => {
      trade.switchSymbol(symbol)
      subscribeCurrentAndPositionSymbol({ cover: true })

      router.push(`/${symbol}`)
    },
    [router, trade],
  )

  return (
    <View className="bg-secondary flex-1">
      <SafeAreaView edges={['top']}>
        {/* Search Header */}
        <View className="px-xl mb-1.5 flex-row items-center gap-[10px] py-1.5">
          <View className="flex-1">
            <Input
              placeholder={t`查询`}
              className="h-8"
              size="sm"
              hideLabel
              value={searchQuery}
              onValueChange={setSearchQuery}
              autoFocus
              LeftContent={<IconifySearch width={20} height={20} />}
            />
          </View>
          <Pressable onPress={() => router.back()} className="items-center justify-center">
            <Text className="text-paragraph-p2 text-content-1">
              <Trans>取消</Trans>
            </Text>
          </Pressable>
        </View>

        {/* Section Header */}
        <View className="p-xl flex-row items-center justify-between">
          <Text className="text-important-1 text-content-1">
            {searchChars.length > 0 ? <Trans>搜索结果</Trans> : <Trans>热门品种</Trans>}
          </Text>
          <View>
            <Tabs value={viewMode} onValueChange={setViewMode} className="">
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
        </View>
      </SafeAreaView>

      {/* Asset List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {filteredSymbols.length === 0 ? (
          <View className="py-[96px]">
            <EmptyState message={<Trans>暂无搜索内容</Trans>} iconWidth={107} iconHeight={76} className="gap-2xl" />
          </View>
        ) : (
          filteredSymbols.map((item) =>
            viewMode === 'trade' ? (
              <SearchAssetTradeRow
                key={item.symbol}
                symbolInfo={item}
                searchChars={searchChars}
                onSelect={() => handleSelect(item.symbol)}
              />
            ) : (
              <SearchAssetRow
                key={item.symbol}
                symbolInfo={item}
                searchChars={searchChars}
                onSelect={() => handleSelect(item.symbol)}
              />
            ),
          )
        )}
      </ScrollView>
    </View>
  )
}
