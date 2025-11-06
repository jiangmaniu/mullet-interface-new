import * as React from 'react'

import { cn } from '../lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive field-sizing-content shadow-xs flex w-full border border-[#3B3D52] bg-transparent outline-none transition-[color,box-shadow] placeholder:text-[#767783] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        'selection:bg-[#3B3D52] selection:text-white',
        'text-[14px] text-white',
        'min-h-20',
        'px-3.5 py-3',
        'rounded-[8px]',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
