import { ConfigProvider } from './configProvider'
import { StoresProvider } from './mobxProvider'

interface IProps {
  children: JSX.Element
}

export const Provider = ({ children }: IProps): JSX.Element => {
  return (
    <StoresProvider>
      <ConfigProvider>{children}</ConfigProvider>
    </StoresProvider>
  )
}
