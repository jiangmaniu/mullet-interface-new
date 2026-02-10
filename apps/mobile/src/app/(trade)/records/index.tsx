import { useMemo } from 'react'
import { View } from 'react-native'
import { Trans } from '@lingui/react/macro'
import { Route } from 'react-native-tab-view'
import { ScreenHeader } from '@/components/ui/screen-header'
import { SwipeableTabs } from '@/components/ui/tabs'
import { Text } from '@/components/ui/text'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// ============================================================================
// Types
// ============================================================================

interface OrderItem {
  id: string
  symbol: string
  direction: 'long' | 'short'
  orderType: string
  orderTime: string
  orderPrice: string
  quantity: string
  status?: string
}

interface FilledOrderItem {
  id: string
  symbol: string
  direction: 'long' | 'short'
  orderType: string
  orderTime: string
  profitLoss: string
  isProfitable: boolean
  openPrice: string
  filledPrice: string
  quantity: string
  marginType: string
  tradeType: string
  orderNumber: string
  tradeSignature: string
  tradeTime: string
}

interface PositionItem {
  id: string
  symbol: string
  profitLoss: string
  isProfitable: boolean
  openQuantity: string
  openPrice: string
  takeProfit: string
  stopLoss: string
  openTime: string
  positionNumber: string
  accountNumber: string
  address: string
  fees: string
  inventoryFees: string
}

interface FundFlowItem {
  id: string
  type: string
  amount: string
  isIncome: boolean
  time: string
  balance: string
  beforeChange: string
  transactionSignature: string
}

// ============================================================================
// Mock Data
// ============================================================================

const mockOrders: OrderItem[] = [
  {
    id: '1',
    symbol: 'SOL-USDC',
    direction: 'long',
    orderType: '限价单',
    orderTime: '2026年1月15日 12:00:00',
    orderPrice: '0.10',
    quantity: '0.10',
    status: '已取消',
  },
  {
    id: '2',
    symbol: 'SOL-USDC',
    direction: 'short',
    orderType: '限价单',
    orderTime: '2026年1月15日 12:00:00',
    orderPrice: '0.10',
    quantity: '0.10',
    status: '已成交',
  },
  {
    id: '3',
    symbol: 'SOL-USDC',
    direction: 'long',
    orderType: '市价单',
    orderTime: '2026年1月15日 12:00:00',
    orderPrice: '0.10',
    quantity: '0.10',
    status: '已成交',
  },
]

const mockFilledOrders: FilledOrderItem[] = [
  {
    id: '1',
    symbol: 'SOL-USDC',
    direction: 'long',
    orderType: '限价单',
    orderTime: '2026年1月15日 12:00:00',
    profitLoss: '100.11',
    isProfitable: true,
    openPrice: '0.10',
    filledPrice: '0.10',
    quantity: '0.10',
    marginType: '11',
    tradeType: '平仓',
    orderNumber: '564465123123',
    tradeSignature: '------',
    tradeTime: '2026年12月28日 12:00:00',
  },
  {
    id: '2',
    symbol: 'SOL-USDC',
    direction: 'short',
    orderType: '市价单',
    orderTime: '2026年1月15日 12:00:00',
    profitLoss: '50.25',
    isProfitable: false,
    openPrice: '0.10',
    filledPrice: '10.00',
    quantity: '0.10',
    marginType: '10',
    tradeType: '开仓',
    orderNumber: '564465123123',
    tradeSignature: '0x1234...5678',
    tradeTime: '2026年12月28日 12:00:00',
  },
]

const mockPositions: PositionItem[] = [
  {
    id: '1',
    symbol: 'SOL-USDC',
    profitLoss: '152.00',
    isProfitable: true,
    openQuantity: '1.0',
    openPrice: '10.01',
    takeProfit: '0.00',
    stopLoss: '0.00',
    openTime: '2026年12月28日 12:00:00',
    positionNumber: '544665246241231',
    accountNumber: '22222',
    address: '0263x235654546asd2a3s2d3',
    fees: '0.00',
    inventoryFees: '0.00',
  },
  {
    id: '2',
    symbol: 'SOL-USDC',
    profitLoss: '152.00',
    isProfitable: false,
    openQuantity: '1.0',
    openPrice: '10.01',
    takeProfit: '0.00',
    stopLoss: '0.00',
    openTime: '2026年12月28日 12:00:00',
    positionNumber: '544665246241231',
    accountNumber: '22222',
    address: '0263x235654546asd2a3s2d3',
    fees: '0.00',
    inventoryFees: '0.00',
  },
]

const mockFundFlows: FundFlowItem[] = [
  {
    id: '1',
    type: '入金',
    amount: '0.10',
    isIncome: true,
    time: '2026年1月15日 12:00:00',
    balance: '0.10 USDC',
    beforeChange: '0.10 USDC',
    transactionSignature: '------',
  },
  {
    id: '2',
    type: '出金',
    amount: '0.10',
    isIncome: false,
    time: '2026年1月15日 12:00:00',
    balance: '0.10 USDC',
    beforeChange: '0.10 USDC',
    transactionSignature: '------',
  },
  {
    id: '3',
    type: '手续费',
    amount: '0.10',
    isIncome: true,
    time: '2026年1月15日 12:00:00',
    balance: '0.10 USDC',
    beforeChange: '0.10 USDC',
    transactionSignature: '------',
  },
]

// ============================================================================
// Card Components
// ============================================================================

function OrderCard({ order }: { order: OrderItem }) {
  return (
    <Card className="bg-background-secondary border border-brand-default mb-3">
      <CardContent className="gap-medium">
        {/* Header: Symbol, Direction Badge, and Status */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-2">
            {/* Product Avatar */}
            <Avatar className="size-6">
              <AvatarFallback className="bg-button">
                <Text className="text-paragraph-p3 text-content-1">S</Text>
              </AvatarFallback>
            </Avatar>

            {/* Symbol and Direction Badge */}
            <View className="flex-row items-center gap-2">
              <Text className="text-paragraph-p2 text-content-1">{order.symbol}</Text>
              <Badge color={order.direction === 'long' ? 'rise' : 'fall'}>
                <Text className="text-paragraph-p3">
                  {order.direction === 'long' ? <Trans>做多</Trans> : <Trans>做空</Trans>}
                </Text>
              </Badge>
            </View>
          </View>

          {/* Status Badge */}
          {order.status && (
            <Badge className='px-medium py-small'>
              <Text className="text-paragraph-p3">{order.status}</Text>
            </Badge>
          )}
        </View>

        {/* Order Type and Time */}
        <View className="flex-row items-start gap-3">
          <Text className="text-paragraph-p3 text-content-1">{order.orderType}</Text>
          <Text className="text-paragraph-p3 text-content-4">{order.orderTime}</Text>
        </View>

        {/* Order Details */}
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>挂单价格</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">{order.orderPrice}</Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>数量(手)</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">{order.quantity}</Text>
          </View>
        </View>
      </CardContent>
    </Card>
  )
}

function FilledOrderCard({ order }: { order: FilledOrderItem }) {
  return (
    <Card className="bg-background-secondary border border-brand-default mb-3">
      <CardContent className="gap-xs">
        {/* First Section: Header with gap-xs */}
        <View className="gap-xs">
          {/* Symbol and Direction Badge */}
          <View className="flex-row items-center gap-2">
            {/* Product Avatar */}
            <Avatar className="size-6">
              <AvatarFallback className="bg-button">
                <Text className="text-paragraph-p3 text-content-1">S</Text>
              </AvatarFallback>
            </Avatar>

            {/* Symbol and Badge */}
            <View className="flex-row items-center gap-2">
              <Text className="text-paragraph-p2 text-content-1">{order.symbol}</Text>
              <Badge color={order.direction === 'long' ? 'rise' : 'fall'}>
                <Text className="text-paragraph-p3">
                  {order.direction === 'long' ? <Trans>做多</Trans> : <Trans>做空</Trans>}
                </Text>
              </Badge>
            </View>
          </View>

          {/* Order Type and Time */}
          <View className="flex-row items-start gap-3">
            <Text className="text-paragraph-p3 text-content-1">{order.orderType}</Text>
            <Text className="text-paragraph-p3 text-content-4">{order.orderTime}</Text>
          </View>
        </View>

        {/* Second Section: Order Details with gap-2 */}
        <View className="gap-medium">
          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>盈亏</Trans>
            </Text>
            <Text
              className={`text-paragraph-p3 ${order.isProfitable ? 'text-market-rise' : 'text-market-fall'
                }`}
            >
              {order.profitLoss}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>开仓价格/成交价格</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">
              {order.openPrice}/{order.filledPrice}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>数量(手)</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">{order.quantity}</Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>保证金类型</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">{order.marginType}</Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>交易类型</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">{order.tradeType}</Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>订单号</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">{order.orderNumber}</Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>交易签名</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">{order.tradeSignature}</Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>交易时间</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">{order.tradeTime}</Text>
          </View>
        </View>
      </CardContent>
    </Card>
  )
}

function PositionCard({ position }: { position: PositionItem }) {
  return (
    <Card className="bg-background-secondary border border-brand-default mb-3">
      <CardContent>
        {/* All content in a single gap-2 container */}
        <View className="gap-medium">
          {/* Header: Symbol and Direction Badge */}
          <View className="flex-row items-center gap-medium">
            {/* Product Avatar */}
            <Avatar className="size-6">
              <AvatarFallback className="bg-button">
                <Text className="text-paragraph-p3 text-content-1">S</Text>
              </AvatarFallback>
            </Avatar>

            {/* Symbol and Badge */}
            <View className="flex-row items-center gap-medium">
              <Text className="text-paragraph-p2 text-content-1">{position.symbol}</Text>
              <Badge color="fall">
                <Text className="text-paragraph-p3"><Trans>做空</Trans></Text>
              </Badge>
            </View>
          </View>

          {/* Position Details - all in the same gap-2 container */}
          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>浮动盈亏</Trans>
            </Text>
            <Text
              className={`text-paragraph-p3 ${position.isProfitable ? 'text-market-rise' : 'text-market-fall'
                }`}
            >
              {position.profitLoss} USDC
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>开仓手数/价格</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">
              {position.openQuantity} 手/{position.openPrice}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>止盈/止损</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">
              {position.takeProfit}/{position.stopLoss}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>开仓时间</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">{position.openTime}</Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>持仓单号</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">{position.positionNumber}</Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>交易账号</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">{position.accountNumber}</Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>地址</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">{position.address}</Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>手续费/库存费</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">
              {position.fees} USDC/{position.inventoryFees}USDC
            </Text>
          </View>
        </View>
      </CardContent>
    </Card>
  )
}

function FundFlowCard({ item }: { item: FundFlowItem }) {
  return (
    <Card className="bg-background-secondary border border-brand-default mb-3">
      <CardContent className="p-3">
        {/* Two sections with gap-2 */}
        <View className="gap-2">
          {/* First Section: Details with gap-2 */}
          <View className="gap-2">
            {/* Time and Type Badge */}
            <View className="flex-row items-center justify-between">
              <Text className="text-paragraph-p3 text-content-4">{item.time}</Text>
              <Badge color="default">
                <Text className="text-paragraph-p3">{item.type}</Text>
              </Badge>
            </View>

            {/* Amount */}
            <View className="flex-row items-center justify-between">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>金额</Trans>
              </Text>
              <Text
                className={`text-paragraph-p3 ${item.isIncome ? 'text-market-rise' : 'text-market-fall'
                  }`}
              >
                {item.isIncome ? '' : '-'}{item.amount} USDC
              </Text>
            </View>

            {/* Balance */}
            <View className="flex-row items-center justify-between">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>余额</Trans>
              </Text>
              <Text className="text-paragraph-p3 text-content-1">{item.balance}</Text>
            </View>

            {/* Before Change */}
            <View className="flex-row items-center justify-between">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>变动前</Trans>
              </Text>
              <Text className="text-paragraph-p3 text-content-1">{item.beforeChange}</Text>
            </View>
          </View>

          {/* Second Section: Transaction Signature */}
          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>交易签名</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">{item.transactionSignature}</Text>
          </View>
        </View>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Tab Scenes
// ============================================================================

function HistoricalOrdersUnfilled() {
  return (
    <View className="p-xl">
      {mockOrders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </View>
  )
}

function HistoricalOrdersFilled() {
  return (
    <View className="p-xl">
      {mockFilledOrders.map((order) => (
        <FilledOrderCard key={order.id} order={order} />
      ))}
    </View>
  )
}

function HistoricalPositions() {
  return (
    <View className="p-xl">
      {mockPositions.map((position) => (
        <PositionCard key={position.id} position={position} />
      ))}
    </View>
  )
}

function FundFlow() {
  return (
    <View className="p-xl">
      {mockFundFlows.map((item) => (
        <FundFlowCard key={item.id} item={item} />
      ))}
    </View>
  )
}

// ============================================================================
// Main Screen
// ============================================================================

export default function TradeRecordsScreen() {
  const routes = useMemo<Route[]>(() => [
    { key: 'orders-unfilled', title: '历史委托' },
    { key: 'orders-filled', title: '成交记录' },
    { key: 'positions', title: '历史仓位' },
    { key: 'fund-flow', title: '资金流水' },
  ], [])

  const renderScene = ({ route }: { route: Route }) => {
    switch (route.key) {
      case 'orders-unfilled':
        return <HistoricalOrdersUnfilled />
      case 'orders-filled':
        return <HistoricalOrdersFilled />
      case 'positions':
        return <HistoricalPositions />
      case 'fund-flow':
        return <FundFlow />
      default:
        return null
    }
  }

  return (
    <View className="flex-1">
      <ScreenHeader
        content={<Trans>交易记录</Trans>}
      />

      <View className="flex-1">
        <SwipeableTabs
          routes={routes}
          renderScene={renderScene}
          variant="underline"
          size="md"
          tabFlex
          tabBarClassName="border-b border-brand-default px-xl"
        />
      </View>
    </View>
  );
}
