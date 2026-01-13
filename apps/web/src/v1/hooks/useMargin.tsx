import { useState } from 'react'
import { useDebounceEffect } from 'ahooks'

import { useStores } from '@/v1/provider/mobxProvider'
import { formatNum } from '@/v1/utils'

import useTrade from './useTrade'

type IProps = {
  /**是否限制请求 */
  isLimit?: boolean
}

export default function useMargin(props?: IProps) {
  const { isLimit = false } = props || {}
  const { orderParams } = useTrade()
  const { trade } = useStores()
  const accountGroupPrecision = trade.currentAccountInfo?.currencyDecimal || 2

  // ===== 使用接口计算预估保证金
  const [expectedMargin, setExpectedMargin] = useState<any>('')

  useDebounceEffect(
    () => {
      if (isLimit) return
      trade.calcMargin(orderParams).then((res: any) => {
        setExpectedMargin(res)
      })
    },
    [orderParams, isLimit],
    {
      wait: 1000,
    },
  )

  return expectedMargin
}
