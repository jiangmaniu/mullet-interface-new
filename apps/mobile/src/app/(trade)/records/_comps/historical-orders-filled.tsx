import { View } from 'react-native'
import { Trans } from '@lingui/react/macro'
import { Text } from '@/components/ui/text'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

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

// Mock data
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

export function HistoricalOrdersFilled() {
  return (
    <View className="p-xl">
      {mockFilledOrders.map((order) => (
        <FilledOrderCard key={order.id} order={order} />
      ))}
    </View>
  )
}
