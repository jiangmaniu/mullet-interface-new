
import { useState, useCallback, useEffect } from 'react'
import { View, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Text } from '@/components/ui/text'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import {
  IconifyActivity,
  IconifyCandlestickChart,
  IconifyMoreHoriz,
  IconifyNavArrowDownSolid,
  IconifyNavArrowDown,
  IconifyUserCircle,
  IconifyPlusCircle,
  IconifyPage,
  IconNavArrowSuperior,
  IconNavArrowDown,
  IconifyNavArrowRight,
} from '@/components/ui/icons'
import { EmptyState } from '@/components/states/empty-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScreenHeader } from '@/components/ui/screen-header'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Trans } from '@lingui/react/macro'
import { IconButton, Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CollapsibleTab,
  CollapsibleTabScene,
  CollapsibleStickyHeader,
  CollapsibleStickyNavBar,
  CollapsibleStickyContent,
  CollapsibleScrollView,
} from '@/components/ui/collapsible-tab'
import { Input } from '@/components/ui/input'
import { t } from '@/locales/i18n'
import { Switch } from '@/components/ui/switch'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import * as AccordionPrimitive from '@rn-primitives/accordion'
import {
  AccountSwitchDrawer,
  type Account,
} from '@/components/drawers/account-switch-drawer'
import { toast } from '@/components/ui/toast'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { KeyboardAwareContainer } from '@/components/ui/keyboard-aware-container'
import { useTradeSettingsStore } from '@/stores/trade-settings'
import { getImgSource } from '@/utils/img'
import { useStores } from '@/v1/provider/mobxProvider'
import { observer } from 'mobx-react-lite'
import { BNumber } from '@mullet/utils/number'
import { useGetCurrentQuoteCallback } from '@/v1/utils/wsUtil'
import { parseRiseAndFallInfo } from '@/helpers/market'


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


// Mock positions data
export const MOCK_POSITIONS: Position[] = [
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
    direction: 'short',
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


export const TradePositions = observer(() => {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [isStopProfitLossDrawerOpen, setIsStopProfitLossDrawerOpen] = useState(false)

  return (
    <>
      {MOCK_POSITIONS.length === 0 ? (
        <EmptyState message={<Trans>暂无资产</Trans>} />
      ) : (
        MOCK_POSITIONS.map((position) => (
          <PositionItem
            key={position.id}
            position={position}
            onStopLoss={() => {
              setSelectedPosition(position)
              setIsStopProfitLossDrawerOpen(true)
            }}
          // onClosePosition={() => handleClosePosition(position)}
          />
        ))
      )}</>

  )
})


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
