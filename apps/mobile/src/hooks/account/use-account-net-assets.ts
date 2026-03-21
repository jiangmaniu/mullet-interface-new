import { useMemo } from 'react'

import { calcAccountNetAssets } from '@/helpers/calc/account'
import { useAccountInfo } from '@/hooks/account/use-account-info'
import { usePositionTotalPnl } from '@/hooks/trade/use-position-pnl'
import { useStores } from '@/v1/provider/mobxProvider'

/**
 * Hook：根据 accountId 获取账户净值（Net Assets）
 *
 * 内部获取账户信息和持仓总盈亏，计算净值
 *
 * 公式：netAssets = money + totalPnl
 */
export const useAccountNetAssets = (accountId?: string | number | null) => {
  const accountInfo = useAccountInfo(accountId)
  const { trade } = useStores()
  const totalPnlInfo = usePositionTotalPnl(trade.positionList)

  return useMemo(
    () => calcAccountNetAssets({ money: accountInfo?.money, totalPnl: totalPnlInfo?.pnl }),
    [accountInfo?.money, totalPnlInfo?.pnl],
  )
}
