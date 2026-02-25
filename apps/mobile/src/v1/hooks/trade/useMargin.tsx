
import { useEffect, useState } from 'react'
import useOrderParams from './useOrderParams'
import { useStores } from '@/v1/provider/mobxProvider'
import { formatNum } from '@/v1/utils'

export default function useMargin() {
  const { trade } = useStores()
  const orderParams = useOrderParams()

  // ===== 使用接口计算预估保证金
  const [expectedMargin, setExpectedMargin] = useState<any>('')

  // TODO: 不是 orderParams 变化就请求，这里需要优化
  useEffect(() => {
    if (!orderParams.orderVolume) return
    if (orderParams.limitPrice && Number(orderParams.limitPrice) <= 0) return

    if (Number(orderParams.orderVolume) > 0) {
      trade.calcMargin(orderParams).then((res: any) => {
        setExpectedMargin(res)
      })
    }
  }, [orderParams])

  return expectedMargin
}
