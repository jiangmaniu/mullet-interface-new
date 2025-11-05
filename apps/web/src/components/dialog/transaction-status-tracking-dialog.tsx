// import { useSolExploreUrl } from '@/hooks/web3/use-sol-explore-url'
// import useConnection from '@/hooks/web3/useConnection'
import { useModal } from '@ebay/nice-modal-react'
import { useQuery } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'

import { BorderBeam } from '@mullet/ui/borderBeam'
import { Button } from '@mullet/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@mullet/ui/dialog'
import { IconClose } from '@mullet/ui/icons'
// import { waitTransactionConfirm } from '@/libs/web3/helpers/tx'
// import { formatAddress } from '@/utils/web3'
import { cn } from '@mullet/ui/lib/utils'
import { formatAddress } from '@mullet/utils/format'

// import { Connection } from '@solana/web3.js'

import { Trans } from '../t'

export enum TransactionActionType {
  mint,
  redeem,
  deposit,
  withdraw,
}

interface TransactionStatusTrackingDialogProps {
  txHash?: string
  isConfirming?: boolean
  actionType?: TransactionActionType
  dialogTitle?: React.ReactNode
  title?: React.ReactNode
  // connection?: Connection
  connection?: any
  description?: React.ReactNode
  confirmingDescription?: React.ReactNode
  successDescription?: React.ReactNode
  errorDescription?: React.ReactNode
  pendingDescription?: React.ReactNode
  isError?: boolean
  isOpen?: boolean
  onClose?: () => void
}

export const TransactionStatusTrackingDialog = ({
  txHash,
  actionType,
  connection,
  isConfirming,
  dialogTitle,
  title,
  description,
  successDescription,
  errorDescription,
  pendingDescription,
  confirmingDescription,
  isOpen,
  onClose,
  ...props
}: TransactionStatusTrackingDialogProps) => {
  const [status, setStatus] = useState<'confirming' | 'pending' | 'success' | 'error'>('confirming')
  // const { connection: connectionFallback } = useConnection()
  // const activeConnection = connection ?? connectionFallback

  // const {
  //   isSuccess,
  //   isError,
  //   isLoading: isPending,
  // } = useQuery({
  //   enabled: !!txHash && !!activeConnection,
  //   queryKey: ['transaction-status-tracking', txHash],
  //   queryFn: () => {
  //     if (!txHash) {
  //       throw new Error('txHash is required')
  //     }

  //     return waitTransactionConfirm(activeConnection, txHash!)
  //   },
  // })

  useEffect(() => {
    if (isOpen) {
      setStatus('confirming')
    }
  }, [isOpen])

  // useEffect(() => {
  //   if (isError || props.isError) {
  //     setStatus('error')
  //   } else if (isConfirming) {
  //     setStatus('confirming')
  //   } else if (isSuccess) {
  //     setStatus('success')
  //   } else if (isPending) {
  //     setStatus('pending')
  //   }
  // }, [isSuccess, isError, props.isError, isPending, isConfirming])

  // const { getSolExplorerUrl } = useSolExploreUrl()

  const renderContent = () => {
    return (
      <div className="flex w-full flex-1 flex-col items-center">
        <DialogHeader className="w-full">
          <DialogTitle className="flex items-center justify-between gap-3">
            <div className={cn('')}> {dialogTitle}</div>

            <DialogClose asChild>
              <Button variant="ghost" size={'icon'}>
                <IconClose className="size-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-2.5">
          {/* {isError || props.isError ? (
            // <img src='/icons/status/TransactionFailed.svg' width={88} height={88} alt="Transaction Failed" />
            <div className="bg-red flex size-16 items-center justify-center rounded-full">
              <IconClose className="size-12 text-[#1e2329]" />
            </div>
          ) : isSuccess ? (
            <img src={'/img/icons/check.svg'} className="size-16" alt="Token Icon" />
          ) : (
            <div className="relative flex size-16 items-center justify-center rounded-full bg-[#1e2329]">
              <img src={'/img/icons/logo/short.svg'} className={cn('size-[58px]')} alt="" />
              <BorderBeam duration={3} borderWidth={3} colorFrom="#1e2329" colorTo="#fcd535" />
            </div>
          )} */}

          {title && <DialogTitle className="text-[16px]">{title}</DialogTitle>}

          <DialogDescription className="text-[14px] text-[#9FA0B0]">
            {/* {isError || props.isError ? (
              <>{errorDescription ?? description}</>
            ) : isSuccess ? (
              <>{successDescription ?? description}</>
            ) : isConfirming ? (
              <>{confirmingDescription ?? description}</>
            ) : isPending ? (
              <>{pendingDescription ?? description}</>
            ) : null} */}
            <>{description}</>
          </DialogDescription>
        </div>

        {txHash && (
          <div className="mt-6 flex w-full justify-between text-[14px] text-[#9FA0B0]">
            <div>交易哈希</div>

            <div>
              {/* {txHash ? (
                <a href={getSolExplorerUrl(txHash)} className="text-[#1C66FF]" target="_blank" rel="noreferrer">
                  {formatAddress(txHash)}
                </a>
              ) : (
                '--'
              )} */}
            </div>
          </div>
        )}

        {/* <div>{JSON.stringify({ isSuccess, isError, 'props.isError': props.isError, isPending, isConfirming })}</div>
        <div>{(!!txHash && !!activeConnection).toString()}</div>
        <div>{JSON.stringify({ errorDescription, successDescription, confirmingDescription, pendingDescription })}</div> */}

        <DialogDescription className="mt-6 text-[14px] font-normal text-[#848d9b]">
          {/* {isError || props.isError ? (
            <Trans>似乎出了点问题，请重新操作</Trans>
          ) : isSuccess ? (
            <Trans>网络以确认</Trans>
          ) : status === 'confirming' ? (
            <div className="ellipsis-blink">
              <Trans>请在钱包中确认签名</Trans>
            </div>
          ) : isPending ? (
            <div className="ellipsis-blink">
              <Trans>网络确认中</Trans>
            </div>
          ) : null} */}
        </DialogDescription>
      </div>
    )
  }

  const renderStepIndicator = () => {
    const steps = ['confirming', 'pending', 'completed']
    const customStatus = status === 'success' || status === 'error' ? 'completed' : status
    return (
      <DialogFooter className="mt-8 flex w-max justify-center">
        {steps.map((step, index) => {
          return (
            <div key={step} className="flex items-center">
              <div
                className={`size-[6px] rounded-full ${index <= steps.indexOf(customStatus) ? 'bg-[#F1BA0D]' : 'bg-[#848D9B]'}`}
              />
            </div>
          )
        })}
      </DialogFooter>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onInteractOutside={(event) => event.preventDefault()}
        className="flex min-h-[260px] w-full max-w-[360px] min-w-[360px] flex-col items-center justify-center"
      >
        {renderContent()}

        {renderStepIndicator()}
      </DialogContent>
    </Dialog>
  )
}

export const useTransactionStatusTrackingDialog = (initialProps?: Partial<TransactionStatusTrackingDialogProps>) => {
  const modal = useModal(TransactionStatusTrackingDialog, initialProps)

  const show = (args?: Partial<TransactionStatusTrackingDialogProps> | undefined) => {
    modal.show({ ...initialProps, ...args })
  }

  return { show }
}
