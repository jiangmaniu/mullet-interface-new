import { useRootStore } from '@/stores'
import { useStores } from '@/v1/provider/mobxProvider'

export const useTradeSwitchActiveSymbol = () => {
  const { trade } = useStores()
  const { switchSymbol } = trade
  const switchTradeActiveSymbol = (symbol: string) => {
    useRootStore.getState().trade.setActiveTradeSymbol(symbol)
    switchSymbol(symbol)
  }

  return { switchTradeActiveSymbol }
}
