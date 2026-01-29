import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as Slot from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { ActivityIndicator, Platform, Pressable, View } from 'react-native';

const buttonVariants = cva(
  cn(
    'group flex-row items-center justify-center gap-1 rounded-[8px] transition-all active:opacity-80 active:scale-[0.98]',
    Platform.select({
      web: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap select-none",
    })
  ),
  {
    variants: {
      color: {
        default: '',
        primary: '',
      },
      variant: {
        none: '',
        primary: '',
        destructive: 'bg-destructive enabled:hover:bg-destructive/90',
        outline: 'border border-[#3B3D52] bg-transparent',
        secondary: 'bg-[#0A0C27]',
        ghost: 'bg-transparent',
        link: 'text-[#EED94C] web:font-semibold web:leading-none text-xs',
      },
      size: {
        sm: 'py-1.5 px-4 rounded-1',
        md: 'py-2 px-6 rounded-2',
        lg: 'py-xl px-[29px] rounded-2',
        icon: 'rounded-[8px]',
      },
    },
    compoundVariants: [
      {
        variant: 'primary',
        color: 'default',
        className: cn(
          'bg-zinc-300/20',
          Platform.select({ web: 'enabled:hover:bg-zinc-300/40 enabled:hover:shadow-base' })
        ),
      },
      {
        variant: 'outline',
        color: 'default',
        className: cn(
          'border-zinc-300/20',
          Platform.select({
            web: 'enabled:hover:bg-zinc-300/0 enabled:hover:border-zinc-base enabled:hover:shadow-base'
          })
        ),
      },
      {
        variant: 'primary',
        color: 'primary',
        className: cn(
          'bg-brand-primary',
          Platform.select({ web: 'enabled:hover:bg-yellow-400 enabled:hover:shadow-base' })
        ),
      },
      {
        variant: 'secondary',
        className: Platform.select({
          web: 'enabled:hover:bg-[#FDFF84] enabled:hover:ring-[#FDFF84]'
        })
      },
      {
        variant: 'ghost',
        className: Platform.select({
          web: 'enabled:hover:bg-[#FDFF84]'
        })
      }
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'sm',
      color: 'default',
    },
  }
);

const buttonTextVariants = cva(
  cn(
    'text-sm font-medium text-foreground',
    Platform.select({ web: 'pointer-events-none transition-colors' })
  ),
  {
    variants: {
      color: {
        default: '',
        primary: '',
      },
      variant: {
        none: 'text-content-4',
        primary: '',
        destructive: 'text-destructive-foreground',
        outline: 'text-white',
        secondary: 'text-white',
        ghost: 'text-white',
        link: 'text-[#EED94C]',
      },
      size: {
        sm: 'text-button-1',
        md: 'text-button-2',
        lg: 'text-button-2',
        icon: ''
      },
    },
    compoundVariants: [
      {
        variant: 'primary',
        color: 'default',
        className: 'text-content-1',
      },
      {
        variant: 'outline',
        color: 'default',
        className: 'text-content-1'
      },
      {
        variant: 'primary',
        color: 'primary',
        className: 'text-content-foreground' // snippet: text-content-foreground
      },
      // Interaction states for text (hover etc) are hard in RN without state, 
      // but we can add conditional classes if needed or rely on parent group-hover
      {
        variant: 'ghost',
        className: 'group-hover:text-[#0A0C27]'
      },
      {
        variant: 'secondary',
        className: 'group-hover:text-[#0A0C27]'
      }
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'sm',
      color: 'default',
    },
  }
);

type ButtonProps = Omit<React.ComponentProps<typeof Pressable>, 'children'> &
  React.RefAttributes<typeof Pressable> &
  VariantProps<typeof buttonVariants> & {
    children?: React.ReactNode;
    asChild?: boolean;
    loading?: boolean;
    block?: boolean;
    LeftIcon?: React.ReactNode;
    RightIcon?: React.ReactNode;
  };

function Button({
  className,
  variant,
  size,
  color,
  asChild = false,
  loading = false,
  block = false,
  LeftIcon,
  RightIcon,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Pressable : Pressable;

  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size, color })}>
      <Comp
        className={cn(
          props.disabled && 'opacity-50',
          block && 'w-full flex-1',
          buttonVariants({ variant, size, color }),
          className
        )}
        role="button"
        disabled={props.disabled || loading}
        {...props}
      >
        {loading && <ActivityIndicator size="small" className="mr-2" color="currentColor" />}
        {!loading && LeftIcon && <View className="mr-1">{LeftIcon}</View>}
        {children}
        {RightIcon && <View className="ml-1">{RightIcon}</View>}
      </Comp>
    </TextClassContext.Provider>
  );
}

const IconButton = ({ className, variant = 'outline', size = 'icon', ...props }: ButtonProps) => {
  return <Button className={className} variant={variant} size={size} {...props} />
}

export { Button, buttonVariants, buttonTextVariants, IconButton };
export type { ButtonProps };
