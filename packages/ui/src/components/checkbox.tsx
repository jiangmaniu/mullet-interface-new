'use client'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import * as LabelPrimitive from '@radix-ui/react-label'
import * as React from 'react'
import { cva, VariantProps } from 'class-variance-authority'

import { cn } from '@mullet/ui/lib/utils'

import { Iconify } from './icons'

const checkboxVariants = cva(['group', ' transition-all', ''], {
  variants: {
    color: {
      default: [],
      primary: [],
    },
  },
  defaultVariants: {
    color: 'default',
  },
})

const checkboxIconVariants = cva(
  [
    'focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs peer size-4 shrink-0 border outline-none focus-visible:ring-[3px]',
    'rounded-[4px]  transition-all',
    'rounded-xs',
    'group-disabled:cursor-not-allowed',
  ],
  {
    variants: {
      color: {
        default: [
          'border-zinc-large',
          'group-data-[state=checked]:border-white group-data-[state=checked]:bg-white group-data-[state=checked]:text-zinc-800',
          'group-[&:not(:disabled):hover]:border-white',
          'group-disabled:border-zinc-base group-data-[state=checked]:group-disabled:bg-zinc-300/20 group-data-[state=checked]:group-disabled:border-zinc-300/20',
        ],
        primary: [
          'border-zinc-large',
          'group-data-[state=checked]:border-brand-primary group-data-[state=checked]:bg-brand-primary group-data-[state=checked]:text-zinc-800',
          'group-[&:not(:disabled):hover]:border-white',
          'group-disabled:border-zinc-base group-data-[state=checked]:group-disabled:bg-zinc-300/20 group-data-[state=checked]:group-disabled:border-zinc-300/20',
        ],
      },
    },
    defaultVariants: {
      color: 'default',
    },
  },
)

const labelVariants = cva('text-paragraph-p3', {
  variants: {
    color: {
      default: ['text-content-1', 'group-disabled:text-content-6'],
      primary: ['text-content-1', 'group-disabled:text-content-6'],
    },
  },
  defaultVariants: {
    color: 'default',
  },
})

type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root> &
  VariantProps<typeof checkboxIconVariants> & {
    label: React.ReactNode
    labelClassName?: string
  } & React.ComponentProps<typeof LabelPrimitive.Root>

function Checkbox({ className, labelClassName, color, label, ...props }: CheckboxProps) {
  const Checkbox = (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        checkboxVariants({ color }),
        {
          'flex items-center gap-2': !!label,
        },
        className,
      )}
      {...props}
    >
      <div className={checkboxIconVariants({ color })}>
        <CheckboxPrimitive.Indicator
          data-slot="checkbox-indicator"
          className="grid place-content-center text-current transition-none"
        >
          <Iconify icon="iconoir:check" className="size-full" />
        </CheckboxPrimitive.Indicator>
      </div>

      {!!label && (
        <LabelPrimitive.Root data-slot="label" className={cn(labelVariants({ color }), labelClassName)} {...props}>
          {label}
        </LabelPrimitive.Root>
      )}
    </CheckboxPrimitive.Root>
  )

  return <>{Checkbox}</>
}

export { Checkbox }
