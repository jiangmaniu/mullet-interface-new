
import { useState, useCallback, useMemo, useEffect } from 'react'
import { View, TouchableOpacity, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Text } from '@/components/ui/text'
import {
  IconifyActivity,
  IconifyCandlestickChart,
  IconifyMoreHoriz,
  IconifyNavArrowDownSolid,
  IconifyNavArrowDown,
  IconifyUserCircle,
  IconifyPlusCircle,
  IconDefault,
  IconifyPage,
  IconNavArrowSuperior,
  IconNavArrowDown,
  IconifyNavArrowRight,
} from '@/components/ui/icons'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScreenHeader } from '@/components/ui/screen-header'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Trans } from '@lingui/react/macro'
import { IconButton, Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, SwipeableTabs } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { t } from '@/locales/i18n'
import { Switch } from '@/components/ui/switch'
import { Route } from 'react-native-tab-view'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import * as AccordionPrimitive from '@rn-primitives/accordion'
import {
  TradeAccountSelectionDrawer,
  type Account,
} from './_comps/trade-account-selection-drawer'
import { OrderConfirmationDrawer } from './_comps/order-confirmation-drawer'
import { ClosePositionDrawer } from './_comps/close-position-drawer'
import { StopProfitLossDrawer } from './_comps/stop-profit-loss-drawer'
import { CommonFeaturesDrawer } from './_comps/common-features-drawer'
import { useToast } from '@/components/ui/toast'
import { KeyboardAwareContainer } from '@/components/ui/keyboard-aware-container'
// ============ TradeHeader Component ============
interface TradeHeaderProps {
  symbol: string
  priceChange: string
  isPriceUp: boolean
  onSymbolPress?: () => void
  onMorePress?: () => void
}

function TradeHeader({
  symbol,
  priceChange,
  isPriceUp,
  onSymbolPress,
  onMorePress,
}: TradeHeaderProps) {
  const router = useRouter()

  const handleViewChange = useCallback((view: 'chart' | 'depth') => {
    if (view === 'chart') {
      // Already on chart view, do nothing
      return
    } else {
      // Navigate to symbol depth page with default symbol (e.g., SOL-USDC)
      router.push('/SOL-USDC')
    }
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
              className="w-[36px] h-[24px] rounded-full justify-center items-center bg-button"
            >
              <IconifyActivity width={22} height={22} className="text-content-1" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleViewChange('depth')}
              className="w-[36px] h-[24px] rounded-full justify-center items-center"
            >
              <IconifyCandlestickChart
                width={22}
                height={22}
                className="text-brand-default"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onMorePress}>
            <IconifyMoreHoriz width={22} height={22} className="text-content-1" />
          </TouchableOpacity>
        </View>
      }
    />
  )
}

// ============ Interfaces ============
interface AccountInfo {
  id: string
  type: string
  balance: string
  currency: string
  isReal: boolean
}

// ============ AccountCard ============
interface AccountCardProps {
  account: AccountInfo
  onPress: () => void
  onDeposit?: () => void
}

function AccountCard({ account, onPress, onDeposit }: AccountCardProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card className="border-brand-default bg-button">
        <CardContent className="px-xl py-medium gap-xs">
          {/* Header Row: User Icon + Account ID + Badges + Arrow */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-medium">
              {/* User + ID */}
              <View className="flex-row items-center gap-xs">
                <IconifyUserCircle width={20} height={20} className='text-content-1' />
                <Text className="text-paragraph-p2 text-content-1">{account.id}</Text>
              </View>
              {/* Badges */}
              <View className="flex-row items-center gap-medium">
                <Badge color={account.isReal ? 'rise' : 'secondary'}>
                  <Text>{account.isReal ? <Trans>真实</Trans> : <Trans>模拟</Trans>}</Text>
                </Badge>
                <Badge color="default">
                  <Text>{account.type}</Text>
                </Badge>
              </View>
            </View>
            <IconifyNavArrowDown width={16} height={16} className='text-content-1' />
          </View>

          {/* Balance Row: Available + Balance + Deposit Icon */}
          <View className="flex-row items-center justify-between">
            <Text
              className="text-paragraph-p3 text-content-4"
              style={{ textDecorationLine: 'underline', textDecorationStyle: 'dotted' }}
            >
              <Trans>可用</Trans>
            </Text>
            <View className="flex-row items-center gap-xs">
              <Text className="text-paragraph-p3 text-content-1">
                {account.balance} {account.currency}
              </Text>
              <IconButton color='primary'>
                <IconifyPlusCircle width={14} height={14} />
              </IconButton>
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  )
}

// ============ OrderPanel ============
interface OrderPanelProps {
  buyPrice: string
  sellPrice: string
  spread: number
  onBuy: () => void
  onSell: () => void
  estimatedMargin: string
  maxLots: string
  defaultSide?: 'buy' | 'sell'
}

function OrderPanel({
  buyPrice,
  sellPrice,
  spread,
  onBuy,
  onSell,
  estimatedMargin,
  maxLots,
  defaultSide = 'buy',
}: OrderPanelProps) {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market')
  const [selectedSide, setSelectedSide] = useState<'buy' | 'sell'>(defaultSide)
  const [quantity, setQuantity] = useState('0.01')
  const [limitPrice, setLimitPrice] = useState('180.66')
  const [stopLossEnabled, setStopLossEnabled] = useState(false)
  const [takeProfitPrice, setTakeProfitPrice] = useState('')
  const [takeProfitPercent, setTakeProfitPercent] = useState('')
  const [stopLossPrice, setStopLossPrice] = useState('')
  const [stopLossPercent, setStopLossPercent] = useState('')

  // Update selectedSide when defaultSide changes (from URL params)
  useEffect(() => {
    setSelectedSide(defaultSide)
  }, [defaultSide])

  return (
    <View className="px-xl gap-xl">
      {/* Order Type Tabs */}
      <Tabs value={orderType} onValueChange={(v) => setOrderType(v as 'market' | 'limit')}>
        <TabsList variant="underline" size="md" className='w-full border-b-1 border-brand-default'>
          <TabsTrigger value="market" className="flex-1">
            <Text>
              <Trans>市价</Trans>
            </Text>
          </TabsTrigger>
          <TabsTrigger value="limit" className="flex-1">
            <Text>
              <Trans>限价</Trans>
            </Text>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Buy/Sell Buttons */}
      <View className="flex-row gap-medium items-center relative">
        <TouchableOpacity
          onPress={() => setSelectedSide('buy')}
          className={`flex-1 h-[40px] px-xl rounded-small flex-row items-center justify-center ${selectedSide === 'buy' ? 'bg-market-rise' : 'bg-button'
            }`}
        >
          <Text
            className={`text-button-2 font-medium ${selectedSide === 'buy' ? 'text-content-foreground' : 'text-content-4'}`}
          >
            {buyPrice}
          </Text>
          <Text
            className={`text-button-2 ml-xs ${selectedSide === 'buy' ? 'text-content-foreground' : 'text-content-4'}`}
          >
            <Trans>买入/做多</Trans>
          </Text>
        </TouchableOpacity>

        {/* Spread Badge - Centered */}
        <View className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xs p-[2px] z-10 items-center justify-center size-[20px]">
          <Text className="text-paragraph-p3 text-content-foreground">{spread}</Text>
        </View>

        <TouchableOpacity
          onPress={() => setSelectedSide('sell')}
          className={`flex-1 h-[40px] px-xl rounded-small flex-row items-center justify-center ${selectedSide === 'sell' ? 'bg-market-fall' : 'bg-button'
            }`}
        >
          <Text
            className={`text-button-2 font-medium ${selectedSide === 'sell' ? 'text-content-1' : 'text-content-4'}`}
          >
            {sellPrice}
          </Text>
          <Text
            className={`text-button-2 ml-xs ${selectedSide === 'sell' ? 'text-content-1' : 'text-content-4'}`}
          >
            <Trans>卖出/做空</Trans>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Price Input - Different UI for Market vs Limit */}
      {orderType === 'market' ? (
        <View className="border border-brand-default rounded-small py-large px-xl flex-row items-center justify-between">
          <Text className="text-paragraph-p2 text-content-5">
            <Trans>以当前最优价</Trans>
          </Text>
          <Text className="text-paragraph-p2 text-content-1">
            <Trans>最新</Trans>
          </Text>
        </View>
      ) : (
        <Input
          labelText={t`价格`}
          value={limitPrice}
          onValueChange={setLimitPrice}
          keyboardType="decimal-pad"
          RightContent={
            <TouchableOpacity onPress={() => {
              setLimitPrice(selectedSide === 'buy' ? buyPrice : sellPrice)
            }}>
              <Text className="text-paragraph-p2 text-brand-primary">
                <Trans>最新</Trans>
              </Text>
            </TouchableOpacity>
          }
          variant="outlined"
          size="md"
        />
      )}

      {/* Quantity Input */}
      <Input
        labelText={t`买入数量`}
        value={quantity}
        onValueChange={setQuantity}
        keyboardType="decimal-pad"
        RightContent={<Text className="text-paragraph-p2 text-content-1"><Trans>手</Trans></Text>}
        variant="outlined"
        size="md"
      />

      {/* Quantity Range Hint */}
      <Text className="text-paragraph-p3 text-content-4">
        <Trans>买入范围</Trans> ≥{' '}
        <Text className="text-content-1 text-paragraph-p3">0.01-20.00<Trans>手</Trans></Text>
      </Text>

      {/* Stop Loss Toggle */}
      <View className="flex-row items-center gap-medium">
        <Switch
          checked={stopLossEnabled}
          onCheckedChange={setStopLossEnabled}
        />
        <Text className="text-paragraph-p3 text-content-4">
          <Trans>止盈/止损</Trans>
        </Text>
      </View>

      {/* Stop Loss/Take Profit Inputs - Only show when enabled */}
      {stopLossEnabled && (
        <>
          {/* Take Profit Section */}
          <View className="gap-xs">
            <View className="flex-row gap-xl">
              <Input
                labelText={t`止盈触发价`}
                value={takeProfitPrice}
                onValueChange={setTakeProfitPrice}
                keyboardType="decimal-pad"
                placeholder={t`输入价格`}
                variant="outlined"
                size="md"
                className="flex-1"
              />
              <Input
                labelText={t`百分比`}
                value={takeProfitPercent}
                onValueChange={setTakeProfitPercent}
                keyboardType="decimal-pad"
                placeholder="0.00"
                clean={false}
                RightContent={<Text className="text-paragraph-p2 text-content-1">%</Text>}
                variant="outlined"
                size="md"
                className="w-[90px]"
              />
            </View>
            <View className="flex-row justify-between">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>范围</Trans> ≥ <Text className="text-market-fall text-paragraph-p3">1.17 USDC</Text>
              </Text>
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>预计盈亏</Trans> ≥ <Text className="text-content-1 text-paragraph-p3">0.00 USDC</Text>
              </Text>
            </View>
          </View>

          {/* Stop Loss Section */}
          <View className="gap-xs">
            <View className="flex-row gap-xl">
              <Input
                labelText={t`止损触发价`}
                value={stopLossPrice}
                onValueChange={setStopLossPrice}
                keyboardType="decimal-pad"
                placeholder={t`输入价格`}
                variant="outlined"
                size="md"
                className="flex-1"
              />
              <Input
                labelText={t`百分比`}
                value={stopLossPercent}
                onValueChange={setStopLossPercent}
                keyboardType="decimal-pad"
                placeholder="0.00"
                clean={false}
                RightContent={<Text className="text-paragraph-p2 text-content-1">%</Text>}
                variant="outlined"
                size="md"
                className="w-[90px]"
              />
            </View>
            <View className="flex-row justify-between">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>范围</Trans> ≥ <Text className="text-content-1 text-paragraph-p3">1.17 USDC</Text>
              </Text>
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>预计盈亏</Trans> ≥ <Text className="text-content-1 text-paragraph-p3">0.00 USDC</Text>
              </Text>
            </View>
          </View>
        </>
      )}

      {/* Submit Button */}
      <Button
        variant="solid"
        color="primary"
        size="lg"
        block
        onPress={selectedSide === 'buy' ? onBuy : onSell}
      >
        <Text className="text-content-foreground text-button-2 font-medium">
          {selectedSide === 'buy' ? <Trans>确定买入</Trans> : <Trans>确定卖出</Trans>}
        </Text>
      </Button>

      {/* Info Footer */}
      <View className="flex-row justify-between">
        <Text
          className="text-clickable-1 text-content-4"
          style={{ textDecorationLine: 'underline', textDecorationStyle: 'dotted' }}
        >
          <Trans>预估保证金</Trans>
        </Text>
        <Text className="text-paragraph-p3 text-content-1">{estimatedMargin} USDC</Text>
      </View>
      <View className="flex-row justify-between">
        <Text
          className="text-clickable-1 text-content-4"
          style={{ textDecorationLine: 'underline', textDecorationStyle: 'dotted' }}
        >
          <Trans>可开</Trans>
        </Text>
        <Text className="text-paragraph-p3 text-content-1">
          {maxLots} <Trans>手</Trans>
        </Text>
      </View>
    </View>
  )
}

// ============ KLineChart ============
interface KLineChartProps {
  isVisible: boolean
  onToggle: () => void
  symbol: string
}

const TIME_PERIODS = ['分时', '1秒', '1分', '3分', '5分', '15分', '30分', '1小时', '2小时', '6小时', '8小时', '12小时', '1天', '3天', '1周', '1月']

function KLineChart({ isVisible, onToggle }: KLineChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('15分')

  // Collapsed state - show "K线图表" and "展开" button
  if (!isVisible) {
    return (
      <View className='flex-row items-center justify-between border-b border-brand-default h-10'>
        <View className='px-xl py-xs'>
          <Text className='text-button-1 text-content-1'>
            <Trans>K线图表</Trans>
          </Text>
        </View>
        <TouchableOpacity onPress={onToggle} className="flex-row items-center gap-xs pr-xl">
          <Text className="text-button-1 text-content-4">
            <Trans>展开</Trans>
          </Text>
          <IconNavArrowDown width={16} height={16} className="text-content-4" />
        </TouchableOpacity>
      </View>
    )
  }

  // Expanded state - show time period tabs and "隐藏" button
  return (
    <View>
      <View className='flex-row items-center h-10'>
        <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className='flex-1'>
          <TabsList variant="text" size="sm" className='gap-2xl px-medium' scrollable>
            {TIME_PERIODS.map((period) => (
              <TabsTrigger key={period} value={period} className='flex-row'>
                <Text>{period}</Text>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <TouchableOpacity onPress={onToggle} className="flex-row items-center gap-xs pr-xl">
          <Text className="text-button-1 text-content-4">
            <Trans>隐藏</Trans>
          </Text>
          <IconNavArrowSuperior width={16} height={16} className="text-content-4" />
        </TouchableOpacity>
      </View>

      <View className='h-[193px] border-b border-brand-default'>
        {/* TODO: K-line chart will be implemented here */}
      </View>
    </View>
  )
}

// ============ PositionList ============
interface Position {
  id: string
  symbol: string
  direction: 'long' | 'short'
  quantity: number
  openPrice: number
  markPrice: number
  profit: number
  profitPercent: number
  marginRate: number
  margin: number
  fee: number
  storageFee: number
}

interface PendingOrder {
  id: string
  symbol: string
  direction: 'long' | 'short'
  quantity: number
  orderPrice: number
  markPrice: number
}

interface PositionListProps {
  positions: Position[]
  pendingOrders: PendingOrder[]
  onStopLoss?: (position: Position) => void
  onClosePosition?: (position: Position) => void
  onCancelOrder?: (order: PendingOrder) => void
  onHistoryPress?: () => void
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center gap-medium">
      <IconDefault width={67} height={48} />
      <Text className="text-paragraph-p2 text-content-6">
        <Trans>暂无资产</Trans>
      </Text>
    </View>
  )
}

// ============ PositionItem ============
interface PositionItemProps {
  position: Position
  onStopLoss?: () => void
  onClosePosition?: () => void
}

function PositionItemContent({ position, onStopLoss, onClosePosition }: PositionItemProps) {
  const profitColor = position.profit >= 0 ? 'text-market-rise' : 'text-market-fall'
  const { isExpanded } = AccordionPrimitive.useItemContext()

  return (
    <View className="gap-xl">
      {/* Header with trigger */}
      <AccordionTrigger className="py-0 px-xl">
        <Pressable
          onPress={() => {
            console.log('Pressable')
          }}
        >
          <View className="flex-row items-center gap-[10px] flex-1">
            <View className="size-[24px] rounded-full bg-button items-center justify-center">
              <Text className="text-paragraph-p3 text-content-1">S</Text>
            </View>
            <Text className="text-important-1 text-content-1">{position.symbol}</Text>
            <Badge color={position.direction === 'long' ? 'rise' : 'fall'}>
              <Text>{position.direction === 'long' ? <Trans>做多</Trans> : <Trans>做空</Trans>}</Text>
            </Badge>
            <IconifyNavArrowRight
              width={16}
              height={16}
              className="text-content-1"
            />
          </View>
        </Pressable>
      </AccordionTrigger>

      {/* Fixed: Row 1 - 浮动盈亏, 收益率, 数量 (数量仅展开时显示) */}
      <View className="px-xl">
        <View className="flex-row justify-between">
          <View className="w-[100px]">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>浮动盈亏(USDC)</Trans>
            </Text>
            <Text className={`text-paragraph-p2 ${profitColor}`}>
              {position.profit >= 0 ? '+' : ''}{position.profit.toFixed(2)}
            </Text>
          </View>
          <View className={cn('w-[100px]', !isExpanded && 'items-end')}>
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>收益率(%)</Trans>
            </Text>
            <Text className={`text-paragraph-p2 ${profitColor}`}>
              {position.profitPercent >= 0 ? '+' : ''}{position.profitPercent.toFixed(2)}%
            </Text>
          </View>
          {isExpanded && (
            <View className="w-[100px] items-end">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>数量(手)</Trans>
              </Text>
              <Text className="text-paragraph-p2 text-content-2">
                {position.quantity.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Expandable: Row 2 & Row 3 */}
      <AccordionContent className="px-xl gap-xl pb-0">
        {/* Row 2: 保证金率, 保证金, 开仓价 */}
        <View className="flex-row justify-between">
          <View className="w-[100px]">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>保证金率(%)</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">
              {position.marginRate.toFixed(2)}%
            </Text>
          </View>
          <View className="w-[100px]">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>保证金(USDC)</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">
              {position.margin.toFixed(2)}
            </Text>
          </View>
          <View className="w-[100px] items-end">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>开仓价(USDC)</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">
              {position.openPrice.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Row 3: 标记价, 手续费, 库存费 */}
        <View className="flex-row justify-between">
          <View className="w-[100px]">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>标记价(USDC)</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">
              {position.markPrice.toFixed(2)}
            </Text>
          </View>
          <View className="w-[100px]">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>手续费(USDC)</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">
              {position.fee.toFixed(2)}
            </Text>
          </View>
          <View className="w-[100px] items-end">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>库存费(USDC)</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">
              {position.storageFee.toFixed(2)}
            </Text>
          </View>
        </View>
      </AccordionContent>

      {/* Fixed: Action Buttons (always visible) */}
      <View className="px-xl">
        <View className="flex-row gap-xl">
          <Button
            variant="solid"
            size="md"
            className="flex-1"
            onPress={onStopLoss}
          >
            <Text>
              <Trans>止盈止损</Trans>
            </Text>
          </Button>
          <Button
            variant="solid"
            size="md"
            className="flex-1"
            onPress={onClosePosition}
          >
            <Text>
              <Trans>平仓</Trans>
            </Text>
          </Button>
        </View>
      </View>
    </View>
  )
}

function PositionItem({ position, onStopLoss, onClosePosition }: PositionItemProps) {
  return (
    <Accordion type="multiple" className="border-b-0">
      <AccordionItem value={position.id} className="border-b-0 py-xl">
        <PositionItemContent
          position={position}
          onStopLoss={onStopLoss}
          onClosePosition={onClosePosition}
        />
      </AccordionItem>
    </Accordion>
  )
}

// ============ PendingOrderItem ============
interface PendingOrderItemProps {
  order: PendingOrder
  onCancel?: () => void
}

function PendingOrderItem({ order, onCancel }: PendingOrderItemProps) {
  return (
    <View className="py-xl gap-xl">
      {/* Header Row */}
      <View className="flex-row items-center justify-between px-xl">
        <Pressable
          onPress={() => {
            console.log('Pressable')
          }}
        >
          <View className="flex-row items-center gap-[10px] flex-1">
            <View className="size-[24px] rounded-full bg-button items-center justify-center">
              <Text className="text-paragraph-p3 text-content-1">S</Text>
            </View>
            <Text className="text-important-1 text-content-1">{order.symbol}</Text>
            <Badge color={order.direction === 'long' ? 'rise' : 'fall'}>
              <Text>{order.direction === 'long' ? <Trans>做多</Trans> : <Trans>做空</Trans>}</Text>
            </Badge>
            <IconifyNavArrowRight
              width={16}
              height={16}
              className="text-content-1"
            />
          </View>
        </Pressable>
        <TouchableOpacity onPress={onCancel}>
          <Text className="text-paragraph-p3 text-content-4">
            <Trans>取消</Trans>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Data Row: 数量, 挂单价, 标记价 */}
      <View className="flex-row justify-between px-xl">
        <View className="w-[100px]">
          <Text className="text-paragraph-p3 text-content-4">
            <Trans>数量(手)</Trans>
          </Text>
          <Text className="text-paragraph-p3 text-content-1">
            {order.quantity.toFixed(1)}
          </Text>
        </View>
        <View className="w-[100px]">
          <Text className="text-paragraph-p3 text-content-4">
            <Trans>挂单价(USDC)</Trans>
          </Text>
          <Text className="text-paragraph-p3 text-content-1">
            {order.orderPrice.toFixed(2)}
          </Text>
        </View>
        <View className="w-[100px] items-end">
          <Text className="text-paragraph-p3 text-content-4">
            <Trans>标记价(USDC)</Trans>
          </Text>
          <Text className="text-paragraph-p3 text-content-1">
            {order.markPrice.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  )
}

function PositionList({
  positions,
  pendingOrders,
  onStopLoss,
  onClosePosition,
  onCancelOrder,
  onHistoryPress,
}: PositionListProps) {
  const routes = useMemo<Route[]>(() => [
    { key: 'positions', title: `持仓(${positions.length})` },
    { key: 'orders', title: `挂单(${pendingOrders.length})` },
  ], [positions.length, pendingOrders.length])

  const renderScene = useCallback(({ route }: { route: Route }) => {
    switch (route.key) {
      case 'positions':
        return positions.length === 0 ? (
          <View className="flex-1">
            <EmptyState />
          </View>
        ) : (
          <View>
            {positions.map((position) => (
              <PositionItem
                key={position.id}
                position={position}
                onStopLoss={() => onStopLoss?.(position)}
                onClosePosition={() => onClosePosition?.(position)}
              />
            ))}
          </View>
        )
      case 'orders':
        return pendingOrders.length === 0 ? (
          <View className="flex-1">
            <EmptyState />
          </View>
        ) : (
          <View>
            {pendingOrders.map((order) => (
              <PendingOrderItem
                key={order.id}
                order={order}
                onCancel={() => onCancelOrder?.(order)}
              />
            ))}
          </View>
        )
      default:
        return null
    }
  }, [positions, pendingOrders, onStopLoss, onClosePosition, onCancelOrder])

  const renderTabBarRight = useCallback(() => (
    <IconButton onPress={onHistoryPress}>
      <IconifyPage width={22} height={22} />
    </IconButton>
  ), [onHistoryPress])

  return (
    <SwipeableTabs
      routes={routes}
      renderScene={renderScene}
      variant="underline"
      size="md"
      tabBarClassName="border-b border-brand-default px-xl"
      renderTabBarRight={renderTabBarRight}
    />
  )
}

// ============ Main Trade Component ============

// Mock data
const MOCK_REAL_ACCOUNTS: Account[] = [
  {
    id: '152365963',
    type: 'STP',
    balance: '152,563.00',
    currency: 'USDC',
    isReal: true,
  },
  {
    id: '152365964',
    type: 'STP',
    balance: '152,563.00',
    currency: 'USDC',
    isReal: true,
  },
  {
    id: '152365965',
    type: 'STP',
    balance: '152,563.00',
    currency: 'USDC',
    isReal: true,
  },
]

const MOCK_DEMO_ACCOUNTS: Account[] = [
  {
    id: '10023491',
    type: 'STP',
    balance: '100,000.00',
    currency: 'USDC',
    isReal: false,
  },
]

// Mock positions data
const MOCK_POSITIONS: Position[] = [
  {
    id: '1',
    symbol: 'SOL-USDC',
    direction: 'long',
    quantity: 1.0,
    openPrice: 187.00,
    markPrice: 186.00,
    profit: 152.00,
    profitPercent: 15.00,
    marginRate: 10.04,
    margin: 10.00,
    fee: 1.00,
    storageFee: 1.00,
  },
  {
    id: '2',
    symbol: 'SOL-USDC',
    direction: 'long',
    quantity: 1.0,
    openPrice: 187.00,
    markPrice: 186.00,
    profit: 152.00,
    profitPercent: 15.00,
    marginRate: 10.04,
    margin: 10.00,
    fee: 1.00,
    storageFee: 1.00,
  },
]

// Mock pending orders data
const MOCK_PENDING_ORDERS: PendingOrder[] = [
  {
    id: '1',
    symbol: 'SOL-USDC',
    direction: 'long',
    quantity: 1.0,
    orderPrice: 187.00,
    markPrice: 186.00,
  },
  {
    id: '2',
    symbol: 'SOL-USDC',
    direction: 'long',
    quantity: 1.0,
    orderPrice: 187.00,
    markPrice: 186.00,
  },
  {
    id: '3',
    symbol: 'SOL-USDC',
    direction: 'long',
    quantity: 1.0,
    orderPrice: 187.00,
    markPrice: 186.00,
  },
]

export default function Trade() {
  // Get URL params
  const { side } = useLocalSearchParams<{ side?: 'buy' | 'sell' }>()
  const defaultSide = side === 'sell' ? 'sell' : 'buy'

  // Router
  const router = useRouter()

  // Toast
  const { show: showToast } = useToast()

  // State
  const [isChartVisible, setIsChartVisible] = useState(true)
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false)
  const [isOrderConfirmDrawerOpen, setIsOrderConfirmDrawerOpen] = useState(false)
  const [isClosePositionDrawerOpen, setIsClosePositionDrawerOpen] = useState(false)
  const [isStopProfitLossDrawerOpen, setIsStopProfitLossDrawerOpen] = useState(false)
  const [isCommonFeaturesDrawerOpen, setIsCommonFeaturesDrawerOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [pendingOrder, setPendingOrder] = useState<{
    side: 'buy' | 'sell'
    price: string
    quantity: string
  } | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<AccountInfo>({
    id: '152365963',
    type: 'STP',
    balance: '250,800.00',
    currency: 'USDC',
    isReal: true,
  })

  // Handlers
  const handleChartToggle = useCallback(() => {
    setIsChartVisible((prev) => !prev)
  }, [])

  const handleAccountSelect = useCallback((account: Account) => {
    setSelectedAccount({
      id: account.id,
      type: account.type,
      balance: account.balance,
      currency: account.currency,
      isReal: account.isReal ?? true,
    })
  }, [])

  const handleBuy = useCallback(() => {
    setPendingOrder({
      side: 'buy',
      price: '184.00',
      quantity: '0.01',
    })
    setIsOrderConfirmDrawerOpen(true)
  }, [])

  const handleSell = useCallback(() => {
    setPendingOrder({
      side: 'sell',
      price: '184.00',
      quantity: '0.01',
    })
    setIsOrderConfirmDrawerOpen(true)
  }, [])

  const handleConfirmOrder = useCallback(() => {
    if (pendingOrder) {
      console.log('Order confirmed:', pendingOrder)
      // TODO: 实际下单逻辑
      setPendingOrder(null)
    }
  }, [pendingOrder])

  const handleClosePosition = useCallback((position: Position) => {
    setSelectedPosition(position)
    setIsClosePositionDrawerOpen(true)
  }, [])

  const handleConfirmClosePosition = useCallback((quantity: number, orderType: 'market' | 'limit', limitPrice?: string) => {
    if (selectedPosition) {
      console.log('Close position:', {
        position: selectedPosition,
        quantity,
        orderType,
        limitPrice,
      })
      // TODO: 实际平仓逻辑
      setSelectedPosition(null)
    }
  }, [selectedPosition])

  const handleStopProfitLoss = useCallback((takeProfitPrice: string, takeProfitPercent: string, stopLossPrice: string, stopLossPercent: string) => {
    if (selectedPosition) {
      console.log('Stop profit/loss:', {
        position: selectedPosition,
        takeProfitPrice,
        takeProfitPercent,
        stopLossPrice,
        stopLossPercent,
      })
      // TODO: 实际止盈止损逻辑
      setSelectedPosition(null)
    }
  }, [selectedPosition])

  return (
    <View className="flex-1">
      <TradeHeader
        symbol="SOL-USDC"
        priceChange="+1.54%"
        isPriceUp={true}
        onMorePress={() => setIsCommonFeaturesDrawerOpen(true)}
      />

      <KeyboardAwareContainer
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* K-Line Chart */}
        <KLineChart
          isVisible={isChartVisible}
          onToggle={handleChartToggle}
          symbol="SOL-USDC"
        />

        {/* Account Card */}
        <View className="pt-xl">
          <AccountCard
            account={selectedAccount}
            onPress={() => setIsAccountDrawerOpen(true)}
            onDeposit={() => console.log('Deposit pressed')}
          />
        </View>

        {/* Order Panel */}
        <OrderPanel
          buyPrice="184.00"
          sellPrice="184.00"
          spread={12}
          estimatedMargin="0.00"
          maxLots="0.00"
          onBuy={handleBuy}
          onSell={handleSell}
          defaultSide={defaultSide}
        />

        {/* Position List */}
        <View className="mt-xl" style={{ minHeight: 400 }}>
          <PositionList
            positions={MOCK_POSITIONS}
            pendingOrders={MOCK_PENDING_ORDERS}
            onStopLoss={(position) => {
              setSelectedPosition(position)
              setIsStopProfitLossDrawerOpen(true)
            }}
            onClosePosition={handleClosePosition}
            onCancelOrder={(order) => console.log('Cancel order:', order.id)}
            onHistoryPress={() => router.push('/(trade)/records')}
          />
        </View>
      </KeyboardAwareContainer>

      {/* Account Selection Drawer */}
      <TradeAccountSelectionDrawer
        visible={isAccountDrawerOpen}
        onClose={() => setIsAccountDrawerOpen(false)}
        selectedAccountId={selectedAccount.id}
        onSelect={handleAccountSelect}
        realAccounts={MOCK_REAL_ACCOUNTS}
        mockAccounts={MOCK_DEMO_ACCOUNTS}
      />

      {/* Order Confirmation Drawer */}
      <OrderConfirmationDrawer
        open={isOrderConfirmDrawerOpen}
        onOpenChange={setIsOrderConfirmDrawerOpen}
        symbol="SOL-USDC"
        direction={pendingOrder?.side === 'buy' ? 'long' : 'short'}
        price="56321.52"
        margin="56321.52"
        contractValue="56321.52"
        onConfirm={handleConfirmOrder}
      />

      {/* Close Position Drawer */}
      {selectedPosition && (
        <ClosePositionDrawer
          open={isClosePositionDrawerOpen}
          onOpenChange={setIsClosePositionDrawerOpen}
          symbol={selectedPosition.symbol}
          direction={selectedPosition.direction}
          quantity={selectedPosition.quantity}
          openPrice={selectedPosition.openPrice.toFixed(2)}
          currentPrice={selectedPosition.markPrice.toFixed(2)}
          profit={selectedPosition.profit.toFixed(2)}
          isProfitable={selectedPosition.profit >= 0}
          onConfirm={handleConfirmClosePosition}
        />
      )}

      {/* Stop Profit Loss Drawer */}
      {selectedPosition && (
        <StopProfitLossDrawer
          open={isStopProfitLossDrawerOpen}
          onOpenChange={setIsStopProfitLossDrawerOpen}
          symbol={selectedPosition.symbol}
          direction={selectedPosition.direction}
          openPrice={selectedPosition.openPrice.toFixed(2)}
          markPrice={selectedPosition.markPrice.toFixed(2)}
          onConfirm={handleStopProfitLoss}
        />
      )}

      {/* Common Features Drawer */}
      <CommonFeaturesDrawer
        open={isCommonFeaturesDrawerOpen}
        onOpenChange={setIsCommonFeaturesDrawerOpen}
        onTradingSettings={() => {
          console.log('Trading settings pressed')
          setIsCommonFeaturesDrawerOpen(false)
        }}
        onDeposit={() => {
          console.log('Deposit pressed')
          setIsCommonFeaturesDrawerOpen(false)
        }}
        onTransfer={() => {
          console.log('Transfer pressed')
          setIsCommonFeaturesDrawerOpen(false)
        }}
        onBill={() => {
          setIsCommonFeaturesDrawerOpen(false)
          router.push('/(trade)/records')
        }}
        onFavorites={() => {
          setIsCommonFeaturesDrawerOpen(false)
          showToast({
            type: 'success',
            message: '订单提交成功',
            duration: 2000,
          })
        }}
      />
    </View>
  )
}
