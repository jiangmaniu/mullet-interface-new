'use client'

import { EnvProvider } from './envProvider'
import { MobxStoresProvider } from './mobxProvider'

export const OldProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <MobxStoresProvider>
      <EnvProvider>{children}</EnvProvider>
    </MobxStoresProvider>
  )
}
