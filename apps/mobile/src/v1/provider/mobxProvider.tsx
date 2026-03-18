import '../stores/_hydration'

import React from 'react'

import { GlobalStore } from '../stores/global'
import klineStore from '../stores/kline'
import screenAStore from '../stores/screena'
import searchStore from '../stores/search'
import tradeStore from '../stores/trade'
import userStore from '../stores/user'
import wsStore from '../stores/ws'

class Stores {
  global = new GlobalStore()
  ws = wsStore
  trade = tradeStore
  kline = klineStore
  user = userStore
  search = searchStore
  screenA = screenAStore
}
export const stores = new Stores()

const StoresContext = React.createContext<Stores>(stores)
export const StoresProvider = ({ children }: any) => {
  return <StoresContext.Provider value={stores}>{children}</StoresContext.Provider>
}
export const useStores = (): Stores => React.useContext(StoresContext)

export const hydrateStores = async () => {
  for (const key in stores) {
    if (Object.prototype.hasOwnProperty.call(stores, key)) {
      const s = (stores as any)[key]

      if (s.hydrate) {
        await s.hydrate()
      }
    }
  }
}
