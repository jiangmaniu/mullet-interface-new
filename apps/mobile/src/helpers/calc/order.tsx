import { TradePositionDirectionEnum } from '@/options/trade/position'
import { BNumber, BNumberValue } from '@mullet/utils/number'

import { parseTradeDirectionInfo } from '../parse/trade'
import { CalcLimitStopLevelValueParams, calcTpSLDistancePrice } from './symbol'

export enum TpSlDirectionEnum {
  TP,
  SL,
}

type CalcOrderTpSlScopePriceInfoParams = {
  /** 订单方向 */
  direction?: TradePositionDirectionEnum
  /** 订单价格 */
  price?: BNumberValue
  /** 止盈止损方向 */
  TpSlDirection: TpSlDirectionEnum
} & CalcLimitStopLevelValueParams

type CalcOrderTpSlScopePriceInfoResult = {
  /** 范围价格 */
  scopePrice?: string
  /** 范围价格标志 */
  scopePriceFlag?: string
  /** 是否大于等于 */
  isGte?: boolean
  /** 是否小于等于 */
  isLte?: boolean
}

/**
 * 计算止盈或止损的范围价格
 * @param params
 * @returns
 */
export const calcOrderTpSlScopePriceInfo = (params: CalcOrderTpSlScopePriceInfoParams) => {
  const { direction, price, level, decimals, TpSlDirection } = params

  const { isBuy, isSell } = parseTradeDirectionInfo(direction)
  const isTp = TpSlDirection === TpSlDirectionEnum.TP
  const tpSlDistancePrice = calcTpSLDistancePrice({ level, decimals }) ?? 0

  const GTE_FLAG = '≥'
  const LTE_FLAG = '≤'

  let isGte = false
  let isLte = false
  let flag: string | undefined = undefined
  let scopePrice = BNumber.from(price)

  if (isBuy) {
    if (isTp) {
      // 多单止盈范围 = 订单价格 + 停损级别价格
      scopePrice = scopePrice?.plus(tpSlDistancePrice)
      flag = GTE_FLAG
      isGte = true
    } else {
      // 多单止损范围 = 订单价格 + 停损级别价格
      flag = LTE_FLAG
      scopePrice = scopePrice?.minus(tpSlDistancePrice)
      isLte = true
    }
  } else if (isSell) {
    if (isTp) {
      // 空单止盈范围 = 订单价格 - 停损级别价格
      flag = LTE_FLAG
      isLte = true
      scopePrice = scopePrice?.minus(tpSlDistancePrice)
    } else {
      // 空单止损范围 = 订单价格 + 停损级别价格
      flag = GTE_FLAG
      scopePrice = scopePrice?.plus(tpSlDistancePrice)
      isGte = true
    }
  }

  const info: CalcOrderTpSlScopePriceInfoResult = {
    scopePrice: scopePrice?.toFixed(),
    scopePriceFlag: flag,
    isGte,
    isLte,
  }

  return info
}
