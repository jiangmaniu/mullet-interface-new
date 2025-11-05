'use client'

import { Toaster as Sonner, toast, ToasterProps } from 'sonner'

import { cn } from '../lib/utils'
import { IconClose } from './icons'

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      // theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: cn('bg-[#0E123A] w-[var(--width)] gap-1.5 flex items-start border border-[#3B3D52] rounded-[8px] p-4'),
          title: cn('text-[16px] text-white'),
          description: cn('text-[14px] text-[#9FA0B0]'),
          content: cn('flex flex-col gap-2 flex-1'),
          closeButton: cn(
            'order-last text-[#D8D8D8] p-0.5 size-5 justify-center items-center flex leading-none bg-[#3B3D52] rounded-full active:scale-95 transition-transform',
          ),
          success: cn('text-[#2EBC84]'),
          error: cn('text-[#FF453A]'),
          info: cn('text-[#2167ff]'),
          icon: cn('flex'),
        },
        closeButton: true,
      }}
      style={
        {
          '--width': '380px',
          // '--normal-bg': 'var(--popover)',
          // '--normal-text': 'var(--popover-foreground)',
          // '--normal-border': 'var(--border)'
        } as React.CSSProperties
      }
      icons={{
        close: <IconClose size={14} />,
      }}
      {...props}
    />
  )
}

export { toast, Toaster }
