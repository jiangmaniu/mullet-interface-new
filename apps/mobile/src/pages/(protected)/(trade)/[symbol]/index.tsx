import { useCallback, useMemo } from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import { Route } from 'react-native-tab-view'
import { useRouter } from 'expo-router'

import { Text } from '@/components/ui/text'
import { AvatarImage } from '@/components/ui/avatar'
import { SwipeableTabs } from '@/components/ui/tabs'
import {
  IconifyActivity,
  IconifyCandlestickChart,
  IconifyNavArrowDownSolid,
} from '@/components/ui/icons'
import { ScreenHeader } from '@/components/ui/screen-header'
import { cn } from '@/lib/utils'
import { IconStarFill } from '@/components/ui/icons/set/star-fill'
import { IconStar } from '@/components/ui/icons/set/star'
import { Trans, useLingui } from '@lingui/react/macro'
import { t } from '@/locales/i18n'
import { TradingviewChart, TradingviewChart as TradingviewChartMock } from './_comps/tradingview'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useStores } from '@/v1/provider/mobxProvider'
import { observer } from 'mobx-react-lite'
import { useGetCurrentQuoteCallback } from '@/v1/utils/wsUtil'
import { getImgSource } from '@/utils/img'
import { BNumber } from '@mullet/utils/number'
import { parseRiseAndFallInfo } from '@/helpers/market'
import { LOTS_UNIT_LABEL } from '@/options/trade/unit'
import { renderFallback } from '@mullet/utils/format'
import { transferWeekDay } from '@/v1/constants'
import { formatTimeStr } from '@/v1/utils/business'

// ============ SymbolDepthHeader Component ============
interface SymbolDepthHeaderProps {
  symbol: string
  onSymbolPress?: () => void
}

const SymbolDepthHeader = observer(({
  symbol,
  onSymbolPress,
}: SymbolDepthHeaderProps) => {
  const router = useRouter()
  const { trade } = useStores()
  const getCurrentQuote = useGetCurrentQuoteCallback()
  const symbolMarketInfo = getCurrentQuote(symbol)
  const symbolInfo = trade.getActiveSymbolInfo(symbol)
  const percentChangeInfo = parseRiseAndFallInfo(symbolMarketInfo.percent)
  // const synopsis = getAccountSynopsisByLng(trade.currentAccountInfo.synopsis) 

  const isFavorite = trade.favoriteList.some((item) => item.symbol === symbolInfo.symbol)


  const handleFavoriteToggle = () => {
    trade.toggleSymbolFavorite(symbolInfo.symbol)
  }

  const handleViewChange = (view: 'chart' | 'depth') => {
    if (view === 'chart') {
      // Navigate back to trade page
      router.back()
    }
    // Already on depth view, do nothing
  }

  return (
    <ScreenHeader
      showBackButton={false}
      left={
        <View className="flex-row items-center gap-medium">
          <Pressable
            onPress={onSymbolPress}
            className="flex-row items-center gap-medium"
          >
            <AvatarImage source={getImgSource(symbolInfo.imgUrl)} className="size-[30px] flex-shrink-0 rounded-full" />
            <Text className="text-paragraph-p1 text-content-1 font-medium">{symbolInfo.symbol}</Text>
            <Text className={percentChangeInfo.isRise ? 'text-market-rise' : percentChangeInfo.isFall ? 'text-market-fall' : 'text-content-1'}>
              {BNumber.toFormatPercent(symbolMarketInfo?.percent, { forceSign: true, isRaw: false })}
            </Text>

            <IconifyNavArrowDownSolid width={16} height={16} className='text-content-1' />
          </Pressable>
        </View>
      }
      right={
        <View className="flex-row items-center gap-xl">
          <View className={cn('flex-row rounded-full border border-brand-default overflow-hidden p-[3px]')}>
            <Pressable
              onPress={() => handleViewChange('chart')}
              className="w-[36px] h-[24px] rounded-full justify-center items-center"
            >
              <IconifyActivity width={22} height={22} className="text-content-4" />
            </Pressable>
            <Pressable
              onPress={() => handleViewChange('depth')}
              className="w-[36px] h-[24px] rounded-full justify-center items-center bg-button"
            >
              <IconifyCandlestickChart
                width={22}
                height={22}
                className="text-content-1"
              />
            </Pressable>
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
  symbol: string
}

const PriceInfo = observer(({
  symbol,

}: PriceInfoProps) => {
  const getCurrentQuote = useGetCurrentQuoteCallback()
  const { trade } = useStores()
  const symbolInfo = trade.getActiveSymbolInfo(symbol)
  const symbolMarketInfo = getCurrentQuote(symbol)
  const latestPrice = symbolMarketInfo?.ask
  const high = symbolMarketInfo?.high
  const low = symbolMarketInfo?.low
  const open = symbolMarketInfo?.open
  const close = symbolMarketInfo?.close
  const askPriceChangeInfo = parseRiseAndFallInfo(symbolMarketInfo?.askDiff)
  const percentChangeInfo = parseRiseAndFallInfo(symbolMarketInfo.percent)

  return (
    <View className="flex-row items-center justify-between p-xl">
      <View className="gap-xs">
        <Text className="text-paragraph-p3 text-content-1">
          <Trans>最新价格</Trans>
        </Text>
        <View>
          <Text className={`text-title-h3 ${askPriceChangeInfo.isRise ? 'text-market-rise' : askPriceChangeInfo.isFall ? 'text-market-fall' : 'text-content-1'}`}>
            {latestPrice}
          </Text>

          <View className={cn('flex-row gap-xs')}>
            {/* <Text className={`text-paragraph-p2 ${askPriceChangeInfo.isRise ? 'text-market-rise' : askPriceChangeInfo.isFall ? 'text-market-fall' : 'text-content-1'}`}>
              +1
            </Text> */}

            <Text className={`text-paragraph-p2 ${percentChangeInfo.isRise ? 'text-market-rise' : percentChangeInfo.isFall ? 'text-market-fall' : 'text-content-1'}`}>
              {BNumber.toFormatPercent(symbolMarketInfo?.percent, { forceSign: true, isRaw: false })}
            </Text>
          </View>

        </View>
      </View>
      <View className="gap-xs">
        <View className="flex-row gap-xl">
          <View className="items-end">
            <Text className="text-paragraph-p4 text-content-4">
              <Trans>最高</Trans>
            </Text>
            <Text className="text-paragraph-p4 text-content-1">{BNumber.toFormatNumber(high, { volScale: symbolInfo.symbolDecimal })}</Text>
          </View>
          <View className="items-end">
            <Text className="text-paragraph-p4 text-content-4">
              <Trans>最低</Trans>
            </Text>
            <Text className="text-paragraph-p4 text-content-1">{BNumber.toFormatNumber(low, { volScale: symbolInfo.symbolDecimal })}</Text>
          </View>
        </View>
        <View className="flex-row gap-xl">
          <View className="items-end">
            <Text className="text-paragraph-p4 text-content-4">
              <Trans>开盘价</Trans>
            </Text>
            <Text className="text-paragraph-p4 text-content-1">{BNumber.toFormatNumber(open, { volScale: symbolInfo.symbolDecimal })}</Text>
          </View>
          <View className="items-end">
            <Text className="text-paragraph-p4 text-content-4">
              <Trans>收盘价</Trans>
            </Text>
            <Text className="text-paragraph-p4 text-content-1">{BNumber.toFormatNumber(close, { volScale: symbolInfo.symbolDecimal })}</Text>
          </View>
        </View>
      </View>
    </View>
  )
})

// ============ ChartView Component ============
// DEV 模式下使用 mock 版本调试主题和数据源
const KLineChart = __DEV__ ? TradingviewChartMock : TradingviewChart

function ChartView({ symbol }: { symbol: string }) {
  return (
    // <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
    <View className="flex-1">
      {/* Price Info */}
      <PriceInfo symbol={symbol} />

      {/* K线图（内置时间周期选择器） */}
      <View className="flex-1">
        <KLineChart />
      </View>
    </View>
    // </ScrollView>
  )
}

// ============ DetailsView Component ============
function DetailsView({ symbol }: { symbol: string }) {

  const { i18n, t } = useLingui()
  const getCurrentQuote = useGetCurrentQuoteCallback()
  const symbolMarketInfo = getCurrentQuote(symbol)
  const tradeTimeConf = symbolMarketInfo?.tradeTimeConf as any[]
  const symbolConf = symbolMarketInfo?.symbolConf
  const holdingCostConf = symbolMarketInfo?.holdingCostConf
  const transactionFeeConf = symbolMarketInfo?.transactionFeeConf
  const prepaymentConf = symbolMarketInfo?.prepaymentConf
  const marginMode = prepaymentConf?.mode // 保证金模式
  const showPencent = holdingCostConf?.type !== 'pointMode' // 以


  const CONTRACT_PROPERTIES = [
    { label: <Trans>合约单位</Trans>, value: symbolConf?.contractSize },
    { label: <Trans>货币单位</Trans>, value: symbolConf?.baseCurrency },
    { label: <Trans>报价小数位</Trans>, value: symbolMarketInfo?.digits },
    {
      label: <Trans>单笔交易手数</Trans>, value: <>
        {BNumber.toFormatNumber(symbolConf?.minTrade, { volScale: 2 })}
        {i18n._(LOTS_UNIT_LABEL)}-{BNumber.toFormatNumber(symbolConf?.maxTrade, { volScale: 2 })}
        {i18n._(LOTS_UNIT_LABEL)}
      </>
    },
    { label: <Trans>手数差值</Trans>, value: BNumber.toFormatNumber(symbolConf?.tradeStep, { volScale: 2, unit: i18n._(LOTS_UNIT_LABEL) }) },
    {
      label: <Trans>隔夜利息（多单）</Trans>, value: renderFallback(
        showPencent
          ? BNumber.toFormatPercent(holdingCostConf?.buyBag, { isRaw: false, positive: false })
          : BNumber.toFormatNumber(holdingCostConf?.buyBag, {
            positive: false,
            unit: `(${t`点模式`})`
          }),
        {
          verify: holdingCostConf?.isEnable
        }
      )
    },
    {
      label: <Trans>隔夜利息（空单）</Trans>, value: renderFallback(
        showPencent
          ? BNumber.toFormatPercent(holdingCostConf?.sellBag, { isRaw: false, positive: false })
          : BNumber.toFormatNumber(holdingCostConf?.sellBag, {
            positive: false,
            unit: `(${t`点模式`})`
          }),
        {
          verify: holdingCostConf?.isEnable
        }
      )
    },
    { label: <Trans>限价和停损距离</Trans>, value: symbolConf?.limitStopLevel },
    { label: <Trans>市价手续费</Trans>, value: BNumber.toFormatPercent(transactionFeeConf?.trade_vol?.[0]?.market_fee, { isRaw: false }) },
    { label: <Trans>限价手续费</Trans>, value: BNumber.toFormatPercent(transactionFeeConf?.trade_vol?.[0]?.limit_fee, { isRaw: false }) },
  ]

  return (
    <ScrollView className="flex-1 px-xl py-3xl" showsVerticalScrollIndicator={false}>
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
      {
        !!tradeTimeConf?.length && (
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
        )
      }

    </ScrollView>
  )
}

// ============ BottomActionBar Component ============
interface BottomActionBarProps {
  symbol: string
  onBuy: () => void
  onSell: () => void
}

const BottomActionBar = observer(({ symbol, onBuy, onSell }: BottomActionBarProps) => {
  const { trade } = useStores()
  const getCurrentQuote = useGetCurrentQuoteCallback()
  const symbolMarketInfo = getCurrentQuote(symbol)
  const symbolInfo = trade.getActiveSymbolInfo(symbol)
  const buyPrice = symbolMarketInfo?.bid
  const sellPrice = symbolMarketInfo?.ask
  const spread = symbolMarketInfo?.spread

  return (
    <SafeAreaView edges={['bottom']}>
      <View className="px-xl mb-xl py-medium">
        <View className='flex-row gap-medium items-center relative'>
          <Pressable
            onPress={onBuy}
            className="flex-1 h-[40px] px-xl rounded-small flex-row items-center justify-center bg-market-rise"
          >
            <Text className="text-button-2 font-medium text-market-rise-foreground">{BNumber.toFormatNumber(buyPrice, { volScale: symbolInfo.symbolDecimal })}</Text>
            <Text className="text-button-2 ml-xs text-market-rise-foreground">
              <Trans>买入/做多</Trans>
            </Text>
          </Pressable>

          {/* Spread Badge */}
          <View className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xs p-[2px] z-10 items-center justify-center size-[20px]">
            <Text className="text-paragraph-p3 text-market-content-foreground">{BNumber.toFormatNumber(spread)}</Text>
          </View>

          <Pressable
            onPress={onSell}
            className="flex-1 h-[40px] px-xl rounded-small flex-row items-center justify-center bg-market-fall"
          >
            <Text className="text-button-2 font-medium text-market-fall-foreground">{BNumber.toFormatNumber(sellPrice, { volScale: symbolInfo.symbolDecimal })}</Text>
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
  const { trade } = useStores()
  const symbol = trade.activeSymbolName

  const routes = useMemo<Route[]>(
    () => [
      { key: 'chart', title: t`图表` },
      { key: 'details', title: t`详情` },
    ],
    []
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
    router.push('/trade?side=buy')
  }, [router])

  const handleSell = useCallback(() => {
    router.push('/trade?side=sell')
  }, [router])

  return (
    <View className="flex-1">
      <SymbolDepthHeader
        symbol={symbol}
      />

      <SwipeableTabs
        routes={routes}
        renderScene={renderScene}
        variant="underline"
        size="md"
        tabBarClassName="border-b border-brand-default px-xl"
      />

      <BottomActionBar
        symbol={symbol}
        onBuy={handleBuy}
        onSell={handleSell}
      />
    </View>
  )
})

export default SymbolDepth
