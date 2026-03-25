import {
  TextField as AriaTextField,
  Input as AriaInput,
  Label as AriaLabel,
  FieldError as AriaFieldError,
  Text as AriaText,
  composeRenderProps,
  type TextFieldProps as AriaTextFieldProps,
  type InputProps as AriaInputProps,
} from 'react-aria-components'
import { cn } from '@/lib/utils'

function TextField({ className, ...props }: AriaTextFieldProps) {
  return <AriaTextField className={cn('group flex flex-col gap-1.5', className)} {...props} />
}

function Input({ className, ...props }: AriaInputProps) {
  return (
    <AriaInput
      className={composeRenderProps(className, (className) =>
        cn(
          'flex h-10 w-full rounded-2 border border-input bg-transparent px-3 py-2 text-sm ring-offset-background transition-colors',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        ),
      )}
      {...props}
    />
  )
}

function Label({ className, ...props }: React.ComponentProps<typeof AriaLabel>) {
  return (
    <AriaLabel
      className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
      {...props}
    />
  )
}

function FieldError({ className, ...props }: React.ComponentProps<typeof AriaFieldError>) {
  return (
    <AriaFieldError className={cn('text-sm text-destructive', className)} {...props} />
  )
}

function Description({ className, ...props }: React.ComponentProps<typeof AriaText>) {
  return (
    <AriaText
      slot="description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

export { TextField, Input, Label, FieldError, Description }
