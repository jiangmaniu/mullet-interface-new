import { StoresProvider } from "./mobxProvider"

export const V1Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoresProvider>
      {children}
    </StoresProvider>
  )
}
