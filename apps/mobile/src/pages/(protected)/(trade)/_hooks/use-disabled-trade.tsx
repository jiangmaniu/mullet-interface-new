import { useAccountInfo } from '@/hooks/account/use-account-info'
import { Account } from '@/services/tradeCore/account/typings'
import { useMarketSymbolInfo } from '@/stores/market-slice'

// ============ 纯函数 ============

/** 判断市场是否开市（基于品种配置和假期状态） */
function isMarketOpen(symbolInfo: Account.TradeSymbolListItem | undefined | null): boolean {
  if (!symbolInfo?.id) return false
  // 假期内暂停交易
  if (symbolInfo.isInHoliday) return false

  // @ts-ignore tradeTimeConf 实际为数组格式
  const tradeTimeConf: any[] = symbolInfo?.symbolConf?.tradeTimeConf || []
  if (!tradeTimeConf.length) return false

  const now = new Date()
  const currentDay = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][now.getDay()]
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const dayConfig = tradeTimeConf.find((config: any) => config.weekDay === currentDay)
  if (!dayConfig) return false

  for (let i = 0; i < dayConfig.trade.length; i += 2) {
    const start = dayConfig.trade[i]
    const end = dayConfig.trade[i + 1]
    if (currentMinutes >= start && currentMinutes <= end) return true
  }

  return false
}

export interface DisabledTradeResult {
  /** 禁用交易按钮（账户禁用或休市） */
  disabledBtn: boolean
  /** 账户禁用交易 */
  disabledTrade: boolean
  /** 禁用交易区输入（账户禁用或休市） */
  disabledInput: boolean
}

/**
 * 根据账户信息和品种信息计算禁用交易状态（纯函数，可直接调用）
 * @param accountInfo 账户信息
 * @param symbolInfo 品种信息
 */
export function calcDisabledTrade(
  accountInfo: User.AccountItem | undefined | null,
  symbolInfo: Account.TradeSymbolListItem | undefined | null,
): DisabledTradeResult {
  // 账户禁用：账户组禁用交易 或 账户本身禁用交易
  const disabledTrade = !accountInfo?.enableTrade || !accountInfo?.isTrade
  // 禁用交易区操作：账户禁用 或 休市
  const disabledInput = disabledTrade || !isMarketOpen(symbolInfo)
  const disabledBtn = disabledTrade || disabledInput

  return { disabledBtn, disabledTrade, disabledInput }
}

// ============ Hook ============

interface UseDisabledTradeParams {
  /** 账户 ID */
  accountId?: string | number | null
  /** 品种名称 */
  symbol?: string | null
}

/**
 * 禁用交易状态 hook
 * 基于 RootStore 状态，根据传入的 accountId 和 symbol 计算禁用状态
 */
export function useDisabledTrade({ accountId, symbol }: UseDisabledTradeParams): DisabledTradeResult {
  const accountInfo = useAccountInfo(accountId ?? undefined)
  const symbolInfo = useMarketSymbolInfo(symbol ?? undefined)

  return calcDisabledTrade(accountInfo, symbolInfo)
}
