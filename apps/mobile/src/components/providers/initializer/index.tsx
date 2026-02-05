import { AuthInitializer } from "./auth"
import { DebuggerInitializer } from "./debugger"
import { GlobalStateInitializer } from "./global-state"

export const InitializerProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AuthInitializer />
      <DebuggerInitializer />

      <GlobalStateInitializer>{children}</GlobalStateInitializer>
    </>
  )
}
