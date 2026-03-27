import { createContext, useContext, useEffect, useRef } from 'react'

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
  return (
    <AppVisibleStateContext.Provider value={{ isAppVisible: false, setAppVisible: () => {} }}>
      {children}
    </AppVisibleStateContext.Provider>
  )
}
