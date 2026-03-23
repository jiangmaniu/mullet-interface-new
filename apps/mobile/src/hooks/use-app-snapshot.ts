import { useCallback } from 'react'
import { useAppState } from './use-app-state'
import { saveSnapshot } from '@/lib/storage/snapshot'
import { useRootStore } from '@/stores'
import { marketQuoteSliceSelector } from '@/stores/market-slice/quote-slice'
import { marketSymbolInfoListSelector } from '@/stores/market-slice'

/**
 * 监听 App 进入后台，将行情和品种列表存入快照
 * 下次启动时可立即恢复数据，避免白屏
 *
 * 在 App 根组件调用一次即可
 */
export function useAppSnapshot() {
  const onBackground = useCallback(() => {
    const state = useRootStore.getState()

    // 存行情快照
    const quoteMap = marketQuoteSliceSelector(state).quoteMap
    if (Object.keys(quoteMap).length > 0) {
      saveSnapshot('quote', quoteMap)
    }

    // 存品种列表快照
    const symbolList = marketSymbolInfoListSelector(state)
    if (symbolList.length > 0) {
      saveSnapshot('symbol', symbolList)
    }
  }, [])

  useAppState(() => {}, onBackground)
}
