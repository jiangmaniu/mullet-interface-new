import { View } from 'react-native'
import { Trans } from '@lingui/react/macro'
import { Text } from '@/components/ui/text'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

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

// Mock data
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

export function HistoricalPositions() {
  return (
    <View className="p-xl">
      {mockPositions.map((position) => (
        <PositionCard key={position.id} position={position} />
      ))}
    </View>
  )
}
