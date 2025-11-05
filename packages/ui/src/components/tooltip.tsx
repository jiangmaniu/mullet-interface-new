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

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

const TooltipArrow = TooltipPrimitive.Arrow

const tooltipContentVariants = cva(
  [
    'z-50 rounded-[8px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] py-5 px-3.5 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
    'text-[12px] font-normal leading-normal',
  ],
  {
    variants: {
      variant: {
        default: 'bg-[#0E123A] text-white border border-[#3B3D52]',
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

export { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger }
