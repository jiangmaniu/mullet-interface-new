import React, { useState, useMemo, useCallback } from 'react'
import { ScrollView, Pressable, View } from 'react-native'
import type { Route } from 'react-native-tab-view'
import { Trans, useLingui } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'

import { Text } from '@/components/ui/text'
import { AvatarImage } from '@/components/ui/avatar'
import { IconifySearch, IconDepth, IconDepthTB } from '@/components/ui/icons'
import { SwipeableTabs, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/states/empty-state'
import { cn } from '@/lib/utils'
import { useStores } from '@/v1/provider/mobxProvider'
import { useGetCurrentQuoteCallback } from '@/v1/utils/wsUtil'
import { getImgSource } from '@/utils/img'
import { BNumber } from '@mullet/utils/number'
import { parseRiseAndFallInfo } from '@/helpers/market'
import { SYMBOL_CATEGORY_OPTIONS, SymbolCategory, SymbolCategoryOption } from '@/options/market/symbol'
import { CollapsibleFlatList, CollapsibleTab, CollapsibleTabScene } from '../ui/collapsible-tab'

// ============ Types ============
interface SymbolSelectDrawerProps {
  visible: boolean
  onClose: () => void
  selectedSymbol?: string
  onSelect: (symbolInfo: Account.TradeSymbolListItem) => void
}

// ============ SymbolInfoCell ============
const SymbolInfoCell = observer(({ symbolInfo }: { symbolInfo: Account.TradeSymbolListItem }) => (
  <View className="flex-row items-center gap-medium flex-1">
    <AvatarImage source={getImgSource(symbolInfo.imgUrl)} className="size-6 flex-shrink-0 rounded-full" />
    <View>
      <Text className="text-paragraph-p2 text-content-1">{symbolInfo.symbol}</Text>
      <Text className="text-paragraph-p3 text-content-4">{symbolInfo.alias}</Text>
    </View>
  </View>
))
// ============ Main Drawer ============
export const SymbolSelectDrawer = observer(({
  visible,
  onClose,
  selectedSymbol,
  onSelect,
}: SymbolSelectDrawerProps) => {
  const { i18n } = useLingui()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSelect = useCallback((symbolInfo: Account.TradeSymbolListItem) => {
    onSelect(symbolInfo)
    onClose()
  }, [onSelect, onClose])


  const initialTab = SYMBOL_CATEGORY_OPTIONS.find(item => item.value === SymbolCategory.All)

  return (
    <Drawer open={visible} onOpenChange={onClose}>
      <DrawerContent className="px-0 gap-0 py-3 h-full">
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
          <CollapsibleTab
            variant="underline"
            size="md"
            initialTabName={initialTab?.value}
            renderTabBarBottom={() => (<AssetTradeHeader />)}
          >
            {SYMBOL_CATEGORY_OPTIONS.map((categoryOption) => {
              const label = i18n._(categoryOption.label)
              return (
                <CollapsibleTabScene key={categoryOption.value} name={categoryOption.value} label={label}>
                  <CategoryTabListContent searchQuery={searchQuery} categoryOption={categoryOption} onSelect={handleSelect} />
                </CollapsibleTabScene>
              )
            })}
          </CollapsibleTab>
        </View>
      </DrawerContent>
    </Drawer>
  )
})

function AssetTradeHeader() {
  return (
    <View className="flex-row items-center justify-between py-medium px-xl mt-xl">
      <Text className="text-paragraph-p3 text-content-5 flex-1"><Trans>品类</Trans></Text>
      <View className='flex-row gap-xl flex-shrink-0'>
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
  const symbolMarketInfo = getCurrentQuote(symbolInfo.symbol)
  const askPriceChangeInfo = parseRiseAndFallInfo(symbolMarketInfo.askDiff)
  const percentChangeInfo = parseRiseAndFallInfo(symbolMarketInfo.percent)

  return (
    <View className="flex-row items-center p-xl gap-xl">
      <SymbolInfoCell symbolInfo={symbolInfo} />

      <View className='flex-row flex-shrink-0 gap-xl w-[192px]'>
        <View className="flex-1 h-8 items-start justify-center overflow-hidden">
          <Text className={cn("text-paragraph-p1", askPriceChangeInfo.isRise ? 'text-market-rise' : askPriceChangeInfo.isFall ? 'text-market-fall' : 'text-content-1')}>{BNumber.toFormatNumber(symbolMarketInfo.ask, { volScale: symbolInfo?.symbolDecimal })}</Text>
        </View>
        <View className="max-w-[60px] items-end">
          <Text className={cn('text-paragraph-p2', percentChangeInfo.isRise ? 'text-market-rise' : percentChangeInfo.isFall ? 'text-market-fall' : 'text-content-1')}>
            {BNumber.toFormatPercent(symbolMarketInfo?.percent, { forceSign: true, isRaw: false })}
          </Text>
        </View>
      </View>
    </View>
  )
})


const CategoryTabListContent = observer(({ searchQuery, categoryOption, onSelect }: { searchQuery: string, categoryOption: SymbolCategoryOption, onSelect: (symbolInfo: Account.TradeSymbolListItem) => void }) => {
  const { trade } = useStores()
  let tradeList = trade.favoriteList

  if (categoryOption.value !== SymbolCategory.Favorite) {
    tradeList = categoryOption.value === SymbolCategory.All ?
      trade.symbolListAll :
      trade.symbolListAll.filter((item) => item.classify === categoryOption.value)
  }

  if (searchQuery) {
    tradeList = tradeList.filter(trade => trade.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || trade.alias?.toLowerCase().includes(searchQuery.toLowerCase()))
  }

  return (
    <CollapsibleFlatList
      data={tradeList}
      keyExtractor={(item) => item.symbol}
      renderItem={({ item }: { item: Account.TradeSymbolListItem }) => {
        return <MarketRow onSelect={onSelect} symbolInfo={item} />
      }}
      ListEmptyComponent={<View className='py-[96px]'>
        <EmptyState message={<Trans>暂无数据</Trans>} />
      </View>}
    />
  )
})

const MarketRow = observer(({ onSelect, symbolInfo }: { onSelect: (symbolInfo: Account.TradeSymbolListItem) => void, symbolInfo: Account.TradeSymbolListItem }) => {

  const handlePress = () => {
    onSelect(symbolInfo)
  }

  return (
    <Pressable onPress={handlePress} >
      <SymbolMarketRow symbolInfo={symbolInfo} />
    </Pressable>
  )
})
