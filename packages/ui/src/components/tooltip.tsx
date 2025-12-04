'use client'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import * as React from 'react'
import { cva, VariantProps } from 'class-variance-authority'

import { cn } from '@mullet/ui/lib/utils'

function TooltipProvider({ delayDuration = 0, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />
}

type TooltipProps = React.ComponentProps<typeof TooltipPrimitive.Root>

function Tooltip({ ...props }: TooltipProps) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({ className, ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" className={cn('', className)} {...props} />
}

function TooltipTriggerDottedText({ children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className="text-clickable-1 underline decoration-dotted underline-offset-4" {...props}>
      {children}
    </div>
  )
}

const TooltipArrow = TooltipPrimitive.Arrow

const tooltipContentVariants = cva(
  [
    'z-50 rounded-small p-xl text-content-1 text-paragraph-p3 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  ],
  {
    variants: {
      variant: {
        default: 'bg-zinc-800/90 backdrop-blur-[12px] text-white border border-zinc-base',
        // outline: 'border bg-popover text-popover-foreground shadow-md',
        // secondary: 'bg-secondary text-secondary-foreground'
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type TooltipContentProps = React.ComponentProps<typeof TooltipPrimitive.Content> &
  VariantProps<typeof tooltipContentVariants>

function TooltipContent({ className, sideOffset = 0, variant, children, ...props }: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(tooltipContentVariants({ variant, className }))}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger, TooltipTriggerDottedText }
