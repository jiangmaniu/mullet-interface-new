import { AppVisibleStateProvider } from "./app-visible-state-context"

export const StateContextInitializer = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AppVisibleStateProvider>
        {children}
      </AppVisibleStateProvider>
    </>
  )
}
