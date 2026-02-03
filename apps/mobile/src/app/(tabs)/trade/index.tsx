
import { useState, useCallback, useMemo } from 'react'
import { View, ScrollView, TouchableOpacity } from 'react-native'
import { Text } from '@/components/ui/text'
import {
  IconifyNavArrowDown,
  IconifyUserCircle,
  IconifyPlusCircle,
  IconDefault,
  IconifyPage,
  IconifyNavArrowDownSolid,
  IconNavArrowSuperior,
} from '@/components/ui/icons'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Trans } from '@lingui/react/macro'
import { IconButton, Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, SwipeableTabs } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { t } from '@/locales/i18n'
import { Switch } from '@/components/ui/switch'
import { Route } from 'react-native-tab-view'
import { Checkbox } from '@/components/ui/checkbox'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import {
  CollapsibleScrollView,
  CollapsibleTab,
  CollapsibleTabScene,
} from '@/components/ui/collapsible-tab'

// ============ Interfaces ============
interface AccountInfo {
  id: string
  type: string
  balance: string
  currency: string
  isReal: boolean
}

export interface Account {
  id: string
  type: string
  balance: string
  currency: string
  isReal?: boolean
  leverage?: string
  platform?: string
  server?: string
  address?: string
  [key: string]: any
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
              <IconButton variant='ghost' color='primary'>
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
}

function OrderPanel({
  buyPrice,
  sellPrice,
  spread,
  onBuy,
  onSell,
  estimatedMargin,
  maxLots,
}: OrderPanelProps) {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market')
  const [selectedSide, setSelectedSide] = useState<'buy' | 'sell'>('buy')
  const [quantity, setQuantity] = useState('0.01')
  const [stopLossEnabled, setStopLossEnabled] = useState(false)

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

      {/* Price Input (for Market Order) */}
      <View className="border border-brand-default rounded-small py-large px-xl flex-row items-center justify-between">
        <Text className="text-paragraph-p2 text-content-5">
          <Trans>以当前最优价</Trans>
        </Text>
        <TouchableOpacity>
          <Text className="text-paragraph-p2 text-content-1">
            <Trans>最新</Trans>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quantity Input */}
      <Input
        labelText={t`买入数量`}
        value={quantity}
        onValueChange={setQuantity}
        keyboardType="decimal-pad"
        RightContent={<Text className="text-content-1"><Trans>手</Trans></Text>}
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

      {/* Submit Button */}
      <Button
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

const TIME_PERIODS = ['15分', '1小时', '4小时', '天']

function KLineChart({ isVisible, onToggle }: KLineChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('15分')

  if (!isVisible) {
    return null
  }

  return (
    <View>
      <View className='flex-row items-center justify-between'>
        <View className='flex-row items-center gap-2xl'>
          <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <TabsList variant="text" size="sm" className='gap-2xl'>
              {TIME_PERIODS.map((period) => (
                <TabsTrigger key={period} value={period} className='flex-row'>
                  <Text>{period}</Text>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Button variant='none' className='p-0'>
            <Text><Trans>更多</Trans></Text>
            <IconifyNavArrowDownSolid width={16} height={16} className='text-content-4' />
          </Button>
        </View>
        <TouchableOpacity onPress={onToggle} className="flex-row items-center gap-xs">
          <Text className="text-button-1 text-content-4">
            <Trans>隐藏</Trans>
          </Text>
          <IconNavArrowSuperior width={16} height={16} className="text-brand-special" />
        </TouchableOpacity>
      </View>

      <View className='h-[193px] bg-brand-primary'>
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
  currentPrice: number
  profit: number
  profitPercent: number
}

interface PendingOrder {
  id: string
  symbol: string
  direction: 'long' | 'short'
  quantity: number
  price: number
  type: 'limit' | 'stop'
}

interface PositionListProps {
  positions: Position[]
  pendingOrders: PendingOrder[]
  onPositionPress?: (position: Position) => void
  onOrderPress?: (order: PendingOrder) => void
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

function PositionList({
  positions,
  pendingOrders,
  onPositionPress,
  onOrderPress,
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
          <View className="flex-1 px-xl">
            {positions.map((position) => (
              <TouchableOpacity
                key={position.id}
                onPress={() => onPositionPress?.(position)}
                className="py-medium border-b border-brand-default"
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-paragraph-p2 text-content-1">
                      {position.symbol}
                    </Text>
                    <Text
                      className={`text-paragraph-p3 ${position.direction === 'long' ? 'text-market-rise' : 'text-market-fall'}`}
                    >
                      {position.direction === 'long' ? '做多' : '做空'} {position.quantity}手
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text
                      className={`text-paragraph-p2 ${position.profit >= 0 ? 'text-market-rise' : 'text-market-fall'}`}
                    >
                      {position.profit >= 0 ? '+' : ''}
                      {position.profit.toFixed(2)} USDC
                    </Text>
                    <Text
                      className={`text-paragraph-p3 ${position.profitPercent >= 0 ? 'text-market-rise' : 'text-market-fall'}`}
                    >
                      {position.profitPercent >= 0 ? '+' : ''}
                      {position.profitPercent.toFixed(2)}%
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )
      case 'orders':
        return pendingOrders.length === 0 ? (
          <View className="flex-1">
            <EmptyState />
          </View>
        ) : (
          <View className="flex-1 px-xl">
            {pendingOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                onPress={() => onOrderPress?.(order)}
                className="py-medium border-b border-brand-default"
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-paragraph-p2 text-content-1">{order.symbol}</Text>
                    <Text
                      className={`text-paragraph-p3 ${order.direction === 'long' ? 'text-market-rise' : 'text-market-fall'}`}
                    >
                      {order.direction === 'long' ? '做多' : '做空'} {order.quantity}手
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-paragraph-p2 text-content-1">
                      {order.price.toFixed(2)}
                    </Text>
                    <Text className="text-paragraph-p3 text-content-4">
                      {order.type === 'limit' ? '限价单' : '止损单'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )
      default:
        return null
    }
  }, [positions, pendingOrders, onPositionPress, onOrderPress])

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

// ============ TradeAccountSelectionDrawer ============
interface TradeAccountSelectionDrawerProps {
  visible: boolean
  onClose: () => void
  selectedAccountId?: string
  onSelect: (account: Account) => void
  realAccounts: Account[]
  mockAccounts: Account[]
}

function TradeAccountSelectionDrawer({
  visible,
  onClose,
  selectedAccountId,
  onSelect,
  realAccounts,
  mockAccounts,
}: TradeAccountSelectionDrawerProps) {
  const handleSelect = (account: Account) => {
    onSelect(account)
    onClose()
  }

  return (
    <Drawer open={visible} onOpenChange={onClose}>
      <DrawerContent className="p-0">
        <View className="h-[320px] pt-xl">
          <CollapsibleTab
            initialTabName="real"
            size="md"
            variant="underline"
            minHeaderHeight={0}
            scrollEnabled={false}
            tabBarClassName="bg-special"
          >
            <CollapsibleTabScene name="real" label={t`真实账户`}>
              <CollapsibleScrollView className="flex-1 pt-xl">
                {realAccounts.map((account) => (
                  <AccountRow
                    key={account.id}
                    account={{ ...account, isReal: true }}
                    isSelected={selectedAccountId === account.id}
                    onPress={() => handleSelect({ ...account, isReal: true })}
                  />
                ))}
              </CollapsibleScrollView>
            </CollapsibleTabScene>

            <CollapsibleTabScene name="mock" label={t`模拟账户`}>
              <CollapsibleScrollView className="flex-1 pt-xl">
                {mockAccounts.map((account) => (
                  <AccountRow
                    key={account.id}
                    account={{ ...account, isReal: false }}
                    isSelected={selectedAccountId === account.id}
                    onPress={() => handleSelect({ ...account, isReal: false })}
                  />
                ))}
              </CollapsibleScrollView>
            </CollapsibleTabScene>
          </CollapsibleTab>
        </View>
      </DrawerContent>
    </Drawer>
  )
}

interface AccountRowProps {
  account: Account
  isSelected: boolean
  onPress: () => void
}

function AccountRow({ account, isSelected, onPress }: AccountRowProps) {
  const { textColorContent1 } = useThemeColors()

  return (
    <TouchableOpacity onPress={onPress}>
      <Card className="border-0">
        <CardContent className="px-5 py-[14px] flex-row items-center justify-between">
          <View className="gap-xs">
            {/* Header: User Icon + Account ID + Badges */}
            <View className="flex-row items-center gap-medium">
              <View className="flex-row items-center gap-xs">
                <IconifyUserCircle width={24} height={24} color={textColorContent1} />
                <Text className="text-paragraph-p2 text-content-1">{account.id}</Text>
              </View>

              <View className="flex-row items-center gap-medium">
                <Badge color={account.isReal ? 'rise' : 'secondary'}>
                  <Text>{account.isReal ? <Trans>真实</Trans> : <Trans>模拟</Trans>}</Text>
                </Badge>
                <Badge color="default">
                  <Text>{account.type.toUpperCase()}</Text>
                </Badge>
              </View>
            </View>

            {/* Balance */}
            <View className="flex-row gap-xs">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>账户余额</Trans>
              </Text>
              <Text className="text-paragraph-p3 text-content-1">
                {account.balance} {account.currency}
              </Text>
            </View>
          </View>

          <Checkbox checked={isSelected} onCheckedChange={onPress} />
        </CardContent>
      </Card>
    </TouchableOpacity>
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

export default function Trade() {
  // State
  const [isChartVisible, setIsChartVisible] = useState(true)
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false)
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
    console.log('Buy order placed')
  }, [])

  const handleSell = useCallback(() => {
    console.log('Sell order placed')
  }, [])

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        bounces={false}
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
        />

        {/* Position List */}
        <View className="mt-xl h-[300px]">
          <PositionList
            positions={[]}
            pendingOrders={[]}
            onHistoryPress={() => console.log('History pressed')}
          />
        </View>
      </ScrollView>

      {/* Account Selection Drawer */}
      <TradeAccountSelectionDrawer
        visible={isAccountDrawerOpen}
        onClose={() => setIsAccountDrawerOpen(false)}
        selectedAccountId={selectedAccount.id}
        onSelect={handleAccountSelect}
        realAccounts={MOCK_REAL_ACCOUNTS}
        mockAccounts={MOCK_DEMO_ACCOUNTS}
      />
    </View>
  )
}
