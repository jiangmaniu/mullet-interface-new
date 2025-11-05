import NiceModal from '@ebay/nice-modal-react'
import { RegisterGlobalModal } from './register'

export const NiceModalProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <NiceModal.Provider>
      {children}
      <RegisterGlobalModal />
    </NiceModal.Provider>
  )
}
