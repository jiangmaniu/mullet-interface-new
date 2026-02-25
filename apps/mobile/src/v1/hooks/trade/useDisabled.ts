import { useStores } from '@/v1/provider/mobxProvider'

import useSpSl from './useSpSl'

export default function useDisabled() {
  const { trade } = useStores()
  const { spFlag, slFlag } = useSpSl()

  const disabledBtnByCondition = spFlag || slFlag

  // 禁用交易按钮
  const disabledBtn = trade.disabledTrade() || trade.disabledTradeAction() || disabledBtnByCondition

  // 禁用交易
  const disabledTrade = trade.disabledTrade()

  // 禁用交易输入框
  const disabledInput = trade.disabledTradeAction()

  return {
    disabledBtn,
    disabledTrade,
    disabledInput,
  }
}
