import { isNil } from 'lodash-es'

import { BNumber, BNumberValue } from '@mullet/utils/number'

/**
 * 计算 vault 可用余额
 * @param balance 余额
 * @returns 可用余额
 */
export function calculateVaultAvailableBalance({ balance }: { balance?: BNumberValue }) {
  if (isNil(balance)) {
    return undefined
  }

  return BNumber.from(balance)
}

/**
 * 计算 vault 份额单价 (余额+ 实时盈亏 ）/ 总份额
 * @param balance 余额
 * @param share 份额
 * @param pnl 实时盈亏
 * @returns 可用余额
 */
export function calculateVaultSharePrice({
  balance,
  share,
  pnl,
}: {
  balance?: BNumberValue
  share?: BNumberValue
  pnl?: BNumberValue
}) {
  if (isNil(balance) || isNil(share) || isNil(pnl)) {
    return undefined
  }

  if (BNumber.from(share).eq(0)) {
    return undefined
  }

  const price = BNumber.from(balance).plus(pnl).div(share)

  return price
}

export const calculateVaultAccountNetValue = ({
  sharePrice,
  share,
}: {
  sharePrice?: BNumberValue
  share?: BNumberValue
}) => {
  if (isNil(sharePrice) || isNil(share)) {
    return undefined
  }

  return BNumber.from(sharePrice).times(share)
}
