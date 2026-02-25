import { useLoading } from '@/context/loadingProvider'
import { useStores } from '@/context/mobxProvider'
import { useI18n } from '@/i18n'
import { message } from '@/utils/message'
import { vibrate } from '@/utils/native'
import useOrderParams from './useOrderParams'
import useOpenVolumn from './useOpenVolumn'
import useQuote from './useQoute'
import useSpSl from './useSpSl'

/**
 * 提交订单, 需要确保只有下单时候才会用单这个钩子函数
 */
export default function useSubmitOrder() {
  const { trade } = useStores()
  const { orderPrice, orderVolume, setOrderVolume, setOrderPrice } = trade
  const { showLoading, hideLoading } = useLoading()
  const { t } = useI18n()

  const { vmin, isStopLossLimit, isLimit } = useQuote()
  const { slFlag, spFlag, sl, sp } = useSpSl()

  const orderParams = useOrderParams()

  const onSubmitEnd = () => {
    hideLoading()
  }

  const { maxOpenVolume } = useOpenVolumn()
  // 提交订单之前校验
  const onCheckSubmit = () => {
    const count = Number(orderVolume)
    if (!count) {
      message.info(t('pages.trade.Input Volume'))
      onSubmitEnd()
      return false
    }
    // 限价、停损单
    if ((isStopLossLimit || isLimit) && !orderPrice) {
      onSubmitEnd()
      message.info(t('pages.trade.Input Price'))
      return false
    }

    if (!Number(maxOpenVolume)) {
      onSubmitEnd()
      message.info(t('pages.trade.Balance Not Enough'))
      return false
    }

    const spSlErrorMsg = t('pages.trade.SpSl Set Error')

    if (slFlag && sl) {
      onSubmitEnd()
      message.info(spSlErrorMsg)
      return false
    }
    if (spFlag && sp) {
      onSubmitEnd()
      message.info(spSlErrorMsg)
      return false
    }
    return true
  }

  // 提交订单
  const onSubmitOrder = async () => {
    showLoading()

    if (!onCheckSubmit()) {
      return
    }

    try {
      const res = await trade.createOrder(orderParams)

      if (res.success) {
        vibrate(10)
        // resetSpSl()
        setOrderVolume(vmin)
        setOrderPrice('')
        trade.resetSpSl()

        if (res.state === 0) {
          message.info(t('pages.trade.Open Position Success'))
        } else if (res.state === 1) {
          message.info(t('pages.trade.Close Position Success'))
        } else if (res.state === 2) {
          message.info(t('pages.trade.Pending Success'))
        }
      }
    } catch (error) {
      console.log('onSubmitOrder error', error)
    } finally {
      onSubmitEnd()
    }
  }

  return {
    onSubmitOrder,
    onCheckSubmit
  }
}
