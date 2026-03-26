import { useCallback, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { calcAccountAvailableMargin, calcAccountNetAssets, calcAccountOccupiedMargin } from '@/helpers/calc/account'
import { usePositionTotalPnlInfo } from '@/hooks/trade/use-position-pnl'
import { RootStoreState, useRootStore } from '@/stores'
import { tradePositionListSelector } from '@/stores/trade-slice/position-slice'
import { createAccountInfoSelector, createAccountMarginInfoSelector } from '@/stores/user-slice/infoSlice'
import { BNumberValue } from '@mullet/utils/number'

import { useAccountInfo } from './use-account-info'

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
  const accountInfo = useRootStore(
    useShallow(useCallback((s: RootStoreState) => createAccountMarginInfoSelector(accountId)(s), [accountId])),
  )

  return accountInfo?.occupiedMargin
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
 *
 * 将账户信息与仓位价格合并到单一 Zustand selector（扁平原始值），
 * 避免嵌套调用 usePositionTotalPnl 产生的递归订阅问题。
 */
export const useAccountAvailableMargin = (accountId?: string | number): string | undefined => {
  const positionList = useRootStore(tradePositionListSelector)

  // 单一 Zustand 订阅：账户字段 + 价格字段展开为扁平原始值
  // useShallow 做字段级 Object.is 比较，值不变时引用稳定，不触发重渲染
  const snapshot = useRootStore(
    useShallow(
      useCallback(
        (s: RootStoreState) => {
          const account = createAccountInfoSelector(accountId)(s)
          return {
            money: account?.money,
            margin: account?.margin,
            isolatedMargin: account?.isolatedMargin,
            usableAdvanceCharge: account?.usableAdvanceCharge,
          }
        },
        [accountId],
      ),
    ),
  )

  const totalPnlInfo = usePositionTotalPnlInfo({ positionList })

  return useMemo(() => {
    return getAccountAvailableMargin({
      accountInfo: snapshot,
      totalPnl: totalPnlInfo?.pnl,
    })
  }, [snapshot, totalPnlInfo])
}

/**
 * Hook：根据 accountId 获取账户净值（Net Assets）
 *
 * 内部获取账户信息和持仓总盈亏，计算净值
 *
 * 公式：netAssets = money + totalPnl
 */
export const useAccountNetAssets = (accountId?: string | number) => {
  const accountInfo = useAccountInfo(accountId)

  const positionList = useRootStore(tradePositionListSelector)
  const totalPnlInfo = usePositionTotalPnlInfo({ positionList })

  return useMemo(
    () => calcAccountNetAssets({ money: accountInfo?.money, totalPnl: totalPnlInfo?.pnl }),
    [accountInfo?.money, totalPnlInfo?.pnl],
  )
}
