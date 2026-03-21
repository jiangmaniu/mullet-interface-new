import { createContext, useContext, useEffect, useState } from 'react'

import { useAppState } from '@/hooks/use-app-state'
import { useRootStore } from '@/stores'
import useNetInfo from '@/v1/hooks/useNetInfo'
import { stores } from '@/v1/provider/mobxProvider'
import { SymbolWSItem } from '@/v1/stores/ws'

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
  const [isVisible, setIsVisible] = useState(false)

  const { ws, trade } = stores
  const { isConnected } = useNetInfo()

  // 執行重連函數
  const reconnect = () => {
    // console.log('=============== 尝试重连 ================')
    // let symbols = [] as SymbolWSItem[]
    // ws.sendingSymbols.forEach((_, key) => {
    //   symbols.push(ws.stringToSymbol(key))
    // })
    // ws.checkSocketReady(() => {
    //   // 打开行情订阅
    //   ws.subscribeSymbol(
    //     // 构建参数
    //     symbols,
    //     false
    //   )
    // })
  }

  const onAppActive = async () => {
    // const token = useRootStore.getState().user.auth.accessToken
    // setIsVisible(true)
    // if (token) {
    //   reconnect()
    //   // 及时刷新品种列表
    //   if (token) {
    //     stores.trade.getSymbolList()
    //   }
    // }
  }

  useEffect(() => {
    // if (!isConnected) {
    // // console.log('=============== 网络断开，关闭 ws ================')
    //   if (ws.socket?.readyState === 1 && trade.symbolListAll.length > 0) {
    //     ws.close()
    //     return
    //   }
    // }
    // reconnect()
  }, [isConnected, trade.symbolListAll.length])

  useAppState(
    () => {
      // console.log('=============== 应用回到前台 ================')
      onAppActive()
    },
    () => {
      // console.log('=============== 应用进入后台 ================')
      setIsVisible(false)
    },
  )

  // 当visible变为true时，取消延迟关闭
  useEffect(() => {
    if (!isVisible) {
      // console.log('=============== 应用进入后台，关闭 ws ================')
      // ws.close()
    }
  }, [isVisible])

  return (
    <AppVisibleStateContext.Provider value={{ isAppVisible: isVisible, setAppVisible: setIsVisible }}>
      {children}
    </AppVisibleStateContext.Provider>
  )
}
