import { useEffect } from 'react'

import { DEFAULT_TENANT_ID } from '@/constants/config/trade'
import MulletWS from '@/lib/ws/mullet-ws'
import { useRootStore } from '@/stores'
import { userInfoActiveTradeAccountInfoSelector } from '@/stores/user-slice/infoSlice'

/**
 * 订阅行情 hook
 * 组件挂载时订阅，卸载时自动取消
 *
 * @param symbols 品种名称列表，如 ['BTC', 'ETH']
 *
 * @example
 * useSubscribeQuote(['BTC', 'ETH'])
 * const btcQuote = useMarketQuote('BTC') // 从 Zustand 读取
 */
export function useSubscribeQuote(symbols: string[]): void {
  const symbolsKey = symbols.join(',')
  const accountGroupId = useRootStore((s) => userInfoActiveTradeAccountInfoSelector(s)?.accountGroupId)

  useEffect(() => {
    if (!symbolsKey || !accountGroupId) return

    const ws = MulletWS.getInstance()
    const topics = symbolsKey.split(',').map((symbol) => `/${DEFAULT_TENANT_ID}/symbol/${symbol}/${accountGroupId}`)
    const unsubscribe = ws.subscribe(topics)
    return unsubscribe
  }, [symbolsKey, accountGroupId])
}
