import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import { ActivityIndicator, Pressable, View } from 'react-native'
import { useShallow } from 'zustand/react/shallow'

import { EmptyState } from '@/components/states/empty-state'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CollapsibleFlatList } from '@/components/ui/collapsible-tab'
import { DrawerRef } from '@/components/ui/drawer'
import { IconifyNavArrowRight } from '@/components/ui/icons'
import { Text } from '@/components/ui/text'
import { renderFormatSymbolName } from '@/helpers/symbol'
import { useMarketPlatformPrice } from '@/hooks/market/use-market-quote'
import { useClosePosition } from '@/hooks/use-close-position'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { LOTS_UNIT_LABEL } from '@/options/trade/unit'
import { parseTradePositionInfo } from '@/pages/(protected)/(trade)/_helpers/position'
import { useTradeSwitchActiveSymbol } from '@/pages/(protected)/(trade)/_hooks/use-trade-switch-symbol'
import { useRootStore } from '@/stores'
import { tradeActiveTradeSymbolSelector } from '@/stores/trade-slice'
import {
  createPositionItemSelector,
  tradePositionIdListSelector,
  tradePositionLoadingSelector,
} from '@/stores/trade-slice/position-slice'
import {
  userInfoActiveTradeAccountCurrencyInfoSelector,
  userInfoActiveTradeAccountIdSelector,
} from '@/stores/user-slice/infoSlice'
import { getImgSource } from '@/utils/img'
import { useStores } from '@/v1/provider/mobxProvider'
import { BNumber } from '@mullet/utils/number'
import * as AccordionPrimitive from '@rn-primitives/accordion'

import { getPositionGrossPnlInfo, getPositionPnlYieldRateInfo } from '../../../_hooks/trade/use-position-pnl'
import { PositionCurrentPrice } from '../../common/position-current-price'
import { ClosePositionDrawer } from './close-position-drawer'
import { PositionTpSlDrawer } from './position-tp-sl-drawer'

// ============ 列表容器：只订阅 idList ============

export const TradePositions = () => {
  const positionIdList = useRootStore(useShallow(tradePositionIdListSelector))
  const positionListLoading = useRootStore(tradePositionLoadingSelector)
  const currentAccountId = useRootStore(userInfoActiveTradeAccountIdSelector)

  useEffect(() => {
    if (!currentAccountId) return
    useRootStore
      .getState()
      .trade.position.fetch()
      .catch(() => {})
  }, [currentAccountId])

  const refetch = async () => {
    const res = await useRootStore.getState().trade.position.fetch()
    return res?.success
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
      <View className="items-center py-[60px]">
        <EmptyState message={<Trans>暂无仓位记录</Trans>} />
      </View>
    )
  }

  return (
    <CollapsibleFlatList
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 24 }}
      data={positionIdList}
      keyExtractor={(id) => id}
      renderItem={({ item: id }) => <PositionItemById id={id} />}
      ItemSeparatorComponent={() => <View className="h-xl" />}
      ListEmptyComponent={renderEmpty}
      onEndReachedThreshold={0.3}
      refreshing={positionListLoading}
      onRefresh={() => refetch()}
      style={{ paddingTop: 16 }}
    />
  )
}

// ============ 按 ID 精准订阅的 Item 包装 ============

const PositionItemById = ({ id }: { id: string }) => {
  const position = useRootStore(createPositionItemSelector(id))
  if (!position) return null

  return (
    <Accordion type="multiple" className="border-b-0">
      <AccordionItem value={id} className="py-xl border-b-0">
        <PositionItemContent position={position} />
      </AccordionItem>
    </Accordion>
  )
}

// ============ PositionItemContent：保留 observer 因为依赖 MobX trade.getMarginRateInfo ============

const PositionItemContent = observer(
  ({ position }: { position: NonNullable<ReturnType<ReturnType<typeof createPositionItemSelector>>> }) => {
    const positionInfo = parseTradePositionInfo(position)
    const { isExpanded } = AccordionPrimitive.useItemContext()
    const { trade } = useStores()
    const currentAccountCurrencyInfo = useRootStore(useShallow(userInfoActiveTradeAccountCurrencyInfoSelector))
    const { renderLinguiMsg } = useI18n()

    const currentPrice = useMarketPlatformPrice(positionInfo?.symbol, positionInfo?.direction)

    // 浮动盈亏（换汇为账户本币）
    const grossPnlInfo = getPositionGrossPnlInfo({
      positionInfo,
      closePrice: currentPrice,
      convertCurrency: true,
    })

    // 收益率
    const yieldRateInfo = getPositionPnlYieldRateInfo({
      positionInfo,
      pnl: grossPnlInfo?.pnl,
    })

    const profitColor = grossPnlInfo?.isProfit
      ? 'text-market-rise'
      : grossPnlInfo?.isLoss
        ? 'text-market-fall'
        : 'text-content-1'

    const activeSymbol = useRootStore(tradeActiveTradeSymbolSelector)
    const { switchTradeActiveSymbol } = useTradeSwitchActiveSymbol()

    const closePositionDrawerRef = useRef<DrawerRef>(null)
    const positionTpSlDrawerRef = useRef<DrawerRef>(null)

    // 获取平仓确认设置
    const closeConfirmation = useRootStore((s) => s.trade.setting.closeConfirmation)

    // 使用平仓 hook
    const { mutate: closePosition, isPending: isClosingPosition } = useClosePosition()

    // 处理平仓按钮点击
    const handleClosePosition = () => {
      if (closeConfirmation) {
        closePositionDrawerRef.current?.open()
      } else {
        closePosition({ position })
      }
    }

    return (
      <View className="gap-xl">
        {/* Header with trigger */}
        <AccordionTrigger className="px-xl py-0">
          <Pressable
            onPress={() => {
              if (!position.symbol || activeSymbol === position.symbol) return
              switchTradeActiveSymbol(position.symbol)
            }}
          >
            <View className="flex-1 flex-row items-center gap-[10px]">
              <AvatarImage source={getImgSource(position.imgUrl)} className="size-6 rounded-full"></AvatarImage>

              <Text className="text-important-1 text-content-1">{renderFormatSymbolName(position)}</Text>
              <Badge color={positionInfo?.isBuy ? 'rise' : 'fall'}>
                <Text>{positionInfo?.isBuy ? <Trans>做多</Trans> : <Trans>做空</Trans>}</Text>
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
                <Trans>浮动盈亏({currentAccountCurrencyInfo?.currencyUnit})</Trans>
              </Text>
              <Text className={`text-paragraph-p2 ${profitColor}`}>
                {BNumber.toFormatNumber(grossPnlInfo?.pnl, {
                  forceSign: true,
                  positive: false,
                  volScale: currentAccountCurrencyInfo?.currencyDecimal,
                })}
              </Text>
            </View>
            <View className={cn('w-[100px]', !isExpanded && 'items-end')}>
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>收益率</Trans>
              </Text>
              <Text className={`text-paragraph-p2 ${profitColor}`}>
                {BNumber.toFormatPercent(yieldRateInfo?.ratio, { forceSign: true })}
              </Text>
            </View>
            {isExpanded && (
              <View className="w-[100px] items-end">
                <Text className="text-paragraph-p3 text-content-4">
                  <Trans>数量({renderLinguiMsg(LOTS_UNIT_LABEL)})</Trans>
                </Text>
                <Text className="text-paragraph-p2 text-content-2">
                  {BNumber.toFormatNumber(position.orderVolume, { volScale: positionInfo?.lotsVolScale })}
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
                <Trans>保证金率</Trans>
              </Text>
              <Text className="text-paragraph-p3 text-content-1">
                {BNumber.toFormatPercent(trade.getMarginRateInfo(position)?.marginRate, { isRaw: false })}
              </Text>
            </View>
            <View className="w-[100px]">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>保证金({currentAccountCurrencyInfo?.currencyUnit})</Trans>
              </Text>
              <Text className="text-paragraph-p3 text-content-1">
                {BNumber.toFormatNumber(positionInfo?.marginByType, {
                  volScale: currentAccountCurrencyInfo?.currencyDecimal,
                })}
              </Text>
            </View>
            <View className="w-[100px] items-end">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>开仓价</Trans>
              </Text>
              <Text className="text-paragraph-p3 text-content-1">
                {BNumber.toFormatNumber(position.startPrice, { volScale: position.symbolDecimal })}
              </Text>
            </View>
          </View>

          {/* Row 3: 标记价, 手续费, 库存费 */}
          <View className="flex-row justify-between">
            <View className="w-[100px]">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>标记价</Trans>
              </Text>
              <PositionCurrentPrice info={position} className={'text-paragraph-p3'} />
            </View>
            <View className="w-[100px]">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>手续费({currentAccountCurrencyInfo?.currencyUnit})</Trans>
              </Text>
              <Text className="text-paragraph-p3 text-content-1">
                {BNumber.toFormatNumber(position.handlingFees, {
                  volScale: currentAccountCurrencyInfo?.currencyDecimal,
                  positive: false,
                })}
              </Text>
            </View>
            <View className="w-[100px] items-end">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>库存费({currentAccountCurrencyInfo?.currencyUnit})</Trans>
              </Text>
              <Text className="text-paragraph-p3 text-content-1">
                {BNumber.toFormatNumber(position.interestFees, {
                  volScale: currentAccountCurrencyInfo?.currencyDecimal,
                  positive: false,
                })}
              </Text>
            </View>
          </View>
        </AccordionContent>

        {/* Fixed: Action Buttons (always visible) */}
        <View className="px-xl">
          <View className="gap-xl flex-row">
            <>
              <Button
                variant="solid"
                size="md"
                className="flex-1"
                onPress={() => positionTpSlDrawerRef.current?.open()}
                disabled={isClosingPosition}
              >
                <Text>
                  <Trans>止盈止损</Trans>
                </Text>
              </Button>

              <PositionTpSlDrawer position={position} ref={positionTpSlDrawerRef} />
            </>

            <>
              <Button
                variant="solid"
                size="md"
                className="flex-1"
                onPress={handleClosePosition}
                loading={isClosingPosition}
              >
                <Text>
                  <Trans>平仓</Trans>
                </Text>
              </Button>
              <ClosePositionDrawer position={position} ref={closePositionDrawerRef} />
            </>
          </View>
        </View>
      </View>
    )
  },
)
