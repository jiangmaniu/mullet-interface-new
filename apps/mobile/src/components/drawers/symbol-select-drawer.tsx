import { Trans, useLingui } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useMemo, useState } from 'react'
import { FlatList, Pressable, View } from 'react-native'
import { useShallow } from 'zustand/react/shallow'
import type { Route } from 'react-native-tab-view'

import { EmptyState } from '@/components/states/empty-state'
import { AvatarImage } from '@/components/ui/avatar'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { IconifySearch } from '@/components/ui/icons'
import { Input } from '@/components/ui/input'
import { SwipeableTabs } from '@/components/ui/tabs'
import { Text } from '@/components/ui/text'
import { parseRiseAndFallInfo } from '@/helpers/market'
import { cn } from '@/lib/utils'
import { SYMBOL_CATEGORY_OPTIONS, SymbolCategory, SymbolCategoryOption } from '@/options/market/symbol'
import { useRootStore } from '@/stores'
import { marketSymbolInfoListSelector } from '@/stores/market-slice'
import { marketCurrentFavoriteSymbolInfoListSelector } from '@/stores/market-slice/favorite-slice'
import { getImgSource } from '@/utils/img'
import { Account } from '@/v1/services/tradeCore/account/typings'
import { useGetCurrentQuoteCallback } from '@/v1/utils/wsUtil'
import { BNumber } from '@mullet/utils/number'

// ============ Types ============
interface SymbolSelectDrawerProps {
  visible: boolean
  onClose: () => void
  selectedSymbol?: string
  onSelect: (symbolInfo: Account.TradeSymbolListItem) => void
}

// ============ SymbolInfoCell ============
const SymbolInfoCell = observer(({ symbolInfo }: { symbolInfo: Account.TradeSymbolListItem }) => (
  <View className="gap-medium flex-1 flex-row items-center">
    <AvatarImage source={getImgSource(symbolInfo?.imgUrl)} className="size-6 flex-shrink-0 rounded-full" />
    <View>
      <Text className="text-paragraph-p2 text-content-1">{symbolInfo?.symbol}</Text>
      <Text className="text-paragraph-p3 text-content-4">{symbolInfo?.alias}</Text>
    </View>
  </View>
))
// ============ Main Drawer ============
export const SymbolSelectDrawer = observer(
  ({ visible, onClose, selectedSymbol, onSelect }: SymbolSelectDrawerProps) => {
    const { i18n } = useLingui()
    const [searchQuery, setSearchQuery] = useState('')

    const handleOpenChange = useCallback(
      (open: boolean) => {
        if (!open) {
          setSearchQuery('')
          onClose()
        }
      },
      [onClose],
    )

    const handleSelect = useCallback(
      (symbolInfo: Account.TradeSymbolListItem) => {
        onSelect(symbolInfo)
        onClose()
      },
      [onSelect, onClose],
    )

    const routes = useMemo<Route[]>(
      () =>
        SYMBOL_CATEGORY_OPTIONS.map((opt) => ({
          key: opt.value,
          title: i18n._(opt.label),
        })),
      [i18n],
    )

    const initialIndex = useMemo(
      () => SYMBOL_CATEGORY_OPTIONS.findIndex((item) => item.value === SymbolCategory.All) ?? 0,
      [],
    )

    const renderScene = useCallback(
      ({ route }: { route: Route }) => {
        const categoryOption = SYMBOL_CATEGORY_OPTIONS.find((opt) => opt.value === route.key)
        if (!categoryOption) return null
        return (
          <CategoryTabListContent searchQuery={searchQuery} categoryOption={categoryOption} onSelect={handleSelect} />
        )
      },
      [searchQuery, handleSelect],
    )

    return (
      <Drawer open={visible} onOpenChange={handleOpenChange}>
        <DrawerContent className="h-full gap-0 px-0 py-3">
          {/* 搜索框 */}
          <View className="px-xl pb-medium">
            <Input
              LeftContent={<IconifySearch width={20} height={20} />}
              value={searchQuery}
              size="sm"
              onValueChange={setSearchQuery}
              hideLabel
              placeholder={i18n._('搜索')}
            />
          </View>

          {/* SwipeableTabs */}
          <View className="flex-1">
            <SwipeableTabs
              routes={routes}
              renderScene={renderScene}
              variant="underline"
              size="md"
              initialIndex={initialIndex}
              tabBarClassName="px-xl border-b border-brand-default"
              renderTabBarBottom={() => <AssetTradeHeader />}
            />
          </View>
        </DrawerContent>
      </Drawer>
    )
  },
)

function AssetTradeHeader() {
  return (
    <View className="py-medium px-xl mt-xl flex-row items-center justify-between">
      <Text className="text-paragraph-p3 text-content-5 flex-1">
        <Trans>品类</Trans>
      </Text>
      <View className="gap-xl flex-shrink-0 flex-row">
        <Text className="text-paragraph-p3 text-content-5 w-[90px]">
          <Trans>价格</Trans>
        </Text>
        <Text className="text-paragraph-p3 text-content-5 w-[90px] text-right">
          <Trans>涨跌幅</Trans>
        </Text>
      </View>
    </View>
  )
}

interface SymbolMarketRowProps {
  symbolInfo: Account.TradeSymbolListItem
}

const SymbolMarketRow = observer(({ symbolInfo }: SymbolMarketRowProps) => {
  const getCurrentQuote = useGetCurrentQuoteCallback()
  const symbolMarketInfo = getCurrentQuote(symbolInfo?.symbol)
  const askPriceChangeInfo = parseRiseAndFallInfo(symbolMarketInfo?.askDiff)
  const percentChangeInfo = parseRiseAndFallInfo(symbolMarketInfo?.percent)

  return (
    <View className="p-xl gap-xl flex-row items-center">
      <SymbolInfoCell symbolInfo={symbolInfo} />

      <View className="gap-xl w-[192px] flex-shrink-0 flex-row">
        <View className="h-8 flex-1 items-start justify-center overflow-hidden">
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
            {BNumber.toFormatNumber(symbolMarketInfo?.ask, { volScale: symbolInfo?.symbolDecimal })}
          </Text>
        </View>
        <View className="items-end">
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

const CategoryTabListContent = observer(
  ({
    searchQuery,
    categoryOption,
    onSelect,
  }: {
    searchQuery: string
    categoryOption: SymbolCategoryOption
    onSelect: (symbolInfo: Account.TradeSymbolListItem) => void
  }) => {
    const symbolListAll = useRootStore(useShallow(marketSymbolInfoListSelector))
    const favoriteSymbolInfoList = useRootStore(marketCurrentFavoriteSymbolInfoListSelector)
    let tradeList: Account.TradeSymbolListItem[] = favoriteSymbolInfoList

    if (categoryOption.value !== SymbolCategory.Favorite) {
      tradeList =
        categoryOption.value === SymbolCategory.All
          ? symbolListAll
          : symbolListAll?.filter((item) => item.classify === categoryOption.value)
    }

    if (searchQuery) {
      tradeList = tradeList.filter(
        (trade) =>
          trade.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trade.alias?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    return (
      <FlatList
        data={tradeList}
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }: { item: Account.TradeSymbolListItem }) => (
          <MarketRow onSelect={onSelect} symbolInfo={item} />
        )}
        ListEmptyComponent={
          <View className="py-[96px]">
            <EmptyState message={<Trans>暂无数据</Trans>} />
          </View>
        }
      />
    )
  },
)

const MarketRow = observer(
  ({
    onSelect,
    symbolInfo,
  }: {
    onSelect: (symbolInfo: Account.TradeSymbolListItem) => void
    symbolInfo: Account.TradeSymbolListItem
  }) => {
    const handlePress = () => {
      onSelect(symbolInfo)
    }

    return (
      <Pressable onPress={handlePress}>
        <SymbolMarketRow symbolInfo={symbolInfo} />
      </Pressable>
    )
  },
)
