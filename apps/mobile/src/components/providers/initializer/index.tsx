import { useEffect } from "react"
import { useTradeSettingsStore } from "@/stores/trade-settings"
import { AuthInitializer } from "./auth"
import { DebuggerInitializer } from "./debugger"
import { GlobalStateInitializer } from "./global-state"

export const InitializerProvider = ({ children }: { children: React.ReactNode }) => {
  const hydrate = useTradeSettingsStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <>
      <AuthInitializer />
      <DebuggerInitializer />

      <GlobalStateInitializer>{children}</GlobalStateInitializer>
    </>
  )
}
