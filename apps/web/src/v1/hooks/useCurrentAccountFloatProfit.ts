import { useStores } from '@/context/mobxProvider'
import { toFixed } from '@/utils'
import { covertProfit } from '@/utils/wsUtil'
import { useMemo } from 'react'

type IProps = {
  list: Order.BgaOrderPageListItem[]
}

// 计算当前账户总的浮动盈亏
export default function useCurrentAccountFloatProfit({ list }: IProps) {
  const { trade } = useStores()
  const { currentAccountInfo } = trade
  const precision = currentAccountInfo.currencyDecimal
  const data = list

  const totalProfit = useMemo(() => {
    if (!data?.length) return 0
    // 持仓总浮动盈亏
    let totalProfit = 0
    if (data.length) {
      data.forEach((item: Order.BgaOrderPageListItem) => {
        const profit = covertProfit(item) // 浮动盈亏
        // item.profit = profit
        // 先截取在计算，否则跟页面上截取后的值累加对不上
        totalProfit += Number(toFixed(profit, precision))
      })
    }
    return totalProfit
  }, [data])

  return totalProfit
}
