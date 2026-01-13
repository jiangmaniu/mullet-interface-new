import { isNull, isUndefined } from 'lodash-es'
import type { ComponentProps, PropsWithChildren } from 'react'

import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from '@mullet/ui/tooltip'
import { cn } from '@mullet/ui/utils'

type CommonTooltipProps = PropsWithChildren<
  Omit<ComponentProps<typeof TooltipContent>, 'content'> &
    ComponentProps<typeof Tooltip> & {
      content?: React.ReactNode
      isDisabledCursorHelp?: boolean
      triggerClassName?: string
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
  isDisabledCursorHelp,
  onOpenChange,
  triggerClassName,
  ...props
}: CommonTooltipProps) => {
  if (isUndefined(content) || isNull(content)) {
    return <>{children}</>
  }

  return (
    <TooltipProvider>
      <Tooltip {...{ open, defaultOpen, onOpenChange }}>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'block',
              {
                'cursor-help': !isDisabledCursorHelp,
              },
              triggerClassName,
            )}
          >
            {children}
          </div>
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
            className={cn(
              'relative -z-10 size-2.5 translate-y-[calc(-50%_-_0px)] rotate-45 rounded-[2px] border-r border-b',
              'border-zinc-base bg-zinc-800/90 backdrop-blur-[12px]',
            )}
            {...{ variant: props.variant }}
          />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
