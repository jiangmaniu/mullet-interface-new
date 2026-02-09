import { useEffect } from "react"
import { useCSSVariable } from "uniwind"
import { useTradeSettingsStore } from "@/stores/trade-settings"
import { AuthInitializer } from "./auth"
import { DebuggerInitializer } from "./debugger"
import { GlobalStateInitializer } from "./global-state"

export const InitializerProvider = ({ children }: { children: React.ReactNode }) => {
  const hydrate = useTradeSettingsStore((s) => s.hydrate)
  const isHydrated = useTradeSettingsStore((s) => s.isHydrated)
  const applyColorScheme = useTradeSettingsStore((s) => s.applyColorScheme)

  const [tradeBuy, tradeSell] = useCSSVariable([
    '--color-trade-buy',
    '--color-trade-sell',
  ]) as [string, string]

  useEffect(() => {
    hydrate()
  }, [hydrate])

  // hydrate 完成后，使用 CSS 变量值应用颜色方案
  useEffect(() => {
    if (isHydrated && tradeBuy && tradeSell) {
      applyColorScheme({ tradeBuy, tradeSell })
    }
  }, [isHydrated, tradeBuy, tradeSell, applyColorScheme])

  return (
    <>
      <AuthInitializer />
      <DebuggerInitializer />

      <GlobalStateInitializer>{children}</GlobalStateInitializer>
    </>
  )
}
