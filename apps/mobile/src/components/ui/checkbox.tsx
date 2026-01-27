import { cn } from '@/lib/utils';
import * as CheckboxPrimitive from '@rn-primitives/checkbox';
import { cva, type VariantProps } from 'class-variance-authority';
import { Platform } from 'react-native';
import { IconifyCheck } from './icons';

const DEFAULT_HIT_SLOP = 24;

const checkboxVariants = cva(
  'size-4 shrink-0 rounded-xs border flex items-center justify-center',
  {
    variants: {
      variant: {
        default: 'border-special',
        primary: 'border-special',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// 定义根容器在选中状态下的样式
const checkboxActiveVariants = cva('', {
  variants: {
    variant: {
      default: 'border-white bg-white',
      primary: 'border-primary bg-primary',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

// 定义指示器（背景）的样式
const indicatorVariants = cva('h-full w-full items-center justify-center', {
  variants: {
    variant: {
      default: 'bg-white',
      primary: 'bg-primary',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
  checkedClassName?: string;
  indicatorClassName?: string;
  iconClassName?: string;
}

function Checkbox({
  className,
  checkedClassName,
  indicatorClassName,
  iconClassName,
  variant = 'default',
  ...props
}: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        checkboxVariants({ variant, className }),
        Platform.select({
          web: 'focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive peer cursor-default outline-none transition-shadow focus-visible:ring-[3px] disabled:cursor-not-allowed',
          native: 'overflow-hidden',
        }),
        props.checked && checkboxActiveVariants({ variant }),
        props.checked && checkedClassName,
        props.disabled && 'opacity-50'
      )}
      hitSlop={DEFAULT_HIT_SLOP}
      {...props}>
      <CheckboxPrimitive.Indicator
        className={cn(indicatorVariants({ variant }), indicatorClassName)}>
        <IconifyCheck
          width={14}
          height={14}
          strokeWidth={2}
          color='#060717'
          className={cn('text-black', iconClassName)}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
