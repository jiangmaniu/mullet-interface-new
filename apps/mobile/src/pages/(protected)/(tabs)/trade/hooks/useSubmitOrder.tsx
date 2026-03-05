import { Trans } from '@lingui/react/macro'
import { useState } from 'react'

import { toast } from '@/components/ui/toast'
import useOpenVolumn from '@/v1/hooks/trade/useOpenVolumn'
import useOrderParams from '@/v1/hooks/trade/useOrderParams'
import useQuote from '@/v1/hooks/trade/useQoute'
import useSpSl from '@/v1/hooks/trade/useSpSl'
import { useStores } from '@/v1/provider/mobxProvider'
import { createOrder } from '@/v1/services/tradeCore/order'
import { vibrate } from '@/v1/utils/native'

/**
 * 提交订单, 需要确保只有下单时候才会用单这个钩子函数
 */
export default function useSubmitOrder() {
  const { trade } = useStores()
  const { orderPrice, orderVolume, setOrderVolume, setOrderPrice } = trade

  const { vmin, isStopLossLimit, isLimit } = useQuote()
  const { slFlag, spFlag, sl, sp } = useSpSl()

  const orderParams = useOrderParams()
  const { maxOpenVolume } = useOpenVolumn()
  // 提交订单之前校验
  const onCheckSubmit = () => {
    const count = Number(orderVolume)
    if (!count) {
      toast.warning(<Trans>请输入手数</Trans>)
      return false
    }

    // 限价、停损单
    if ((isStopLossLimit || isLimit) && !orderPrice) {
      toast.warning(<Trans>请输入价格</Trans>)
      return false
    }

    if (!Number(maxOpenVolume)) {
      toast.warning(<Trans>余额不足</Trans>)
      return false
    }

    const spSlErrorMsg = <Trans>止盈止损设置错误</Trans>

    if ((slFlag && sl) || (spFlag && sp)) {
      toast.warning(spSlErrorMsg)
      return false
    }
    return true
  }

  const [isSubmitLoading, setIsLoading] = useState(false)

  // 提交订单
  const onSubmitOrder = async () => {
    if (!onCheckSubmit()) {
      return
    }

    setIsLoading(true)

    try {
      const res = await createOrder(orderParams)

      if (res.success) {
        vibrate(10)
        setOrderVolume(vmin)
        setOrderPrice('')
        trade.resetSpSl()
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
    onCheckSubmit,
  }
}
