import { isNil, isUndefined } from 'lodash-es'

import { BNumber, BNumberValue } from '@mullet/utils/number'

/**
 * lp 池子份额 = 铸造数量 - 销毁数量
 * @param totalMinted 铸造数量
 * @param totalBurned 销毁数量
 * @returns 份额
 */
export function calculateLpPoolShare(totalMinted: BNumberValue, totalBurned: BNumberValue) {
  return BNumber.from(totalMinted).minus(totalBurned)
}

/**
 * 计算 lp 价格（LP总USDC+赎回流动性池总USDC）/总份额
 * @param totalMinted 铸造数量
 * @param totalBurned 销毁数量
 * @returns 价格
 */
export function calculateLpPoolPrice({
  totalMinted,
  totalBurned,
  vaultAmount,
  liquidityPoolAmount,
}: {
  totalMinted?: BNumberValue
  totalBurned?: BNumberValue
  vaultAmount?: BNumberValue
  liquidityPoolAmount?: BNumberValue
}) {
  if (isNil(totalMinted) || isNil(totalBurned) || isNil(vaultAmount) || isNil(liquidityPoolAmount)) {
    return undefined
  }

  const totalAmount = BNumber.from(vaultAmount).plus(BNumber.from(liquidityPoolAmount))
  const share = calculateLpPoolShare(totalMinted, totalBurned)
  return totalAmount.div(share)
}
