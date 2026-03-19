import { Trans } from '@lingui/react/macro'
import { useState } from 'react'

import { toast } from '@/components/ui/toast'
import { parseTradeDirectionInfo, parseTradeOrderCreateTypeInfo } from '@/helpers/parse/trade'
import { OrderCreateTypeEnum, OrderTypeEnum } from '@/options/trade/order'
import { useRootStore } from '@/stores'
import { tradeActiveTradeSymbolInfoSelector } from '@/stores/trade-slice'
import { tradeFormDataSelector } from '@/stores/trade-slice/formDataSlice'
import { userInfoActiveTradeAccountIdSelector } from '@/stores/user-slice/infoSlice'
import { createOrder } from '@/v1/services/tradeCore/order'
import { Order } from '@/v1/services/tradeCore/order/typings'
import { vibrate } from '@/v1/utils/native'
import { t } from '@lingui/core/macro'
import { BNumber } from '@mullet/utils/number'

import { useVerifyCreateOrderData } from './use-verify-order'

/**
 * 提交订单, 需要确保只有下单时候才会用单这个钩子函数
 */
export default function useSubmitOrder({ symbol }: { symbol?: string }) {
  const [isSubmitLoading, setIsLoading] = useState(false)

  const { verifyCreateOrderData } = useVerifyCreateOrderData({ symbol })

  // 提交订单
  const onSubmitOrder = async () => {
    if (!verifyCreateOrderData()) {
      return
    }

    setIsLoading(true)

    try {
      const symbolInfo = tradeActiveTradeSymbolInfoSelector(useRootStore.getState())
      if (!symbolInfo) {
        throw new Error(t`交易品种信息不存在`)
      }

      const accountId = userInfoActiveTradeAccountIdSelector(useRootStore.getState())
      if (!accountId) {
        throw new Error(t`交易账户信息不存在`)
      }

      const {
        direction,
        amount,
        orderType: type,
        limitPrice,
        slPrice,
        tpPrice,
        hasTpSl,
        marginType,
        resetFormData,
      } = tradeFormDataSelector(useRootStore.getState())
      const { isBuy } = parseTradeDirectionInfo(direction)
      const orderTypeInfo = parseTradeOrderCreateTypeInfo(type)

      const orderTypeMap: Record<OrderCreateTypeEnum, OrderTypeEnum> = {
        [OrderCreateTypeEnum.MARKET_ORDER]: OrderTypeEnum.MARKET_ORDER,
        [OrderCreateTypeEnum.LIMIT_ORDER]: isBuy ? OrderTypeEnum.LIMIT_BUY_ORDER : OrderTypeEnum.LIMIT_SELL_ORDER,
        [OrderCreateTypeEnum.STOP_LIMIT_ORDER]: isBuy
          ? OrderTypeEnum.STOP_LOSS_MARKET_BUY_ORDER
          : OrderTypeEnum.STOP_LOSS_MARKET_SELL_ORDER,
      }

      const orderType = orderTypeMap[type]
      if (!orderType) {
        throw new Error(t`订单类型不存在`)
      }

      const orderParams: Order.CreateOrder = {
        tradeAccountId: accountId,
        symbol: symbolInfo.symbol,
        buySell: direction,
        orderVolume: amount,
        type: orderType,
        marginType: marginType,
      }

      if (!orderTypeInfo.isMarket) {
        orderParams.limitPrice = limitPrice
      }

      if (hasTpSl) {
        if (BNumber.from(tpPrice).gt(0)) {
          orderParams.takeProfit = BNumber.from(tpPrice).toNumber()
        }
        if (BNumber.from(slPrice).gt(0)) {
          orderParams.stopLoss = BNumber.from(slPrice).toNumber()
        }
      }

      const res = await createOrder(orderParams)

      if (res.success) {
        vibrate(10)
        resetFormData()
        toast.success(<Trans>下单成功</Trans>)
      }
    } catch (error: any) {
      toast.error(error?.message || <Trans>下单失败</Trans>)
      console.log('onSubmitOrder error', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isSubmitLoading,
    onSubmitOrder,
  }
}
