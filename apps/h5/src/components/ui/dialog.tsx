import {
  DialogTrigger as AriaDialogTrigger,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
  Dialog as AriaDialog,
  Heading as AriaHeading,
  composeRenderProps,
  type DialogProps as AriaDialogProps,
  type ModalOverlayProps as AriaModalOverlayProps,
} from 'react-aria-components'
import { cn } from '@/lib/utils'

const DialogTrigger = AriaDialogTrigger

function DialogOverlay({ className, isDismissable = true, ...props }: AriaModalOverlayProps) {
  return (
    <AriaModalOverlay
      isDismissable={isDismissable}
      className={composeRenderProps(className, (className) =>
        cn(
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
          'data-[entering]:animate-in data-[entering]:fade-in-0',
          'data-[exiting]:animate-out data-[exiting]:fade-out-0',
          className,
        ),
      )}
      {...props}
    />
  )
}

function DialogModal({ className, ...props }: AriaModalOverlayProps) {
  return (
    <AriaModal
      className={composeRenderProps(className, (className) =>
        cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3 border bg-card p-6 shadow-lg',
          'data-[entering]:animate-in data-[entering]:fade-in-0 data-[entering]:zoom-in-95',
          'data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95',
          className,
        ),
      )}
      {...props}
    />
  )
}

function Dialog({ className, ...props }: AriaDialogProps) {
  return (
    <AriaDialog
      className={cn('outline-none', className)}
      {...props}
    />
  )
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5 text-center sm:text-left', className)} {...props} />
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof AriaHeading>) {
  return (
    <AriaHeading
      slot="title"
      className={cn('text-lg font-semibold leading-none', className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />
}

export {
  DialogTrigger,
  DialogOverlay,
  DialogModal,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
}
