import { useState, useCallback, useMemo } from 'react'
import { View, ScrollView, TouchableOpacity } from 'react-native'
import { Route } from 'react-native-tab-view'
import { useRouter, useLocalSearchParams } from 'expo-router'

import { Text } from '@/components/ui/text'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, SwipeableTabs } from '@/components/ui/tabs'
import {
  IconifyActivity,
  IconifyCandlestickChart,
  IconifyNavArrowDownSolid,
} from '@/components/ui/icons'
import { ScreenHeader } from '@/components/ui/screen-header'
import { cn } from '@/lib/utils'
import { IconStarFill } from '@/components/ui/icons/set/star-fill'
import { IconStar } from '@/components/ui/icons/set/star'
import { Trans } from '@lingui/react/macro'
import { t } from '@/locales/i18n'
import { TimePeriodDrawer } from './_comps/time-period-drawer'

// ============ SymbolDepthHeader Component ============
interface SymbolDepthHeaderProps {
  symbol: string
  priceChange: string
  isPriceUp: boolean
  onSymbolPress?: () => void
  isFavorite: boolean
  onFavoriteToggle?: () => void
}

function SymbolDepthHeader({
  symbol,
  priceChange,
  isPriceUp,
  onSymbolPress,
  isFavorite,
  onFavoriteToggle,
}: SymbolDepthHeaderProps) {
  const router = useRouter()

  const handleViewChange = useCallback((view: 'chart' | 'depth') => {
    if (view === 'chart') {
      // Navigate back to trade page
      router.back()
    }
    // Already on depth view, do nothing
  }, [router])

  return (
    <ScreenHeader
      showBackButton={false}
      left={
        <View className="flex-row items-center gap-medium">
          <TouchableOpacity
            onPress={onSymbolPress}
            className="flex-row items-center gap-medium"
          >
            <Avatar className="size-[30px]">
              <AvatarFallback className="bg-[#9945FF]">
                <Text className="text-white text-xs">S</Text>
              </AvatarFallback>
            </Avatar>
            <Text className="text-paragraph-p1 text-content-1 font-medium">{symbol}</Text>
            <Text className={isPriceUp ? 'text-market-rise' : 'text-market-fall'}>
              {priceChange}
            </Text>
            <IconifyNavArrowDownSolid width={16} height={16} className='text-content-1' />
          </TouchableOpacity>
        </View>
      }
      right={
        <View className="flex-row items-center gap-xl">
          <View className={cn('flex-row rounded-full border border-brand-default overflow-hidden p-[3px]')}>
            <TouchableOpacity
              onPress={() => handleViewChange('chart')}
              className="w-[36px] h-[24px] rounded-full justify-center items-center"
            >
              <IconifyActivity width={22} height={22} className="text-content-4" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleViewChange('depth')}
              className="w-[36px] h-[24px] rounded-full justify-center items-center bg-button"
            >
              <IconifyCandlestickChart
                width={22}
                height={22}
                className="text-content-1"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onFavoriteToggle}>
            {isFavorite ? (
              <IconStarFill width={22} height={22} className="text-brand-primary" />
            ) : (
              <IconStar width={22} height={22} className="text-content-1" />
            )}
          </TouchableOpacity>
        </View>
      }
    />
  )
}

// ============ Constants ============
const TIME_PERIODS = [
  { label: '15分', value: '15' },
  { label: '1小时', value: '60' },
  { label: '4小时', value: '240' },
  { label: '天', value: 'D' },
  { label: '周', value: 'W' },
  { label: '月', value: 'M' },
  { label: '年', value: 'Y' },
]

// Mock contract properties data
const CONTRACT_PROPERTIES = [
  { label: '合约单位', value: '10000' },
  { label: '货币单位', value: 'EUR' },
  { label: '报价小数位', value: '5' },
  { label: '单笔交易手数', value: '0.01手-20.00手' },
  { label: '手数差值', value: '0.01手' },
  { label: '隔夜利息（多单）', value: '-1.37%' },
  { label: '隔夜利息（空单）', value: '-1.47%' },
  { label: '限价和停损距离', value: '1' },
  { label: '手续费', value: '1.02%' },
]

// Mock trading hours data
const TRADING_HOURS = [
  { day: '周一', hours: '07:00-24:00' },
  { day: '周二', hours: '07:00-24:00' },
  { day: '周三', hours: '07:00-24:00' },
  { day: '周四', hours: '00:00-05:55,07:00-24:00' },
  { day: '周五', hours: '07:00-24:00' },
  { day: '周六', hours: '07:00-24:00' },
  { day: '周日', hours: '07:00-24:00' },
]

// ============ PriceInfo Component ============
interface PriceInfoProps {
  latestPrice: string
  priceChange: string
  priceChangePercent: string
  isUp: boolean
  high: string
  low: string
  open: string
  close: string
}

function PriceInfo({
  latestPrice,
  priceChange,
  priceChangePercent,
  isUp,
  high,
  low,
  open,
  close,
}: PriceInfoProps) {
  return (
    <View className="flex-row items-center justify-between p-xl">
      <View className="gap-xs">
        <Text className="text-paragraph-p3 text-content-1">
          <Trans>最新价格</Trans>
        </Text>
        <View className={isUp ? 'text-market-rise' : 'text-market-fall'}>
          <Text className={`text-title-h3 ${isUp ? 'text-market-rise' : 'text-market-fall'}`}>
            {latestPrice}
          </Text>
          <Text className={`text-paragraph-p2 ${isUp ? 'text-market-rise' : 'text-market-fall'}`}>
            {priceChange} {priceChangePercent}
          </Text>
        </View>
      </View>
      <View className="gap-xs">
        <View className="flex-row gap-xl">
          <View className="items-end">
            <Text className="text-paragraph-p4 text-content-4">
              <Trans>最高</Trans>
            </Text>
            <Text className="text-paragraph-p4 text-content-1">{high}</Text>
          </View>
          <View className="items-end">
            <Text className="text-paragraph-p4 text-content-4">
              <Trans>最低</Trans>
            </Text>
            <Text className="text-paragraph-p4 text-content-1">{low}</Text>
          </View>
        </View>
        <View className="flex-row gap-xl">
          <View className="items-end">
            <Text className="text-paragraph-p4 text-content-4">
              <Trans>开盘价</Trans>
            </Text>
            <Text className="text-paragraph-p4 text-content-1">{open}</Text>
          </View>
          <View className="items-end">
            <Text className="text-paragraph-p4 text-content-4">
              <Trans>收盘价</Trans>
            </Text>
            <Text className="text-paragraph-p4 text-content-1">{close}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

// ============ ChartView Component ============
function ChartView() {
  const [selectedPeriod, setSelectedPeriod] = useState('15')
  const [showMoreDrawer, setShowMoreDrawer] = useState(false)

  const handleSelectPeriod = useCallback((value: string) => {
    setSelectedPeriod(value)
    setShowMoreDrawer(false)
  }, [])

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Price Info */}
      <PriceInfo
        latestPrice="185.00"
        priceChange="+232.00"
        priceChangePercent="+3.64%"
        isUp={true}
        high="148.75"
        low="148.75"
        open="148.75"
        close="148.75"
      />

      {/* Time Period Selector */}
      <View className="flex-row items-center h-[40px] px-medium">
        <View className="flex-row items-center">
          <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <TabsList variant="text" size="sm" className="gap-2xl">
              {TIME_PERIODS.map((period) => (
                <TabsTrigger key={period.value} value={period.value} className="flex-row">
                  <Text>{period.label}</Text>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <TabsTrigger value="more" className="flex-row" onPress={() => setShowMoreDrawer(true)}>
            <Text><Trans>更多</Trans></Text>
            <IconifyNavArrowDownSolid width={12} height={12} className="text-content-4" />
          </TabsTrigger>
        </View>
      </View>

      {/* Chart Placeholder */}
      <View className="h-[530px] bg-brand-primary">
        {/* TODO: K-line chart will be implemented here */}
      </View>

      {/* More Time Periods Drawer */}
      <TimePeriodDrawer
        open={showMoreDrawer}
        onOpenChange={setShowMoreDrawer}
        selectedPeriod={selectedPeriod}
        onSelectPeriod={handleSelectPeriod}
      />
    </ScrollView>
  )
}

// ============ DetailsView Component ============
function DetailsView() {
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
      <View className="gap-xl">
        <Text className="text-important-1 text-content-1">
          <Trans>交易时间（GMT+8）</Trans>
        </Text>
        <View className="gap-medium">
          {TRADING_HOURS.map((item, index) => (
            <View key={index} className="flex-row items-start justify-between">
              <Text className="text-paragraph-p3 text-content-4">{item.day}</Text>
              <Text className="text-paragraph-p3 text-content-1">{item.hours}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

// ============ BottomActionBar Component ============
interface BottomActionBarProps {
  buyPrice: string
  sellPrice: string
  spread: number
  onBuy: () => void
  onSell: () => void
}

function BottomActionBar({ buyPrice, sellPrice, spread, onBuy, onSell }: BottomActionBarProps) {
  return (
    <View className="px-xl mb-xl py-medium">
      <View className='flex-row gap-medium items-center relative'>
        <TouchableOpacity
          onPress={onBuy}
          className="flex-1 h-[40px] px-xl rounded-small flex-row items-center justify-center bg-market-rise"
        >
          <Text className="text-button-2 font-medium text-content-foreground">{buyPrice}</Text>
          <Text className="text-button-2 ml-xs text-content-foreground">
            <Trans>买入/做多</Trans>
          </Text>
        </TouchableOpacity>

        {/* Spread Badge */}
        <View className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xs p-[2px] z-10 items-center justify-center size-[20px]">
          <Text className="text-paragraph-p3 text-content-foreground">{spread}</Text>
        </View>

        <TouchableOpacity
          onPress={onSell}
          className="flex-1 h-[40px] px-xl rounded-small flex-row items-center justify-center bg-market-fall"
        >
          <Text className="text-button-2 font-medium text-content-1">{sellPrice}</Text>
          <Text className="text-button-2 ml-xs text-content-1">
            <Trans>卖出 / 做空</Trans>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ============ Main SymbolDepth Component ============
export default function SymbolDepth() {
  const router = useRouter()
  const { symbol } = useLocalSearchParams<{ symbol: string }>()
  const [isFavorite, setIsFavorite] = useState(false)

  const routes = useMemo<Route[]>(
    () => [
      { key: 'chart', title: t`图表` },
      { key: 'details', title: t`详情` },
    ],
    []
  )

  const renderScene = useCallback(({ route }: { route: Route }) => {
    switch (route.key) {
      case 'chart':
        return <ChartView />
      case 'details':
        return <DetailsView />
      default:
        return null
    }
  }, [])

  const handleBuy = useCallback(() => {
    router.push('/trade?side=buy')
  }, [router])

  const handleSell = useCallback(() => {
    router.push('/trade?side=sell')
  }, [router])

  const handleFavoriteToggle = useCallback(() => {
    setIsFavorite((prev) => !prev)
  }, [])

  return (
    <View className="flex-1">
      <SymbolDepthHeader
        symbol={symbol || 'SOL-USDC'}
        priceChange="+1.54%"
        isPriceUp={true}
        isFavorite={isFavorite}
        onFavoriteToggle={handleFavoriteToggle}
      />
      <SwipeableTabs
        routes={routes}
        renderScene={renderScene}
        variant="underline"
        size="md"
        tabBarClassName="border-b border-brand-default px-xl"
      />

      <BottomActionBar
        buyPrice="184.00"
        sellPrice="184.00"
        spread={12}
        onBuy={handleBuy}
        onSell={handleSell}
      />
    </View>
  )
}
