import { Slot } from '@radix-ui/react-slot'
import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-paragraph-p3 font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary: 'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        message:
          'border-transparent text-xs leading-none h-5 min-w-5 p-0.5 bg-red-500 text-white [a&]:hover:bg-red-500/90 focus-visible:ring-red-500/20 dark:focus-visible:ring-red-500/40 dark:bg-red-500/60',
      },
      position: {
        none: '',
        'top-left': 'flex absolute left-0 top-0 -translate-1/2',
        'top-right': 'flex absolute right-0 top-0 translate-x-1/2 -translate-y-1/2',
        'bottom-left': 'flex absolute left-0 bottom-0 -translate-1/2',
        'bottom-right': 'flex absolute right-0 bottom-0 -translate-1/2',
      },
    },
    defaultVariants: {
      variant: 'default',
      position: 'none',
    },
  },
)

function Badge({
  className,
  variant,
  position,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return <Comp data-slot="badge" className={cn(badgeVariants({ position, variant }), className)} {...props} />
}

export { Badge, badgeVariants }
