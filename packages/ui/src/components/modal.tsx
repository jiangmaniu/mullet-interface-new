import React, { ComponentProps, useState } from 'react'
import { omit } from 'lodash-es'

import { cn } from '../lib/utils'
import { Button, ButtonProps } from './button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from './drawer'
import { IconClose } from './icons'

export function useMediaQuery(query: string) {
  const [value, setValue] = React.useState(false)

  React.useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches)
    }

    const result = matchMedia(query)
    result.addEventListener('change', onChange)
    setValue(result.matches)

    return () => result.removeEventListener('change', onChange)
  }, [query])

  return value
}

const Modal = (props: React.ComponentProps<typeof Drawer | typeof Dialog>) => {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  // const [snap, setSnap] = useState<number | string | null>(snapPoints[0])

  const Comp = isDesktop ? (
    <Dialog {...props} />
  ) : (
    <Drawer
      //  snapPoints={snapPoints} activeSnapPoint={snap} setActiveSnapPoint={setSnap}
      {...props}
    />
  )
  return Comp
}

Modal.displayName = 'Modal'

const ModalTrigger = ({ ...props }: React.ComponentProps<typeof DrawerTrigger | typeof DialogTrigger>) => {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const Comp = isDesktop ? <DialogTrigger {...props} /> : <DrawerTrigger {...props} />
  return Comp
}
ModalTrigger.displayName = 'ModalTrigger'

const ModalClose = ({ ...props }: React.ComponentProps<typeof DrawerClose | typeof DialogClose>) => {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const Comp = isDesktop ? <DialogClose {...props} /> : <DrawerClose {...props} />
  return Comp
}
ModalClose.displayName = 'ModalClose'

const ModalOverlay = ({ className, ...props }: ComponentProps<typeof DialogOverlay | typeof DrawerOverlay>) => {
  // const isDesktop = useMediaQuery('(min-width: 768px)')

  // if (isDesktop) {
  return (
    <DialogOverlay
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/[0.32]',
        className,
      )}
      {...props}
    />
  )
  // }

  // return <DrawerOverlay ref={ref} {...props} />
}
ModalOverlay.displayName = 'ModalOverlay'

const ModalPortal = ({ ...props }: React.ComponentProps<typeof DrawerPortal | typeof DialogPortal>) => {
  // const isDesktop = useMediaQuery('(min-width: 768px)')
  // const Comp = isDesktop ? <DialogPrimitive.Portal {...props} /> : <DrawerPortal {...props} />
  // return Comp

  return <DialogPortal {...props} />
}

Modal.displayName = 'ModalPortal'

const ModalContent = ({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogContent | typeof DrawerContent>) => {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <ModalPortal>
        <ModalOverlay />

        <DialogContent
          className={cn(
            'rounded-[20px] border border-[#3B3D52] bg-[#0E123A] px-5 py-6',
            'group fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-[360px] -translate-x-1/2 -translate-y-1/2 gap-1 shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.10),0px_8px_8px_-4px_rgba(16,24,40,0.04)] duration-200 sm:rounded-[20px]',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            className,
          )}
          {...props}
        >
          {children}

          {/* <DialogPrimitive.Close className="right-4 top-4 absolute rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <Icons.Close className="size-6" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close> */}
        </DialogContent>
      </ModalPortal>
    )
  }

  return (
    <DrawerContent
      className={cn('min-h-[70%] shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.10),0px_8px_8px_-4px_rgba(16,24,40,0.04)]')}
      {...props}
    >
      <div className={cn('flex flex-col px-4 pb-4 pt-2', className, 'max-w-full')}>{children}</div>
    </DrawerContent>
  )
}
ModalContent.displayName = 'ModalContent'

function ModalHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-1 text-left', className)} {...props}>
      {props.children}
    </div>
  )
}
ModalHeader.displayName = 'ModalHeader'

function ModalOverview({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="py-4">
      <div className={cn('flex flex-col gap-2 rounded-sm border border-gray-200 bg-gray-50 p-4', className)} {...props}>
        {props.children}
      </div>
    </div>
  )
}
ModalOverview.displayName = 'ModalOverview'

function ModalOverviewItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { label?: React.ReactNode }) {
  return (
    <div className={cn('flex justify-between gap-1 text-left', className)} {...props}>
      <div className="text-sm leading-[22px] text-gray-600">{props.label}</div>
      <div className="text-sm font-medium leading-[22px] text-gray-900">{props.children}</div>
    </div>
  )
}
ModalOverviewItem.displayName = 'ModalOverviewItem'

function ModalFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex gap-3', className)} {...props} />
}
ModalFooter.displayName = 'ModalFooter'

const ModalTitle = ({
  className,
  children,
  showCloseButton = true,
  ...props
}: ComponentProps<typeof DialogTitle | typeof DrawerTitle> & { showCloseButton?: boolean }) => {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const Comp = isDesktop ? DialogTitle : DrawerTitle

  return (
    <Comp className="flex items-start justify-between gap-3">
      <div
        className={cn('flex-1 text-base font-bold leading-normal tracking-tight text-[white]', className)}
        {...props}
      >
        {children}
      </div>

      {showCloseButton && (
        <ModalClose asChild>
          <Button variant="ghost" className="text-[#9FA0B0]" size={'icon'}>
            <IconClose className="size-4" />
            <span className="sr-only">Close</span>
          </Button>
        </ModalClose>
      )}
    </Comp>
  )
}
ModalTitle.displayName = 'ModalTitle'

const ModalDescription = ({
  className,
  ...props
}: ComponentProps<typeof DialogDescription | typeof DrawerDescription>) => {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const Comp = isDesktop ? DialogDescription : DrawerDescription

  return <Comp className={cn('text-sm leading-[22px] text-gray-600', className)} {...props} />
}
ModalDescription.displayName = 'ModalDescription'

export type ModalActionProps = {
  cancel?:
    | ({
        className?: string
        label?: React.ReactNode
        cb?: () => void
      } & ButtonProps)
    | false
  confirm?:
    | ({
        className?: string
        label?: React.ReactNode
        cb?: () => void
      } & ButtonProps)
    | true
  hide?: () => void
}

function ModalAction({ ...props }: ModalActionProps) {
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  return (
    <>
      {props.cancel !== false ? (
        <>
          <Button
            variant="secondary"
            loading={cancelLoading}
            type="button"
            {...omit(props.cancel, 'cb', 'label')}
            onClick={async () => {
              if (props.cancel === false) {
                return
              }

              setCancelLoading(true)

              try {
                await Promise.resolve(props.cancel?.cb?.())
                props.hide?.()
              } finally {
                setCancelLoading(false)
              }
            }}
            className={cn('flex-1', props.cancel?.className)}
            /** @ts-ignore */
            disabled={props.cancel?.disabled || props.confirm?.loading}
          >
            {props.cancel?.label ?? 'Cancel'}
          </Button>
        </>
      ) : null}

      {props.confirm ? (
        <>
          {props.confirm !== true ? (
            <Button
              loading={confirmLoading}
              type="button"
              {...omit(props.confirm, 'cb', 'label')}
              onClick={
                props.confirm.type === 'submit'
                  ? undefined
                  : props.confirm.cb
                    ? async () => {
                        if (props.confirm === true) {
                          props?.hide?.()
                          return
                        }

                        setConfirmLoading(true)

                        try {
                          await Promise.resolve(props.confirm?.cb?.())
                          props?.hide?.()
                        } finally {
                          setConfirmLoading(false)
                        }
                      }
                    : () => {
                        props?.hide?.()
                      }
              }
              className={cn('flex-1', props.confirm?.className)}
              /** @ts-ignore */
              disabled={props.confirm?.disabled || props.cancel?.loading}
            >
              {props.confirm?.label ?? 'OK'}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => {
                props?.hide?.()
              }}
              className={cn('flex-1')}
            >
              OK
            </Button>
          )}
        </>
      ) : null}
    </>
  )
}
ModalAction.displayName = 'ModalAction'

export {
  Modal,
  ModalAction,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalOverview,
  ModalOverviewItem,
  ModalPortal,
  ModalTrigger,
  ModalTitle,
}
