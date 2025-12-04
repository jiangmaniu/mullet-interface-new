'use client'

import * as SwitchPrimitive from '@radix-ui/react-switch'
import * as React from 'react'

import { cn } from '@mullet/ui/lib/utils'

type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root> & {
  children?: React.ReactNode
}

function Switch({ className, children, ...props }: SwitchProps) {
  const switchComp = (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'focus-visible:ring-ring/50 shadow-xs peer inline-flex w-7 shrink-0 items-center outline-none transition-all focus-visible:ring-[3px]',
        'p-xs rounded-full',
        'data-[state=checked]:bg-brand-primary data-[state=unchecked]:bg-zinc-300/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block rounded-full ring-0 transition-transform data-[state=checked]:translate-x-2.5 data-[state=unchecked]:translate-x-0',
          'size-2.5',
          'dark:data-[state=unchecked]:bg-zinc-500',
          'dark:data-[state=checked]:bg-zinc-500',
        )}
      />
    </SwitchPrimitive.Root>
  )

  if (children) {
    return (
      <div className="gap-medium flex items-center">
        {switchComp}

        <div
          className={cn('text-paragraph-p3 text-content-4', {
            'text-content-6': props.disabled,
          })}
        >
          {children}
        </div>
      </div>
    )
  }

  return <>{switchComp}</>
}

export { Switch }
