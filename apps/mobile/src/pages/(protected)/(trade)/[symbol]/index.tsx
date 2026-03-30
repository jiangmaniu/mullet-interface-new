import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useMemo } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Route } from 'react-native-tab-view'
import { useRouter } from 'expo-router'

import { TradingviewChart } from '@/components/tradingview'
import { IconifyActivity, IconifyCandlestickChart } from '@/components/ui/icons'
import { IconStar } from '@/components/ui/icons/set/star'
import { IconStarFill } from '@/components/ui/icons/set/star-fill'
import { ScreenHeader } from '@/components/ui/screen-header'
import { SwipeableTabs } from '@/components/ui/tabs'
import { Text } from '@/components/ui/text'
import { parseRiseAndFallInfo } from '@/helpers/market'
import { parseSymbolLotsVolScale } from '@/helpers/symbol'
import { useMarketQuoteInfoWithSub } from '@/hooks/market/use-market-quote'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { t } from '@/locales/i18n'
import { TradePositionDirectionEnum } from '@/options/trade/position'
import { LOTS_UNIT_LABEL } from '@/options/trade/unit'
import { useRootStore } from '@/stores'
import { useMarketSymbolInfo } from '@/stores/market-slice'
import { marketCurrentFavoriteSetSelector } from '@/stores/market-slice/favorite-slice'
import { tradeActiveTradeSymbolSelector } from '@/stores/trade-slice'
import { tradeSettingChartTvResolutionSelector } from '@/stores/trade-slice/settingSlice'
import { transferWeekDay } from '@/v1/constants'
import { formatTimeStr } from '@/v1/utils/business'
import { msg } from '@lingui/core/macro'
import { renderFallback } from '@mullet/utils/format'
import { BNumber } from '@mullet/utils/number'

import { SymbolSelector } from '../../(tabs)/trade/_comps/header'

// ============ SymbolDepthHeader Component ============
interface SymbolDepthHeaderProps {
  symbol?: string
  onSymbolPress?: () => void
}

const SymbolDepthHeader = observer(({ symbol, onSymbolPress }: SymbolDepthHeaderProps) => {
  const router = useRouter()
  const symbolInfo = useMarketSymbolInfo(symbol)

  const favoriteSet = useRootStore(marketCurrentFavoriteSetSelector)
  const isFavorite = favoriteSet.has(symbolInfo?.symbol ?? '')

  const handleFavoriteToggle = () => {
    useRootStore.getState().market.favorite.toggleFavorite(symbolInfo?.symbol ?? '')
  }

  const handleViewChange = (view: 'chart' | 'depth') => {
    if (view === 'chart') {
      // Navigate back to trade page
      router.replace('/(protected)/(tabs)/trade')
    }
    // Already on depth view, do nothing
  }

  return (
    <ScreenHeader
      showBackButton={false}
      left={<SymbolSelector symbol={symbol} />}
      right={
        <View className="gap-xl flex-row items-center">
          <View className={cn('border-brand-default flex-row overflow-hidden rounded-full border p-[3px]')}>
            <Pressable
              onPress={() => handleViewChange('chart')}
              className="h-[24px] w-[36px] items-center justify-center rounded-full"
            >
              <IconifyActivity width={22} height={22} className="text-content-4" />
            </Pressable>
            <View
              // onPress={() => handleViewChange('depth')}
              className="bg-button h-[24px] w-[36px] items-center justify-center rounded-full"
            >
              <IconifyCandlestickChart width={22} height={22} className="text-content-1" />
            </View>
          </View>

          <Pressable onPress={handleFavoriteToggle}>
            {isFavorite ? (
              <IconStarFill width={22} height={22} className="text-brand-primary" />
            ) : (
              <IconStar width={22} height={22} className="text-content-1" />
            )}
          </Pressable>
        </View>
      }
    />
  )
})

// ============ PriceInfo Component ============
interface PriceInfoProps {
  symbol?: string
}

const PriceInfo = observer(({ symbol }: PriceInfoProps) => {
  const symbolInfo = useMarketSymbolInfo(symbol)
  const symbolMarketInfo = useMarketQuoteInfoWithSub(symbol)
  const latestPrice = symbolMarketInfo?.userSellPrice
  const userSellPricePriceChangeInfo = parseRiseAndFallInfo(symbolMarketInfo?.userSellPriceDiff)
  const high = symbolMarketInfo?.high
  const low = symbolMarketInfo?.low
  const open = symbolMarketInfo?.open
  const close = symbolMarketInfo?.close
  const percentChangeInfo = parseRiseAndFallInfo(symbolMarketInfo?.percent)

  return (
    <View className="p-xl flex-row items-center justify-between">
      <View className="gap-xs flex-1">
        <Text className="text-paragraph-p3 text-content-1">
          <Trans>最新价格</Trans>
        </Text>
        <View>
          <Text
            className={`text-title-h3 ${userSellPricePriceChangeInfo.isRise ? 'text-market-rise' : userSellPricePriceChangeInfo.isFall ? 'text-market-fall' : 'text-content-1'}`}
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {BNumber.toFormatNumber(latestPrice, { volScale: symbolInfo?.symbolDecimal })}
          </Text>

          <View className={cn('gap-xs flex-row')}>
            {/* <Text className={`text-paragraph-p2 ${askPriceChangeInfo.isRise ? 'text-market-rise' : askPriceChangeInfo.isFall ? 'text-market-fall' : 'text-content-1'}`}>
              +1
            </Text> */}

            <Text
              className={`text-paragraph-p2 ${percentChangeInfo.isRise ? 'text-market-rise' : percentChangeInfo.isFall ? 'text-market-fall' : 'text-content-1'}`}
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {BNumber.toFormatPercent(symbolMarketInfo?.percent, { forceSign: true, isRaw: false })}
            </Text>
          </View>
        </View>
      </View>
      {/* shrink-0：右侧整体不因左侧内容变化而收缩，tabular-nums：等宽数字防止跳动 */}
      <View className="gap-xs shrink-0">
        <View className="gap-xl flex-row">
          <View className="items-end">
            <Text className="text-paragraph-p4 text-content-4">
              <Trans>最高</Trans>
            </Text>
            <Text className="text-paragraph-p4 text-content-1 text-right" style={{ fontVariant: ['tabular-nums'] }}>
              {BNumber.toFormatNumber(high, { volScale: symbolInfo?.symbolDecimal })}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-paragraph-p4 text-content-4">
              <Trans>最低</Trans>
            </Text>
            <Text className="text-paragraph-p4 text-content-1 text-right" style={{ fontVariant: ['tabular-nums'] }}>
              {BNumber.toFormatNumber(low, { volScale: symbolInfo?.symbolDecimal })}
            </Text>
          </View>
        </View>
        <View className="gap-xl flex-row">
          <View className="items-end">
            <Text className="text-paragraph-p4 text-content-4">
              <Trans>开盘价</Trans>
            </Text>
            <Text className="text-paragraph-p4 text-content-1 text-right" style={{ fontVariant: ['tabular-nums'] }}>
              {BNumber.toFormatNumber(open, { volScale: symbolInfo?.symbolDecimal })}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-paragraph-p4 text-content-4">
              <Trans>收盘价</Trans>
            </Text>
            <Text className="text-paragraph-p4 text-content-1 text-right" style={{ fontVariant: ['tabular-nums'] }}>
              {BNumber.toFormatNumber(close, { volScale: symbolInfo?.symbolDecimal })}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
})

// ============ ChartView Component ============
function ChartView({ symbol }: { symbol?: string }) {
  const tvResolution = useRootStore(tradeSettingChartTvResolutionSelector)

  return (
    // <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
    <View className="flex-1">
      <PriceInfo symbol={symbol} />
      <View className="flex-1">
        <TradingviewChart mode="detail" resolution={tvResolution} />
      </View>
    </View>
  )
}

// ============ DetailsView Component ============
function DetailsView({ symbol }: { symbol?: string }) {
  const symbolMarketInfo = useMarketQuoteInfoWithSub(symbol)
  const tradeTimeConf = symbolMarketInfo?.tradeTimeConf as any[]
  const symbolConf = symbolMarketInfo?.symbolConf
  const holdingCostConf = symbolMarketInfo?.holdingCostConf
  const transactionFeeConf = symbolMarketInfo?.transactionFeeConf
  const prepaymentConf = symbolMarketInfo?.prepaymentConf
  const marginMode = prepaymentConf?.mode // 保证金模式
  const lotsVolScale = parseSymbolLotsVolScale(symbolConf)
  const { renderLinguiMsg } = useI18n()
  const showPencent = holdingCostConf?.type !== 'pointMode' // 以

  const CONTRACT_PROPERTIES = [
    { label: <Trans>合约单位</Trans>, value: symbolConf?.contractSize },
    { label: <Trans>货币单位</Trans>, value: symbolConf?.baseCurrency },
    { label: <Trans>报价小数位</Trans>, value: symbolMarketInfo?.digits },
    {
      label: <Trans>单笔交易手数</Trans>,
      value: (
        <>
          {BNumber.toFormatNumber(symbolConf?.minTrade, { volScale: lotsVolScale })}
          {renderLinguiMsg(LOTS_UNIT_LABEL)}-{BNumber.toFormatNumber(symbolConf?.maxTrade, { volScale: lotsVolScale })}
          {renderLinguiMsg(LOTS_UNIT_LABEL)}
        </>
      ),
    },
    {
      label: <Trans>手数差值</Trans>,
      value: BNumber.toFormatNumber(symbolConf?.tradeStep, {
        volScale: lotsVolScale,
        unit: renderLinguiMsg(LOTS_UNIT_LABEL),
      }),
    },
    {
      label: <Trans>隔夜利息（多单）</Trans>,
      value: renderFallback(
        showPencent
          ? BNumber.toFormatPercent(holdingCostConf?.buyBag, { isRaw: false, positive: false })
          : BNumber.toFormatNumber(holdingCostConf?.buyBag, {
              positive: false,
              unit: `(${renderLinguiMsg(msg`点模式`)})`,
            }),
        {
          verify: holdingCostConf?.isEnable,
        },
      ),
    },
    {
      label: <Trans>隔夜利息（空单）</Trans>,
      value: renderFallback(
        showPencent
          ? BNumber.toFormatPercent(holdingCostConf?.sellBag, { isRaw: false, positive: false })
          : BNumber.toFormatNumber(holdingCostConf?.sellBag, {
              positive: false,
              unit: `(${renderLinguiMsg(msg`点模式`)})`,
            }),
        {
          verify: holdingCostConf?.isEnable,
        },
      ),
    },
    { label: <Trans>限价和停损距离</Trans>, value: symbolConf?.limitStopLevel },
    {
      label: <Trans>市价手续费</Trans>,
      value: BNumber.toFormatPercent(transactionFeeConf?.trade_vol?.[0]?.market_fee, { isRaw: false }),
    },
    {
      label: <Trans>限价手续费</Trans>,
      value: BNumber.toFormatPercent(transactionFeeConf?.trade_vol?.[0]?.limit_fee, { isRaw: false }),
    },
  ]

  return (
    <ScrollView className="px-xl py-3xl flex-1" showsVerticalScrollIndicator={false}>
      {/* Contract Properties */}
      <View className="gap-xl mb-3xl">
        <Text className="text-important-1 text-content-1">
          <Trans>合约属性</Trans>
        </Text>
        <View className="gap-medium">
          {CONTRACT_PROPERTIES.map((item, index) => (
            <View key={index} className="flex-row items-center justify-between">
              <Text className="text-paragraph-p3 text-content-4">{item.label}</Text>
              <Text className="text-paragraph-p3 text-content-1">{item.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Trading Hours */}
      {!!tradeTimeConf?.length && (
        <View className="gap-xl">
          <Text className="text-important-1 text-content-1">
            <Trans>交易时间（GMT+8）</Trans>
          </Text>
          <View className="gap-medium">
            {tradeTimeConf.map((item, index) => (
              <View key={index} className="flex-row items-start justify-between">
                <Text className="text-paragraph-p3 text-content-4">{transferWeekDay(item.weekDay)}</Text>
                <Text className="text-paragraph-p3 text-content-1">{formatTimeStr(item.trade)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  )
}

// ============ BottomActionBar Component ============
interface BottomActionBarProps {
  symbol?: string
  onBuy: () => void
  onSell: () => void
}

const BottomActionBar = observer(({ symbol, onBuy, onSell }: BottomActionBarProps) => {
  const symbolMarketInfo = useMarketQuoteInfoWithSub(symbol)
  const symbolInfo = useMarketSymbolInfo(symbol)
  const userSellPricePrice = symbolMarketInfo?.userSellPrice
  const userBuyPricePrice = symbolMarketInfo?.userBuyPrice
  const spread = symbolMarketInfo?.spread

  return (
    <SafeAreaView edges={['bottom']}>
      <View className="px-xl mb-xl py-medium">
        <View className="gap-medium relative flex-row items-center">
          <Pressable
            onPress={onBuy}
            className="px-xl rounded-small bg-market-rise h-[40px] flex-1 flex-row items-center justify-center"
          >
            <Text className="text-button-2 text-market-rise-foreground font-medium">
              {BNumber.toFormatNumber(userBuyPricePrice, { volScale: symbolInfo?.symbolDecimal })}
            </Text>
            <Text className="text-button-2 ml-xs text-market-rise-foreground">
              <Trans>买入/做多</Trans>
            </Text>
          </Pressable>

          {/* Spread Badge */}
          <View className="absolute top-1/2 left-1/2 z-10 h-5 max-w-20 min-w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xs bg-white p-[2px]">
            <Text className="text-paragraph-p3 text-market-content-foreground">{BNumber.toFormatNumber(spread)}</Text>
          </View>

          <Pressable
            onPress={onSell}
            className="px-xl rounded-small bg-market-fall h-[40px] flex-1 flex-row items-center justify-center"
          >
            <Text className="text-button-2 text-market-fall-foreground font-medium">
              {BNumber.toFormatNumber(userSellPricePrice, { volScale: symbolInfo?.symbolDecimal })}
            </Text>
            <Text className="text-button-2 ml-xs text-market-fall-foreground">
              <Trans>卖出/做空</Trans>
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
})

// ============ Main SymbolDepth Component ============
const SymbolDepth = observer(() => {
  const router = useRouter()
  // const { symbol } = useLocalSearchParams<{ symbol: string }>()
  const activeSymbol = useRootStore(tradeActiveTradeSymbolSelector)
  const symbol = activeSymbol
  const [currentIndex, setCurrentIndex] = React.useState(0)

  const routes = useMemo<Route[]>(
    () => [
      { key: 'chart', title: t`图表` },
      { key: 'details', title: t`详情` },
    ],
    [],
  )

  const renderScene = ({ route }: { route: Route }) => {
    switch (route.key) {
      case 'chart':
        return <ChartView symbol={symbol} />
      case 'details':
        return <DetailsView symbol={symbol} />
      default:
        return null
    }
  }

  const handleBuy = useCallback(() => {
    router.push(`/trade?direction=${TradePositionDirectionEnum.BUY}`)
  }, [router])

  const handleSell = useCallback(() => {
    router.push(`/trade?direction=${TradePositionDirectionEnum.SELL}`)
  }, [router])

  return (
    <View className="flex-1">
      <SymbolDepthHeader symbol={symbol} />

      <SwipeableTabs
        routes={routes}
        renderScene={renderScene}
        variant="underline"
        size="md"
        tabBarClassName="border-b border-brand-default px-xl"
        onIndexChange={setCurrentIndex}
        swipeEnabled={currentIndex !== 0}
      />

      <BottomActionBar symbol={symbol} onBuy={handleBuy} onSell={handleSell} />
    </View>
  )
})

export default SymbolDepth
