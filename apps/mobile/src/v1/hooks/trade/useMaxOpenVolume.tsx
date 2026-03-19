import trade from "@/v1/stores/trade"
import { formatNum } from "@/v1/utils"
import { useGetAccountBalanceCallback } from "@/v1/utils/wsUtil"
import { useState, useEffect } from "react"
import useOrderParams from "./useOrderParams"
import { useRootStore } from "@/stores"
import { useShallow } from 'zustand/react/shallow'
import { userInfoActiveTradeAccountCurrencyInfoSelector } from "@/stores/user-slice/infoSlice"


type IProps = {
  /** 是否限制请求 */
  isLimit?: boolean
}

/** 根据接口计算可开手数 */
export default function useMaxOpenVolume(props?: IProps) {
  const { isLimit = false } = props || {}
  const orderParams = useOrderParams()
  const currentAccountCurrencyInfo = useRootStore(useShallow(userInfoActiveTradeAccountCurrencyInfoSelector))
  const accountGroupPrecision = currentAccountCurrencyInfo?.currencyDecimal || 2
  const getAccountBalance = useGetAccountBalanceCallback()
  const { availableMargin } = getAccountBalance()

  // ===== 使用接口计算预估保证金
  const [maxOpenVolume, setMaxOpenVolume] = useState<any>('')
  const [expectedMargin, setExpectedMargin] = useState<any>('')

  useEffect(() => {
    if (isLimit) return
    trade
      .calcMargin({
        ...orderParams,
        // 先计算1手的预估保证金
        orderVolume: 1
      })
      .then((res: any) => {
        setExpectedMargin(Number(res))
      })
  }, [orderParams, isLimit])

  useEffect(() => {
    setMaxOpenVolume(formatNum(expectedMargin ? availableMargin / expectedMargin : 0, { precision: accountGroupPrecision }))
  }, [expectedMargin, availableMargin])

  return maxOpenVolume
}
