import { createContext, useContext, useEffect, useRef } from 'react'

import { useAppState } from '@/hooks/use-app-state'
import { useWsReconnect } from '@/hooks/use-ws-reconnect'
import useNetInfo from '@/v1/hooks/useNetInfo'

export interface AppVisibleStateContextProvider {
  isAppVisible: boolean
  setAppVisible: (isVisible: boolean) => void
}

const AppVisibleStateContext = createContext<{
  isAppVisible: boolean
  setAppVisible: (isVisible: boolean) => void
}>({
  isAppVisible: false,
  setAppVisible: () => {},
})

export const useAppVisibleState = () => {
  const state = useContext(AppVisibleStateContext)
  if (!state) {
    throw new Error('useAppVisibleState must be used within a AppVisibleStateProvider')
  }
  return state
}

export const AppVisibleStateProvider = ({ children }: { children: React.ReactNode }) => {
  const { isConnected } = useNetInfo()
  const { reconnect } = useWsReconnect()
  // 跳过首次执行：组件 mount 时 isConnected 通常已为 true，
  // 但此时 global.ts 已调用过 checkSocketReady 完成初始连接，无需重复
  const isMounted = useRef(false)

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    if (isConnected) {
      // 网络从断开恢复（false → true）时触发重连
      reconnect()
    }
  }, [isConnected, reconnect])

  useAppState(
    () => {
      // 应用从后台恢复到前台时触发重连
      // 若 WS 仍连接则跳过，若已断开则重连并恢复行情订阅
      reconnect()
    },
    undefined,
  )

  return (
    <AppVisibleStateContext.Provider value={{ isAppVisible: false, setAppVisible: () => {} }}>
      {children}
    </AppVisibleStateContext.Provider>
  )
}
