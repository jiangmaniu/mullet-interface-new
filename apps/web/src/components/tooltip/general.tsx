import { isNull, isUndefined } from 'lodash-es'
import type { ComponentProps, PropsWithChildren } from 'react'

import { cn } from '@mullet/ui/lib/utils'
import { Tooltip, TooltipArrow, TooltipContent, TooltipTrigger } from '@mullet/ui/tooltip'

import { TooltipProvider } from '../providers/global/tooltip-provider'

type CommonTooltipProps = PropsWithChildren<
  Omit<ComponentProps<typeof TooltipContent>, 'content'> &
    ComponentProps<typeof Tooltip> & {
      content?: React.ReactNode
    }
>

export const GeneralTooltip = ({
  children,
  content,
  open,
  align = 'start',
  className,
  alignOffset = -20,
  side = 'bottom',
  sideOffset,
  defaultOpen,
  onOpenChange,
  ...props
}: CommonTooltipProps) => {
  if (isUndefined(content) || isNull(content)) {
    return <>{children}</>
  }

  return (
    <TooltipProvider>
      <Tooltip {...{ open, defaultOpen, onOpenChange }}>
        <TooltipTrigger className="cursor-help" asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent
          className={cn('max-w-[220px]', className)}
          alignOffset={alignOffset}
          sideOffset={sideOffset}
          side={side}
          align={align}
          {...props}
        >
          {content}

          <TooltipArrow
            className="relative -z-1 size-2.5 translate-y-[calc(-50%_-_0px)] rotate-45 rounded-[2px] border-r border-b border-[#3B3D52] bg-[#0E123A] fill-[#0E123A]"
            {...{ variant: props.variant }}
          />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
