// React & React Native
import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
// 第三方库
import { useDebounce } from 'ahooks'
import { useRouter } from 'expo-router'

import { EmptyState } from '@/components/states/empty-state'
import { AvatarImage } from '@/components/ui/avatar'
import { IconDepth, IconDepthTB, IconifySearch } from '@/components/ui/icons'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
// 项目内部模块
import { Text } from '@/components/ui/text'
import { HOT_SYMBOL_LIST } from '@/constants/market'
import { parseRiseAndFallInfo } from '@/helpers/market'
import { renderFormatSymbolName } from '@/helpers/symbol'
import { useMarketQuoteInfoWithSub } from '@/hooks/market/use-market-quote'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { cn } from '@/lib/utils'
import { useRootStore } from '@/stores'
import { userInfoActiveTradeAccountIdSelector } from '@/stores/user-slice/infoSlice'
import { getImgSource } from '@/utils/img'
import { useStores } from '@/v1/provider/mobxProvider'
import { Account } from '@/v1/services/tradeCore/account/typings'
import { BNumber } from '@mullet/utils/number'

import { useTradeSwitchActiveSymbol } from '../(trade)/_hooks/use-trade-switch-symbol'
// 相对路径导入
import { HighlightText } from './_comps/highlight-text'

/**
 * 筛选热门品种
 * 根据预定义的热门品种列表，从所有品种中筛选出匹配的品种，并按照 HOT_SYMBOL_LIST 的顺序返回
 */
function getHotSymbols(symbolListAll: Account.TradeSymbolListItem[]) {
  const result: Account.TradeSymbolListItem[] = []

  // 按照 HOT_SYMBOL_LIST 的顺序遍历
  for (const hotSymbol of HOT_SYMBOL_LIST) {
    const hotSymbolLower = hotSymbol.toLowerCase()
    // 在 symbolListAll 中查找匹配的品种
    const matchedSymbol = symbolListAll.find((item) => item.alias?.toLowerCase().includes(hotSymbolLower))
    if (matchedSymbol) {
      result.push(matchedSymbol)
    }
  }

  return result
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
 * 如果没有搜索关键词,返回热门品种；否则根据匹配权重排序
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

// ============ SymbolInfoCell ============
/**
 * Symbol 信息展示组件
 * 用于展示品种的图标、名称和描述，支持搜索高亮
 */
function SymbolInfoCell({
  symbolInfo,
  searchChars,
}: {
  symbolInfo: Account.TradeSymbolListItem
  searchChars: string[]
}) {
  return (
    <View className="gap-medium flex-1 flex-row">
      <AvatarImage source={getImgSource(symbolInfo?.imgUrl)} className="size-6 flex-shrink-0 rounded-full" />
      <View className="flex-1">
        <HighlightText
          text={renderFormatSymbolName(symbolInfo)}
          searchChars={searchChars}
          className="text-paragraph-p2 text-content-1"
        />
        <HighlightText
          text={symbolInfo?.remark ?? ''}
          searchChars={searchChars}
          className="text-paragraph-p3 text-content-4 flex-wrap"
        />
      </View>
    </View>
  )
}

// ============ SearchAssetRow ============
const SearchAssetRow = observer(function SearchAssetRow({
  symbolInfo,
  searchChars,
  onSelect,
}: {
  symbolInfo: Account.TradeSymbolListItem
  searchChars: string[]
  onSelect: () => void
}) {
  const symbolMarketInfo = useMarketQuoteInfoWithSub(symbolInfo?.symbol)
  const price = symbolMarketInfo?.userSellPrice
  const priceChangeInfo = parseRiseAndFallInfo(symbolMarketInfo?.userSellPriceDiff)
  const percentChangeInfo = parseRiseAndFallInfo(symbolMarketInfo?.percent)
  // 图表颜色
  const changeColor = percentChangeInfo.isRise
    ? 'text-market-rise'
    : percentChangeInfo.isFall
      ? 'text-market-fall'
      : 'text-content-1'

  return (
    <Pressable onPress={onSelect} className="p-xl gap-xl flex-row items-center">
      <SymbolInfoCell symbolInfo={symbolInfo} searchChars={searchChars} />

      <View className="min-w-[150px] flex-shrink-0 flex-row gap-2">
        <View className="flex-1">
          <Text
            className={cn(
              'text-paragraph-p1',
              priceChangeInfo.isRise
                ? 'text-market-rise'
                : priceChangeInfo.isFall
                  ? 'text-market-fall'
                  : 'text-content-1',
            )}
          >
            {BNumber.toFormatNumber(price, { volScale: symbolInfo?.symbolDecimal })}
          </Text>
        </View>
        <View className="items-end">
          <Text className={cn('text-paragraph-p2', changeColor)}>
            {BNumber.toFormatPercent(symbolMarketInfo?.percent, { forceSign: true, isRaw: false })}
          </Text>
        </View>
      </View>
    </Pressable>
  )
})

// ============ SearchAssetTradeRow ============
const SearchAssetTradeRow = observer(function SearchAssetTradeRow({
  symbolInfo,
  searchChars,
  onSelect,
}: {
  symbolInfo: Account.TradeSymbolListItem
  searchChars: string[]
  onSelect: () => void
}) {
  const symbolMarketInfo = useMarketQuoteInfoWithSub(symbolInfo?.symbol)

  return (
    <Pressable onPress={onSelect} className="p-xl gap-xl flex-row items-center">
      <SymbolInfoCell symbolInfo={symbolInfo} searchChars={searchChars} />

      <View className="gap-xl w-[192px] flex-shrink-0 flex-row">
        <View className="gap-xs flex-1">
          <View className="bg-market-rise/15 border-market-rise rounded-small h-[24px] flex-col items-center justify-center border">
            <Text className="text-paragraph-p2 text-market-rise">
              {BNumber.toFormatNumber(symbolMarketInfo?.userBuyPrice, { volScale: symbolInfo?.symbolDecimal })}
            </Text>
          </View>
          <Text className="text-paragraph-p3 text-content-4">
            <Trans>最高</Trans>{' '}
            {BNumber.toFormatNumber(symbolMarketInfo?.high, { volScale: symbolInfo?.symbolDecimal })}
          </Text>
        </View>
        <View className="gap-xs flex-1">
          <View className="bg-market-fall/15 border-market-fall rounded-small h-[24px] flex-col items-center justify-center border">
            <Text className="text-paragraph-p2 text-market-fall">
              {BNumber.toFormatNumber(symbolMarketInfo?.userSellPrice, { volScale: symbolInfo?.symbolDecimal })}
            </Text>
          </View>
          <Text className="text-content-4 text-paragraph-p3 text-right">
            <Trans>最低</Trans> {BNumber.toFormatNumber(symbolMarketInfo?.low, { volScale: symbolInfo?.symbolDecimal })}
          </Text>
        </View>
      </View>
    </Pressable>
  )
})

// ============ Main Search Page ============
const SearchPage = observer(function SearchPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('list')
  const { colorMarketRise, colorMarketFall, colorBrandSecondary1 } = useThemeColors()
  const { trade } = useStores()
  const activeTradeAccountId = useRootStore(userInfoActiveTradeAccountIdSelector)

  // 使用 ahooks 的 useDebounce 进行防抖处理
  const debouncedQuery = useDebounce(searchQuery, { wait: 300 })

  useEffect(() => {
    // 页面初始化时调用接口更新品种列表
    trade.getSymbolList()
    useRootStore.getState().market.symbol.fetchInfoList(activeTradeAccountId ?? '')
  }, [activeTradeAccountId])

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

  const { switchTradeActiveSymbol } = useTradeSwitchActiveSymbol()

  const handleSelect = useCallback(
    (symbol: string) => {
      switchTradeActiveSymbol(symbol)

      router.push(`/${symbol}`)
    },
    [router, switchTradeActiveSymbol],
  )

  return (
    <View className="bg-secondary flex-1">
      <SafeAreaView edges={['top']}>
        {/* Search Header */}
        <View className="px-xl mb-1.5 flex-row items-center gap-[10px] py-1.5">
          <View className="flex-1">
            <Input
              placeholder={<Trans>查询</Trans>}
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
})

export default SearchPage
