import {
  Select as AriaSelect,
  SelectValue as AriaSelectValue,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  Popover as AriaPopover,
  composeRenderProps,
  type SelectProps as AriaSelectProps,
  type ListBoxItemProps as AriaListBoxItemProps,
} from 'react-aria-components'
import { ChevronDown } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

function Select<T extends object>({ className, ...props }: AriaSelectProps<T>) {
  return (
    <AriaSelect
      className={composeRenderProps(className, (className) =>
        cn('group flex flex-col gap-1.5', className),
      )}
      {...props}
    />
  )
}

function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="outline"
      className={cn('flex w-full items-center justify-between', className)}
      {...props}
    >
      <AriaSelectValue className="flex-1 text-left data-[placeholder]:text-muted-foreground" />
      <ChevronDown className="size-4 opacity-50" />
    </Button>
  )
}

function SelectPopover({ className, ...props }: React.ComponentProps<typeof AriaPopover>) {
  return (
    <AriaPopover
      className={composeRenderProps(className, (className) =>
        cn(
          'z-50 w-[var(--trigger-width)] overflow-y-auto rounded-2 border bg-popover p-1 shadow-md',
          'data-[entering]:animate-in data-[entering]:fade-in-0 data-[entering]:zoom-in-95',
          'data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95',
          className,
        ),
      )}
      {...props}
    />
  )
}

function SelectContent<T extends object>({ className, ...props }: React.ComponentProps<typeof AriaListBox<T>>) {
  return <AriaListBox className={cn('outline-none', className)} {...props} />
}

function SelectItem({ className, ...props }: AriaListBoxItemProps) {
  return (
    <AriaListBoxItem
      className={composeRenderProps(className, (className) =>
        cn(
          'relative flex w-full cursor-default select-none items-center rounded-1 px-2 py-1.5 text-sm outline-none',
          'data-[focused]:bg-accent data-[focused]:text-accent-foreground',
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className,
        ),
      )}
      {...props}
    />
  )
}

export { Select, SelectTrigger, SelectPopover, SelectContent, SelectItem }
