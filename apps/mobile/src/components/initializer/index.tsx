import { DebuggerInitializer } from "./debugger"
import { GlobalStateInitializer } from "./global-state"
import { AppVisibleStateProvider } from "./state-context/app-visible-state-context"

export const Initializer = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {/* <AuthInitializer /> */}
      <DebuggerInitializer />

      <GlobalStateInitializer>
        <AppVisibleStateProvider>
          {children}
        </AppVisibleStateProvider>
      </GlobalStateInitializer>
    </>
  )
}
