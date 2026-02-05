import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as Slot from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { ActivityIndicator, Platform, Pressable, View } from 'react-native';


const buttonVariants = cva(
  'group flex-row items-center justify-center gap-medium transition-all',
  {
    variants: {
      disabled: {
        true: '',
      },
      color: {
        default: '',
        primary: '',
      },
      variant: {
        solid: '',
        outline: 'border',
        none: 'underline',
        icon: ''
      },
      size: {
        sm: 'rounded-xs',
        md: 'rounded-small',
        lg: 'rounded-small',
      },
    },
    compoundVariants: [
      { variant: 'solid', size: 'sm', className: 'py-small px-2xl' },
      { variant: 'solid', size: 'md', className: 'py-medium px-3xl' },
      { variant: 'solid', size: 'lg', className: 'py-xl px-4xl' },
      { variant: 'solid', color: 'default', className: 'bg-button active:inset-shadow-base' },
      { variant: 'solid', color: 'primary', className: 'bg-brand-primary active:inset-shadow-base' },
      { variant: 'solid', color: 'default', disabled: true, className: 'bg-button pointer-events-none' },
      { variant: 'solid', color: 'primary', disabled: true, className: 'bg-button pointer-events-none' },

      { variant: 'outline', size: 'sm', className: 'py-small px-2xl' },
      { variant: 'outline', size: 'md', className: 'py-medium px-3xl' },
      { variant: 'outline', size: 'lg', className: 'py-medium px-4xl' },
      { variant: 'outline', color: 'default', className: 'border-brand-default active:border-brand-important' },
      { variant: 'outline', color: 'primary', className: '' },
      { variant: 'outline', color: 'default', disabled: true, className: 'border-brand-default pointer-events-none' },
      { variant: 'outline', color: 'primary', disabled: true, className: 'pointer-events-none' },

      { variant: 'none', size: 'sm', className: 'py-small' },
      { variant: 'none', size: 'md', className: 'py-medium' },
      { variant: 'none', size: 'lg', className: 'py-medium' },
      { variant: 'none', color: 'default', className: '' },
      { variant: 'none', color: 'primary', className: '' },
      { variant: 'none', color: 'default', disabled: true, className: 'pointer-events-none' },
      { variant: 'none', color: 'primary', disabled: true, className: 'pointer-events-none' },

      { variant: 'icon', size: 'sm', className: 'py-medium' },
      { variant: 'icon', size: 'md', className: '' },
      { variant: 'icon', size: 'lg', className: '' },
      { variant: 'icon', color: 'default', className: '' },
      { variant: 'icon', color: 'primary', className: '' },
      { variant: 'icon', color: 'default', disabled: true, className: 'pointer-events-none' },
      { variant: 'icon', color: 'primary', disabled: true, className: 'pointer-events-none' },
    ],
    defaultVariants: {
      variant: 'solid',
      size: 'sm',
      color: 'default',
      disabled: false,
    },
  }
);

const buttonTextVariants = cva(
  '',
  {
    variants: {
      disabled: {
        true: '',
      },
      color: {
        default: '',
        primary: '',
      },
      variant: {
        solid: '',
        outline: '',
        none: '',
        icon: ''
      },
      size: {
        sm: 'text-button-1',
        md: 'text-button-2',
        lg: 'text-button-2',
      },
    },
    compoundVariants: [
      { variant: 'solid', size: 'sm', className: '' },
      { variant: 'solid', size: 'md', className: '' },
      { variant: 'solid', size: 'lg', className: '' },
      { variant: 'solid', color: 'default', className: 'text-content-1' },
      { variant: 'solid', color: 'primary', className: 'text-content-foreground' },
      { variant: 'solid', color: 'default', disabled: true, className: 'text-content-6' },
      { variant: 'solid', color: 'primary', disabled: true, className: 'text-content-6' },

      { variant: 'outline', size: 'sm', className: '' },
      { variant: 'outline', size: 'md', className: '' },
      { variant: 'outline', size: 'lg', className: '' },
      { variant: 'outline', color: 'default', className: 'text-content-1' },
      { variant: 'outline', color: 'primary', className: '' },
      { variant: 'outline', color: 'default', disabled: true, className: 'text-brand-divider-line' },
      { variant: 'outline', color: 'primary', disabled: true, className: '' },

      { variant: 'none', size: 'sm', className: '' },
      { variant: 'none', size: 'md', className: '' },
      { variant: 'none', size: 'lg', className: '' },
      { variant: 'none', color: 'default', className: 'text-content-4' },
      { variant: 'none', color: 'primary', className: 'text-brand-primary' },
      { variant: 'none', color: 'default', disabled: true, className: 'text-brand-divider-line' },
      { variant: 'none', color: 'primary', disabled: true, className: 'text-brand-divider-line' },

      { variant: 'icon', size: 'sm', className: '' },
      { variant: 'icon', size: 'md', className: '' },
      { variant: 'icon', size: 'lg', className: '' },
      { variant: 'icon', color: 'default', className: 'text-content-1' },
      { variant: 'icon', color: 'primary', className: '' },
      { variant: 'icon', color: 'default', disabled: true, className: 'text-brand-divider-line' },
      { variant: 'icon', color: 'primary', disabled: true, className: '' },
    ],
    defaultVariants: {
      variant: 'solid',
      size: 'sm',
      color: 'default',
      disabled: false,
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
  // coerce to boolean to match CVA expectation
  const isDisabled = !!(props.disabled || loading);

  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size, color, disabled: isDisabled })}>
      <Comp
        className={cn(
          // props.disabled && 'opacity-50',
          block && 'w-full flex-1',
          buttonVariants({ variant, size, color, disabled: isDisabled }),
          className
        )}
        role="button"
        disabled={props.disabled || loading}
        {...props}
      >
        {loading && <ActivityIndicator size="small" className="mr-2" color="currentColor" />}
        {!loading && LeftIcon && <View className="mr-1">{LeftIcon}</View>}
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              className: cn(
                buttonTextVariants({ variant, size, color, disabled: isDisabled }),
                (child.props as any).className
              )
            });
          }
          return child;
        })}
        {RightIcon && <View className="ml-1">{RightIcon}</View>}
      </Comp>
    </TextClassContext.Provider>
  );
}

const IconButton = ({ className, variant = 'icon', ...props }: ButtonProps) => {
  return <Button className={className} variant={variant} {...props} />
}

export { Button, buttonVariants, buttonTextVariants, IconButton };
export type { ButtonProps };
