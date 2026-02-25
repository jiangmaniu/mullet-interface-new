import React from 'react'

import { ConfigProvider } from './configProvider'
import { StoresProvider } from './mobxProvider'

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
