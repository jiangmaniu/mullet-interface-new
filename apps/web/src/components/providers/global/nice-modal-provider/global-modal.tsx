import { create, useModal } from '@ebay/nice-modal-react'
import { ComponentProps } from 'react'

import { SecondaryConfirmationDialog } from '@/components/dialog/secondary-confirm-dialog'
import { TransactionStatusTrackingDialog } from '@/components/dialog/transaction-status-tracking-dialog'

export type SecondaryConfirmationGlobalModalProps = Omit<ComponentProps<typeof SecondaryConfirmationDialog>, 'isOpen' | 'onClose'>

export const SecondaryConfirmationGlobalModal = create((props: SecondaryConfirmationGlobalModalProps) => {
  const modal = useModal()

  return <SecondaryConfirmationDialog isOpen={modal.visible} onClose={modal.hide} {...props} />
})

export type TransactionStatusTrackingGlobalModalProps = Omit<ComponentProps<typeof TransactionStatusTrackingDialog>, 'isOpen' | 'onClose'>

export const TransactionStatusTrackingGlobalModal = create((props: TransactionStatusTrackingGlobalModalProps) => {
  const modal = useModal()
  return <TransactionStatusTrackingDialog isOpen={modal.visible} onClose={modal.hide} {...props} />
})
