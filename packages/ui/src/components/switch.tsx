'use client'

import * as SwitchPrimitive from '@radix-ui/react-switch'
import * as React from 'react'

import { cn } from '@mullet/ui/lib/utils'

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'focus-visible:ring-ring/50 shadow-xs peer inline-flex w-7 shrink-0 items-center outline-none transition-all focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-[#3B3D52]',
        'rounded-full bg-[#3B3D52] px-1 py-[3px]',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0',
          'size-2.5',
          'dark:data-[state=unchecked]:bg-[#0A0C27]',
          'dark:data-[state=checked]:bg-[#EED94C]',
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
