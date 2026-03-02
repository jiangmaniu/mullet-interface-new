import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, View } from 'react-native'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CollapsibleFlatList,
} from '@/components/ui/collapsible-tab'
import {
  IconifyNavArrowRight,
} from '@/components/ui/icons'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { OrderMarginTypeEnum } from '@/options/trade/order'
import { getImgSource } from '@/utils/img'
import { useStores } from '@/v1/provider/mobxProvider'
import { Order } from '@/v1/services/tradeCore/order/typings'
import {
  newCalcYieldRate,
  subscribeCurrentAndPositionSymbol,
  useCovertProfitCallback,
} from '@/v1/utils/wsUtil'
import { BNumber } from '@mullet/utils/number'
import * as AccordionPrimitive from '@rn-primitives/accordion'
import { PositionCurrentPrice } from '../../common/position-current-price'
import { TradePositionDirectionEnum } from '@/options/trade/position'
import { useI18n } from '@/hooks/use-i18n'
import { LOTS_UNIT_LABEL } from '@/options/trade/unit'
import { EmptyState } from '@/components/states/empty-state'

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
    openPrice: 187.0,
    markPrice: 186.0,
    profit: 152.0,
    profitPercent: 15.0,
    marginRate: 10.04,
    margin: 10.0,
    fee: 1.0,
    storageFee: 1.0,
  },
  {
    id: '2',
    symbol: 'SOL-USDC',
    direction: 'short',
    quantity: 1.0,
    openPrice: 187.0,
    markPrice: 186.0,
    profit: 152.0,
    profitPercent: 15.0,
    marginRate: 10.04,
    margin: 10.0,
    fee: 1.0,
    storageFee: 1.0,
  },
]

export const TradePositions = observer(() => {
  const { trade } = useStores()
  const positionList = trade.positionList
  const currentAccountInfo = trade.currentAccountInfo
  useEffect(() => {
    if (!currentAccountInfo.id) return
    trade.getPositionList(true).catch((err) => { })
  }, [currentAccountInfo.id])

  const positionListLoading = trade.positionListLoading

  const refetch = async () => {
    const res = await trade.getPositionList(true)
    return res.success
  }


  const renderEmpty = () => {
    if (positionListLoading) {
      return (
        <View className="py-3xl items-center">
          <ActivityIndicator />
        </View>
      )
    }
    return (
      <View className="py-[60px] items-center">
        <EmptyState message={<Trans>暂无成交记录</Trans>} />
      </View>
    )
  }

  return (
    <>
      <CollapsibleFlatList
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        data={positionList}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item: position }) => <PositionItem position={position} />}
        ItemSeparatorComponent={() => <View className="h-xl" />}
        ListEmptyComponent={renderEmpty}
        onEndReachedThreshold={0.3}
        refreshing={positionListLoading}
        onRefresh={() => refetch()}
        style={{ paddingTop: 16 }}
      />
    </>
  )
})

// ============ PositionItem ============
interface PositionItemProps {
  position: Order.BgaOrderPageListItem
  // onStopLoss?: () => void
  // onClosePosition?: () => void
}

const PositionItemContent = observer(({ position }: PositionItemProps) => {
  const { isExpanded } = AccordionPrimitive.useItemContext()
  const { trade } = useStores()
  const currentAccountInfo = trade.currentAccountInfo
  const covertProfit = useCovertProfitCallback(false)
  const { renderLinguiMsg } = useI18n()

  const calcMargin =
    position?.marginType === OrderMarginTypeEnum.CROSS_MARGIN ? position?.orderMargin : position?.orderBaseMargin
  const positionProfit = covertProfit(position)
  const yieldRate = newCalcYieldRate(positionProfit, calcMargin)

  const profitColor = BNumber.from(positionProfit)?.gt(0)
    ? 'text-market-rise'
    : BNumber.from(positionProfit)?.lt(0)
      ? 'text-market-fall'
      : 'text-content-1'

  return (
    <View className="gap-xl">
      {/* Header with trigger */}
      <AccordionTrigger className="px-xl py-0">
        <Pressable
          onPress={() => {
            if (!position.symbol) return
            trade.switchSymbol(position.symbol)
            subscribeCurrentAndPositionSymbol({ cover: true })
          }}
        >
          <View className="flex-1 flex-row items-center gap-[10px]">
            <AvatarImage source={getImgSource(position.imgUrl)} className="size-6 rounded-full"></AvatarImage>

            <Text className="text-important-1 text-content-1">{position.symbol}</Text>
            <Badge color={position.buySell === TradePositionDirectionEnum.BUY ? 'rise' : 'fall'}>
              <Text>{position.buySell === TradePositionDirectionEnum.BUY ? <Trans>做多</Trans> : <Trans>做空</Trans>}</Text>
            </Badge>
            <IconifyNavArrowRight width={16} height={16} className="text-content-1" />
          </View>
        </Pressable>
      </AccordionTrigger>

      {/* Fixed: Row 1 - 浮动盈亏, 收益率, 数量 (数量仅展开时显示) */}
      <View className="px-xl">
        <View className="flex-row justify-between">
          <View className="w-[100px]">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>浮动盈亏({currentAccountInfo.currencyUnit})</Trans>
            </Text>
            <Text className={`text-paragraph-p2 ${profitColor}`}>
              {BNumber.toFormatNumber(positionProfit, { forceSign: true, volScale: currentAccountInfo.currencyDecimal })}
            </Text>
          </View>
          <View className={cn('w-[100px]', !isExpanded && 'items-end')}>
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>收益率</Trans>
            </Text>
            <Text className={`text-paragraph-p2 ${profitColor}`}>
              {BNumber.toFormatPercent(yieldRate, { forceSign: true, isRaw: false })}
            </Text>
          </View>
          {isExpanded && (
            <View className="w-[100px] items-end">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>数量({renderLinguiMsg(LOTS_UNIT_LABEL)})</Trans>
              </Text>
              <Text className="text-paragraph-p2 text-content-2">{BNumber.toFormatNumber(position.orderVolume, { volScale: position.symbolDecimal })}</Text>
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
              <Trans>保证金率</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">{BNumber.toFormatPercent(trade.getMarginRateInfo(position)?.marginRate, { isRaw: false })}</Text>
          </View>
          <View className="w-[100px]">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>保证金({currentAccountInfo.currencyUnit})</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">
              {BNumber.toFormatNumber(
                position.marginType === OrderMarginTypeEnum.CROSS_MARGIN
                  ? position?.orderBaseMargin
                  : position?.orderMargin,
                { volScale: currentAccountInfo.currencyDecimal },
              )}
            </Text>
          </View>
          <View className="w-[100px] items-end">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>开仓价</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">{
              BNumber.toFormatNumber(position.startPrice, { volScale: position.symbolDecimal })}</Text>
          </View>
        </View>

        {/* Row 3: 标记价, 手续费, 库存费 */}
        <View className="flex-row justify-between">
          <View className="w-[100px]">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>标记价(USDC)</Trans>
            </Text>
            <PositionCurrentPrice position={position} className={'text-paragraph-p3'} />
          </View>
          <View className="w-[100px]">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>手续费({currentAccountInfo.currencyUnit})</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">
              {BNumber.toFormatNumber(position.handlingFees, { volScale: currentAccountInfo.currencyDecimal })}</Text>
          </View>
          <View className="w-[100px] items-end">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>库存费({currentAccountInfo.currencyUnit})</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">
              {BNumber.toFormatNumber(position.interestFees, { volScale: currentAccountInfo.currencyDecimal })}</Text>
          </View>
        </View>
      </AccordionContent>

      {/* Fixed: Action Buttons (always visible) */}
      <View className="px-xl">
        <View className="gap-xl flex-row">
          <Button
            variant="solid"
            size="md"
            className="flex-1"
          // onPress={onStopLoss}
          >
            <Text>
              <Trans>止盈止损</Trans>
            </Text>
          </Button>
          <Button
            variant="solid"
            size="md"
            className="flex-1"
          // onPress={onClosePosition}
          >
            <Text>
              <Trans>平仓</Trans>
            </Text>
          </Button>
        </View>
      </View>
    </View>
  )
})

function PositionItem({ position }: PositionItemProps) {
  return (
    <Accordion type="multiple" className="border-b-0">
      <AccordionItem value={position.id} className="py-xl border-b-0">
        <PositionItemContent
          position={position}
        // onStopLoss={onStopLoss}
        // onClosePosition={onClosePosition}
        />
      </AccordionItem>
    </Accordion>
  )
}
