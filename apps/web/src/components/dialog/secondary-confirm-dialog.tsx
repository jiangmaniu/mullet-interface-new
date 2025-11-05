import { useEffect, useState } from 'react'

import { Button } from '@mullet/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@mullet/ui/dialog'
import { IconClose } from '@mullet/ui/icons'
import { cn } from '@mullet/ui/lib/utils'

type Props = {
  isOpen?: boolean
  onClose?: () => void
  message?: React.ReactNode
  title?: React.ReactNode
  cancel?:
    | {
        className?: string
        label?: React.ReactNode
        cb?: () => any
        loading?: boolean
      }
    | false
  confirm?: {
    loading?: boolean
    className?: string
    label?: React.ReactNode
    cb?: () => any
  }
}

export const SecondaryConfirmationDialog = (props: Props) => {
  const { isOpen, onClose } = props
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [isHandleComfirn, setIsHandleComfirn] = useState(false)
  const [isHandleCancel, setIsHandleCancel] = useState(false)

  useEffect(() => {
    if (isHandleComfirn && !props.confirm?.loading) {
      onClose?.()
      setIsHandleComfirn(false)
    }
  }, [props.confirm?.loading, isHandleComfirn])

  useEffect(() => {
    if (isHandleCancel && props.cancel !== false && !props.cancel?.loading) {
      onClose?.()
      setIsHandleCancel(false)
    }
  }, [props.cancel, isHandleCancel])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[480px]"
        aria-describedby={undefined}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="">
          <DialogTitle className="flex items-center justify-between gap-3">
            {props.title && <div className={cn('')}> {props.title}</div>}

            <DialogClose asChild>
              <Button
                variant="ghost"
                disabled={
                  props.confirm?.loading ??
                  (confirmLoading || (props.cancel !== false && props.cancel?.loading)) ??
                  cancelLoading
                }
                size={'icon'}
              >
                <IconClose className="size-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </DialogTitle>
        </DialogHeader>

        {!!props.message && <div className="flex-1 py-2 leading-normal"> {props.message}</div>}

        <DialogFooter className="mt-5 flex gap-3">
          {props.cancel !== false ? (
            <>
              <Button
                variant="outline"
                disabled={props.confirm?.loading ?? confirmLoading}
                loading={props.cancel?.loading ?? cancelLoading}
                className={cn('flex-1', props.cancel?.className)}
                onClick={async () => {
                  if (props.cancel === false) {
                    return
                  }

                  setCancelLoading(true)

                  try {
                    await Promise.resolve(props.cancel?.cb?.())
                    if (!props.cancel?.loading) {
                      onClose?.()
                    } else {
                      setIsHandleCancel(true)
                    }
                  } finally {
                    setCancelLoading(false)
                  }
                }}
              >
                {props.cancel?.label ?? 'Cancel'}
              </Button>
            </>
          ) : null}

          {props.confirm && (
            <>
              <Button
                loading={props.confirm?.loading ?? confirmLoading}
                disabled={props.confirm?.loading ?? confirmLoading}
                className={cn('flex-1', props.confirm?.className)}
                onClick={async () => {
                  setConfirmLoading(true)

                  try {
                    await Promise.resolve(props.confirm?.cb?.())
                    if (!props.confirm?.loading) {
                      onClose?.()
                    } else {
                      setIsHandleComfirn(true)
                    }
                  } finally {
                    setConfirmLoading(false)
                  }
                }}
              >
                {props.confirm?.label ?? 'OK'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
