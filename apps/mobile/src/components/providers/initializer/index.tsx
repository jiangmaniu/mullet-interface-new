import { AuthInitializer } from "./auth"
import { DebuggerInitializer } from "./debugger"

export const InitializerProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AuthInitializer />
      <DebuggerInitializer />
      {children}
    </>
  )
}
