import { useRootStore } from '@/stores'

export const useTradeSwitchActiveSymbol = () => {
  const switchTradeActiveSymbol = (symbol: string) => {
    useRootStore.getState().trade.setActiveTradeSymbol(symbol)
  }

  return { switchTradeActiveSymbol }
}
