import { BNumber, BNumberValue } from '@mullet/utils/number'

export type CalcLimitStopLevelValueParams = {
  /** 限价和停损级别 */
  level?: BNumberValue
  /** 小数位 */
  decimals?: BNumberValue
}

/**
 * 计算 限价和停损距离价格
 * @param {CalcLimitStopLevelValueParams} params
 * @returns
 */
export const calcTpSLDistancePrice = (params: CalcLimitStopLevelValueParams) => {
  const { level, decimals = 0 } = params
  const decimalsValue = BNumber.from(10).pow(-decimals)
  const price = BNumber.from(level)?.multipliedBy(decimalsValue)
  return price?.toFixed()
}
