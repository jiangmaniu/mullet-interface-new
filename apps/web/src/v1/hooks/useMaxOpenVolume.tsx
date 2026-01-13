import { useState } from 'react'
import { useDebounceEffect } from 'ahooks'

import { useStores } from '@/v1/provider/mobxProvider'

import useTrade from './useTrade'

type IProps = {
  /**是否限制请求 */
  isLimit?: boolean
}

/**根据接口计算可开手数 */
export default function useMaxOpenVolume(props?: IProps) {
  const { isLimit = false } = props || {}
  const { orderParams, availableMargin } = useTrade()
  const { trade } = useStores()
  const accountGroupPrecision = trade.currentAccountInfo?.currencyDecimal || 2

  // ===== 使用接口计算预估保证金
  const [maxOpenVolume, setMaxOpenVolume] = useState<any>('')
  const [expectedMargin, setExpectedMargin] = useState<any>('')

  useDebounceEffect(
    () => {
      if (isLimit) return
      trade
        .calcMargin({
          ...orderParams,
          // 先计算1手的预估保证金
          orderVolume: 1,
        })
        .then((res: any) => {
          setExpectedMargin(Number(res))
        })
    },
    [orderParams, isLimit],
    {
      wait: 1000,
    },
  )

  useDebounceEffect(
    () => {
      setMaxOpenVolume(expectedMargin ? availableMargin / expectedMargin : 0)
    },
    [expectedMargin, availableMargin],
    {
      wait: 1000,
    },
  )

  return maxOpenVolume
}
