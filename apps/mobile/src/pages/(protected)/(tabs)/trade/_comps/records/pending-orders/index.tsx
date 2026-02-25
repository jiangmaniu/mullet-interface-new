

import { useState, useCallback, useEffect } from 'react'
import { View, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Text } from '@/components/ui/text'
import {
  IconifyNavArrowDown,
  IconifyPage,
  IconNavArrowSuperior,
  IconNavArrowDown,
  IconifyNavArrowRight,
} from '@/components/ui/icons'
import { EmptyState } from '@/components/states/empty-state'
import { Badge } from '@/components/ui/badge'
import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'


interface PendingOrder {
  id: string
  symbol: string
  direction: 'long' | 'short'
  quantity: number
  orderPrice: number
  markPrice: number
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
        <Pressable onPress={onCancel}>
          <Text className="text-paragraph-p3 text-content-4">
            <Trans>取消</Trans>
          </Text>
        </Pressable>
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

// ============ Main Trade Component ============


// Mock pending orders data
export const MOCK_PENDING_ORDERS: PendingOrder[] = [
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

export const TradePendingOrders = observer(() => {
  return (
    <>  {MOCK_PENDING_ORDERS.length === 0 ? (
      <EmptyState message={<Trans>暂无订单</Trans>} />
    ) : (
      MOCK_PENDING_ORDERS.map((order) => (
        <PendingOrderItem
          key={order.id}
          order={order}
          onCancel={() => console.log('Cancel order:', order.id)}
        />
      ))
    )}</>
  )
})
