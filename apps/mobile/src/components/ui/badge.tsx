import * as React from 'react';
import { View } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { TextClassContext } from '@/components/ui/text';

const badgeVariants = cva(
  'inline-flex items-center rounded-xs px-xs',
  {
    variants: {
      variant: {
        default: '',
      },
      color: {
        default: 'bg-button',
        rise: 'bg-market-rise',
        fall: 'bg-market-fall',
        red: 'bg-red-500',
        green: 'bg-green-500',
        secondary: 'bg-brand-support',
      },
    },
    defaultVariants: {
      variant: 'default',
      color: 'default'
    },
  }
);

const badgeTextVariants = cva('', {
  variants: {
    variant: {
      default: 'text-paragraph-p3',
    },
    color: {
      default: 'text-content-1',
      rise: 'text-market-rise-foreground',
      fall: 'text-market-fall-foreground',
      red: 'text-content-1',
      green: 'text-content-foreground',
      secondary: 'text-content-1',
    },
  },
  defaultVariants: {
    variant: 'default',
    color: 'default',
  },
});

export interface BadgeProps
  extends React.ComponentPropsWithoutRef<typeof View>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, color, ...props }: BadgeProps) {
  return (
    <TextClassContext.Provider value={badgeTextVariants({ variant, color })}>
      <View className={cn(badgeVariants({ variant, color }), className)} {...props} />
    </TextClassContext.Provider>
  );
}

export { Badge, badgeVariants };
