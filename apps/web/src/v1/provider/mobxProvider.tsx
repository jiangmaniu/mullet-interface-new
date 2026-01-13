'use client'

import React from 'react'

import { klineMobxStore } from '@/v1/mobx/kline'
import { tradeMobxStore } from '@/v1/mobx/trade'
import { wsMobxStore } from '@/v1/mobx/ws'

import { globalMobxStore } from '../mobx/global'

class Stores {
  ws = wsMobxStore
  global = globalMobxStore
  trade = tradeMobxStore
  kline = klineMobxStore
}
export const stores = new Stores()

const StoresContext = React.createContext<Stores>(stores)
export const MobxStoresProvider = ({ children }: any) => {
  return <StoresContext.Provider value={stores}>{children}</StoresContext.Provider>
}
export const useStores = (): Stores => React.useContext(StoresContext)
