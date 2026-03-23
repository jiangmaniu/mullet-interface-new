import { useRootStore } from '@/stores'
import { useStores } from '@/v1/provider/mobxProvider'

// import { subscribeCurrentAndPositionSymbol } from '@/v1/utils/wsUtil'

export const useTradeSwitchActiveSymbol = () => {
  const { trade } = useStores()
  const { switchSymbol } = trade
  const switchTradeActiveSymbol = (symbol: string) => {
    useRootStore.getState().trade.setActiveTradeSymbol(symbol)
    switchSymbol(symbol)
    // subscribeCurrentAndPositionSymbol({ cover: true })
  }

  return { switchTradeActiveSymbol }
}
