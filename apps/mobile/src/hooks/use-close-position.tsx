import { Trans } from '@lingui/react/macro'
import { useMutation } from '@tanstack/react-query'

import { toast } from '@/components/ui/toast'
import { useI18n } from '@/hooks/use-i18n'
import { OrderTypeEnum } from '@/options/trade/order'
import { TradePositionDirectionEnum } from '@/options/trade/position'
import { parseTradePositionInfo } from '@/pages/(protected)/(trade)/_helpers/position'
import { useRootStore } from '@/stores'
import { useStores } from '@/v1/provider/mobxProvider'
import { createOrder } from '@/v1/services/tradeCore/order'
import { Order } from '@/v1/services/tradeCore/order/typings'
import { msg } from '@lingui/core/macro'

type ClosePositionParams = {
  /** 仓位信息 */
  position: Order.BgaOrderPageListItem
  /** 平仓数量，默认为全部平仓 */
  orderVolume?: string
}

type ClosePositionDataQueryParams = Pick<
  Order.CreateOrder,
  'orderVolume' | 'symbol' | 'tradeAccountId' | 'type' | 'buySell' | 'executeOrderId'
>

/**
 * 平仓 Hook
 *
 * @example
 * ```tsx
 * const { mutate: closePosition, isPending } = useClosePosition()
 *
 * // 全部平仓
 * closePosition({ position })
 *
 * // 部分平仓
 * closePosition({ position, orderVolume: '0.5' })
 * ```
 */
export function useClosePosition() {
  const { trade, user } = useStores()
  const { renderLinguiMsg } = useI18n()

  return useMutation({
    mutationFn: async ({ position, orderVolume }: ClosePositionParams) => {
      const positionInfo = parseTradePositionInfo(position)

      if (!positionInfo?.symbol) {
        throw new Error(renderLinguiMsg(msg`未知的仓位，无法平仓`))
      }

      const params: ClosePositionDataQueryParams = {
        symbol: positionInfo?.symbol,
        // 如果没有传入 orderVolume，则全部平仓
        orderVolume: orderVolume || position.orderVolume,
        tradeAccountId: position.tradeAccountId,
        type: OrderTypeEnum.MARKET_ORDER,
        buySell: positionInfo?.isBuy ? TradePositionDirectionEnum.SELL : TradePositionDirectionEnum.BUY,
        executeOrderId: positionInfo?.id,
      }

      const res = await createOrder(params)

      if (!res.success) {
        throw new Error(res.message || renderLinguiMsg(msg`平仓失败`))
      }

      return res
    },
    onSuccess: async () => {
      // 更新账户余额信息和仓位列表
      await Promise.all([
        trade.getPositionList(),
        useRootStore.getState().trade.position.fetch(),
        user.fetchUserInfo(),
        useRootStore.getState().user.info.fetchLoginClientInfo(),
      ])

      toast.success(<Trans>平仓成功</Trans>)
    },
    onError: (error: any) => {
      console.error('平仓失败:', error)
      toast.error(error.message || renderLinguiMsg(msg`平仓失败`))
    },
  })
}
