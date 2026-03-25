import { useCallback, useMemo } from 'react'

import { calcAccountAvailableMargin, calcAccountOccupiedMargin } from '@/helpers/calc/account'
import { useAccountInfo } from '@/hooks/account/use-account-info'
// import { usePositionTotalPnl } from '@/hooks/trade/use-position-pnl'
import { useStores } from '@/v1/provider/mobxProvider'
import { BNumberValue } from '@mullet/utils/number'
import { useRootStore, RootStoreState } from '@/stores'
import { createAccountInfoSelector } from '@/stores/user-slice/infoSlice'
import { useShallow } from 'zustand/react/shallow'

// ============ 占用保证金（Occupied Margin） ============

/** 获取占用保证金入参 */
export type GetAccountOccupiedMarginParams = {
  /** 账户信息 */
  accountInfo?: Pick<User.AccountItem, 'margin' | 'isolatedMargin'>
}

/**
 * 获取账户占用保证金（方法版本）
 *
 * 公式：occupiedMargin = margin + isolatedMargin
 */
export const getAccountOccupiedMargin = (params?: GetAccountOccupiedMarginParams): string | undefined => {
  if (!params) return undefined
  const { accountInfo } = params

  return calcAccountOccupiedMargin({
    margin: accountInfo?.margin,
    isolatedMargin: accountInfo?.isolatedMargin,
  })
}

/**
 * Hook：获取账户占用保证金
 */
export const useAccountOccupiedMargin = (accountId?: string | number | null): string | undefined => {
  const accountInfo = useAccountInfo(accountId)

  const accountInfo = useRootStore(
    useShallow(useCallback((s: RootStoreState) => createAccountInfoSelector(accountId)(s), [accountId])),
  )

  return useMemo(() => getAccountOccupiedMargin({ accountInfo }), [accountInfo])
}

// ============ 可用保证金（Available Margin） ============

/** 获取可用保证金入参 */
export type GetAccountAvailableMarginParams = {
  /** 账户信息 */
  accountInfo?: Pick<User.AccountItem, 'money' | 'margin' | 'isolatedMargin' | 'usableAdvanceCharge'>
  /** 总盈亏 */
  totalPnl?: BNumberValue
}

/**
 * 获取账户可用保证金（方法版本）
 *
 * 公式：
 *   availableMargin = money - occupiedMargin
 *   若 PROFIT_LOSS 模式：availableMargin = money - occupiedMargin + totalPnl
 */
export const getAccountAvailableMargin = (params?: GetAccountAvailableMarginParams): string | undefined => {
  if (!params) return undefined
  const { accountInfo, totalPnl } = params

  const occupiedMargin = calcAccountOccupiedMargin({
    margin: accountInfo?.margin,
    isolatedMargin: accountInfo?.isolatedMargin,
  })

  return calcAccountAvailableMargin({
    money: accountInfo?.money,
    occupiedMargin,
    totalPnl,
    includePnl: accountInfo?.usableAdvanceCharge === 'PROFIT_LOSS',
  })
}

/**
 * Hook：获取账户可用保证金
 */
// export const useAccountAvailableMargin = (accountId?: string | number | null): string | undefined => {
//   const accountInfo = useAccountInfo(accountId)
//   const { trade } = useStores()
//   const totalPnlInfo = usePositionTotalPnl(trade.positionList)

//   return useMemo(
//     () => getAccountAvailableMargin({ accountInfo, totalPnl: totalPnlInfo?.pnl }),
//     [accountInfo, totalPnlInfo?.pnl],
//   )
// }
