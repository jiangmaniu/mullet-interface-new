import { createContext, useContext } from 'react'

type TradeRefreshContextType = {
  registerRefresh: (fn: () => Promise<void>) => () => void
}

export const TradeRefreshContext = createContext<TradeRefreshContextType>({
  // 默认空实现，防止在 Provider 外使用时报错
  registerRefresh: () => () => {},
})

export function useTradeRefresh() {
  return useContext(TradeRefreshContext)
}
