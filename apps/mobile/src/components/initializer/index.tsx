import { DebuggerInitializer } from "./debugger"
import { GlobalStateInitializer } from "./global-state"
import { AppVisibleStateProvider } from "./state-context/app-visible-state-context"
import { useAppSnapshot } from "@/hooks/use-app-snapshot"

export const Initializer = ({ children }: { children: React.ReactNode }) => {
  useAppSnapshot()

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
