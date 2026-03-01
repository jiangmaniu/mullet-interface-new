import React from 'react'

import { ConfigProvider } from './config-provider'
import { StoresProvider } from './mobx-provider'

interface IProps {
  children: React.ReactNode
}

export const Provider = ({ children }: IProps): React.ReactElement => {
  return (
    <StoresProvider>
      <ConfigProvider>{children}</ConfigProvider>
    </StoresProvider>
  )
}
