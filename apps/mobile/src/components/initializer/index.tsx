import { AuthInitializer } from "./auth"
import { DebuggerInitializer } from "./debugger"
import { GlobalStateInitializer } from "./global-state"

export const Initializer = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AuthInitializer />
      <DebuggerInitializer />

      <GlobalStateInitializer>{children}</GlobalStateInitializer>
    </>
  )
}
