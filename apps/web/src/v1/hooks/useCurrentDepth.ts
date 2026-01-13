import { useStores } from '@/context/mobxProvider'

/**
 * 获取当前激活打开的品种深度报价
 * @param {*} currentSymbol 当前传入的symbolName
 * @returns
 */
export default function useCurrentDepth(currentSymbolName?: string) {
  const { ws, trade } = useStores()
  const { depth } = ws
  const symbol = currentSymbolName || trade.activeSymbolName
  // const { dataSourceCode } = trade.getActiveSymbolInfo(symbol, trade.symbolListAll)

  const { dataSourceCode, accountGroupId } = trade.symbolMapAll?.[symbol] || {}

  const dataSourceKey = `${accountGroupId}/${symbol}`

  const currentDepth = depth.get(dataSourceKey)

  return currentDepth
}
