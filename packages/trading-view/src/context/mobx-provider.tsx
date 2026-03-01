import React from 'react'

import stores, { Stores } from '@/stores'

const Context = React.createContext<Stores>(stores)
export const StoresProvider = ({ children }: any) => {
  return <Context.Provider value={stores}>{children}</Context.Provider>
}
export const useStores = (): Stores => React.useContext(Context)
