import { Slot, Slottable } from '@radix-ui/react-slot'
import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

// import { Icons } from './icons'
import { cn } from '../lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center gap-1 box-border justify-center transition-all text-[14px] whitespace-nowrap font-medium ring-offset-background ',
    // 'enabled:active:scale-95',
    'focus-visible:outline-focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    `data-[disabled='true']:cursor-not-allowed data-[disabled='true']:opacity-80`,
    `disabled:cursor-not-allowed disabled:opacity-80`,
  ],
  {
    variants: {
      color: {
        default: '',
        primary: '',
      },
      variant: {
        primary: [
          // 'text-[#0A0C27] bg-[#EED94C]',
          // 'enabled:hover:bg-[#FDFF84] enabled:hover:outline-none enabled:hover:ring-3 enabled:hover:ring-[#FDFF84]',
          // 'focus-visible:bg-[#FDFF84] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#FDFF84]',
          '',
        ],

        destructive: 'bg-destructive text-destructive-foreground enabled:hover:bg-destructive/90',
        outline: [
          // 'border border-[#3B3D52] text-white bg-transparent',
          // ' enabled:hover:text-white enabled:hover:outline-none enabled:hover:ring-3 enabled:hover:border-white',
          // ' focus-visible:text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:border-white ',
          '',
        ],
        secondary: [
          'border border-[#0A0C27] bg-[#0A0C27] ',
          'enabled:hover:bg-[#FDFF84] enabled:hover:text-[#0A0C27] enabled:hover:outline-none enabled:hover:ring-3 enabled:hover:ring-[#FDFF84]',
          'focus-visible:bg-[#FDFF84] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#FDFF84]',
        ],
        ghost: 'enabled:hover:bg-[#FDFF84] bg-transparent text-[#EED94C] enabled:hover:text-[#0A0C27]',
        // link: 'relative after:absolute after:bg-primary after:bottom-2 after:h-[1px] after:w-2/3 after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-300',
        link: [
          'text-[#EED94C]! font-semibold leading-none text-xs',
          'enabled:hover:bg-[#FDFF84]',
          'enabled:hover:text-interactive-link-focus',
        ],
      },
      size: {
        middle: 'min-h-8 py-3xs px-s box-border rounded-small leading-6 font-semibold',
        middle2: 'min-h-10 min-w-[130px] py-2.5 px-5 box-border rounded-[8px]',
        sm: 'py-1.5 px-4 rounded-1 ',
        md: 'rounded-2 py-2 px-6',
        lg: 'px-8 py-2.5 rounded-2',
        icon: 'p-small rounded-[8px]',
        large: 'p-4 rounded-2xl text-lg',
        submit: 'py-4 text-lg leading-[30px]',
      },
    },
    compoundVariants: [
      {
        variant: 'primary',
        color: 'default',
        class: [
          'text-content-1 text-button-1 bg-zinc-300/20',
          'enabled:hover:bg-zinc-300/40 enabled:hover:shadow-base',
          'enabled:active:shadow-inset-base',
          'disabled:text-content-6',
        ],
      },
      {
        variant: 'outline',
        color: 'default',
        class: [
          'text-content-1 text-button-1 border border-zinc-300/20',
          'enabled:hover:bg-zinc-300/0 enabled:hover:border-zinc-base enabled:hover:shadow-base',
          'enabled:active:shadow-inset-base enabled:active:border-white',
          'disabled:text-content-6 disabled:border-zinc-xs',
        ],
      },

      {
        variant: 'primary',
        color: 'primary',
        class: [
          'text-content-foreground text-button-1 bg-brand-primary',
          'enabled:hover:bg-yellow-400 enabled:hover:shadow-base',
          'enabled:active:shadow-inset-base',
          'disabled:text-content-6 disabled:bg-zinc-300/20',
        ],
      },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'sm',
      color: 'default',
    },
  },
)

interface IconProps {
  LeftIcon?: React.ReactNode
  RightIcon?: React.ReactNode
}

export interface ButtonProps
  extends Omit<React.ComponentProps<'button'>, 'color'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  block?: boolean

  href?: string
  target?: React.HTMLAttributeAnchorTarget | undefined
  replace?: boolean | undefined
}

const Button = ({
  className,
  variant,
  size,
  color,
  asChild = false,
  loading = false,
  block = false,
  children,
  LeftIcon,
  RightIcon,

  disabled = false,

  type = 'button',
  href,
  // target,
  // replace,
  ref,
  ...props
}: ButtonProps & IconProps) => {
  const Comp = asChild ? Slot : 'button'

  const Button = (
    <Comp
      className={cn(
        buttonVariants({
          variant,
          size,
          color,
          className: cn(
            {
              'flex w-full flex-1': block,
            },
            className,
          ),
        }),
      )}
      ref={ref}
      type={type}
      disabled={disabled || loading}
      {...props}
    >
      {/* {(LeftIcon || loading) && <>{LeftIcon ? LeftIcon : loading ? <Icons.lucide.Spinner className="size-4 animate-spin" /> : null}</>} */}
      <Slottable>{children}</Slottable>
      {RightIcon && <>{RightIcon}</>}
    </Comp>
  )

  if (href && !disabled) {
    return (
      <LinkButton
        href={href}
        block={block}
        // target={target}
        // replace={replace}
        className={className}
        variant={variant}
        size={size}
        color={color}
        LeftIcon={LeftIcon}
        RightIcon={RightIcon}
      >
        {children}
      </LinkButton>
    )
  }

  return <>{Button}</>
}

Button.displayName = 'Button'

export type LinkButtonProps = Omit<React.ComponentProps<'a'>, 'color'> &
  VariantProps<typeof buttonVariants> &
  IconProps & { block?: boolean; disabled?: boolean; href?: string }

const LinkButton = ({
  className,
  variant,
  size,
  color,

  block = false,
  children,
  LeftIcon,
  RightIcon,

  disabled = false,

  ...props
}: LinkButtonProps) => {
  const Button = (
    <a
      className={cn(
        buttonVariants({
          variant,
          size,
          color,
          className: cn(
            {
              'flex w-full flex-1': block,
            },
            className,
          ),
        }),
      )}
      data-disabled={disabled}
      // ref={ref}
      {...props}
      // onClick={(...args) => {
      //   props.onClick?.(...args)
      //   if (href) {
      //     push(href)
      //   }
      // }}
    >
      {LeftIcon && <div>{LeftIcon ? LeftIcon : null}</div>}
      <Slottable>{children}</Slottable>
      {RightIcon && <div>{RightIcon}</div>}
    </a>
  )

  return <>{Button}</>
}

LinkButton.displayName = 'LinkButton'

const IconButton = ({ className, variant = 'outline', size = 'icon', ...props }: ButtonProps & IconProps) => {
  return <Button className={className} variant={variant} size={size} {...props} />
}

export { Button, buttonVariants, IconButton, LinkButton }
