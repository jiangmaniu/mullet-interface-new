import { View } from 'react-native'
import { Trans } from '@lingui/react/macro'
import { Text } from '@/components/ui/text'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

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

// Mock data
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

export function HistoricalOrdersUnfilled() {
  return (
    <View className="p-xl">
      {mockOrders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </View>
  )
}
