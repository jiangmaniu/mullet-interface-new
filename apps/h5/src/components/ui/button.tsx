import {
  Button as AriaButton,
  composeRenderProps,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components'
import { type VariantProps, cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground pressed:opacity-90',
        destructive: 'bg-destructive text-destructive-foreground pressed:opacity-90',
        outline: 'border border-input bg-transparent pressed:bg-accent pressed:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground pressed:opacity-80',
        ghost: 'pressed:bg-accent pressed:text-accent-foreground',
        link: 'text-primary underline-offset-4 pressed:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-2 px-3',
        lg: 'h-11 rounded-2 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

interface ButtonProps extends AriaButtonProps, VariantProps<typeof buttonVariants> {}

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <AriaButton
      className={composeRenderProps(className, (className) =>
        cn(buttonVariants({ variant, size, className })),
      )}
      {...props}
    />
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
