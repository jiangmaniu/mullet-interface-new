import { Trans } from '@lingui/react/macro'
import { useState } from 'react'

import { toast } from '@/components/ui/toast'
import { useRootStore } from '@/stores'
import { tradeActiveTradeSymbolInfoSelector } from '@/stores/trade-slice'
import { tradeFormDataSelector } from '@/stores/trade-slice/formDataSlice'
import { userInfoActiveTradeAccountIdSelector } from '@/stores/user-slice/infoSlice'
import { createOrder } from '@/v1/services/tradeCore/order'
import { vibrate } from '@/v1/utils/native'

import { buildOrderParams } from '../_helpers/build-order-params'
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
      const accountId = userInfoActiveTradeAccountIdSelector(useRootStore.getState())
      const { direction, amount, orderType, limitPrice, slPrice, tpPrice, hasTpSl, marginType, resetFormData } =
        tradeFormDataSelector(useRootStore.getState())

      const orderParams = buildOrderParams({
        accountId,
        symbol: symbolInfo?.symbol,
        direction,
        amount,
        orderType,
        limitPrice,
        slPrice,
        tpPrice,
        hasTpSl,
        marginType,
      })

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
