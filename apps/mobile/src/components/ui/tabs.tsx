import { cn } from '@/lib/utils';
import * as TabsPrimitive from '@rn-primitives/tabs';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, ScrollView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const Tabs = TabsPrimitive.Root;

const tabsListVariants = cva(
  'items-center rounded-lg w-full flex flex-row',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        underline: 'bg-transparent gap-2 relative border-b border-brand-default',
        icon: 'bg-transparent gap-2',
      },
      size: {
        default: 'h-9',
        sm: 'h-8',
        md: 'h-10',
        lg: 'h-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: '',
        underline: '',
        icon: 'rounded-xs hover:bg-muted active:opacity-70 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
      },
      size: {
        default: '',
        sm: 'p-xl',
        md: 'p-xl text-button-2',
        lg: '',
      }
    },
    compoundVariants: [
      {
        variant: 'icon',
        size: 'sm',
        className: 'p-xs',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface TabsContextValue extends VariantProps<typeof tabsListVariants> {
  onTriggerLayout: (value: string, layout: { x: number; width: number }) => void;
}

const TabsContext = React.createContext<TabsContextValue>({
  variant: 'default',
  size: 'default',
  onTriggerLayout: () => {},
});

function TabsList({
  className,
  variant,
  size,
  ...props
}: TabsPrimitive.ListProps &
  VariantProps<typeof tabsListVariants> &
  React.RefAttributes<TabsPrimitive.ListRef>) {
  const { value } = TabsPrimitive.useRootContext();
  const [layouts, setLayouts] = React.useState<
    Record<string, { x: number; width: number }>
  >({});
  
  const indicatorPosition = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  const onTriggerLayout = React.useCallback(
    (triggerValue: string, layout: { x: number; width: number }) => {
      setLayouts((prev) => {
        // Only update if changed to avoid infinite loops
        if (
          prev[triggerValue] &&
          prev[triggerValue].x === layout.x &&
          prev[triggerValue].width === layout.width
        ) {
          return prev;
        }
        return {
          ...prev,
          [triggerValue]: layout,
        };
      });
    },
    []
  );

  React.useEffect(() => {
    if (value && layouts[value]) {
      const layout = layouts[value];
      indicatorPosition.value = withTiming(layout.x, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });
      indicatorWidth.value = withTiming(layout.width, {
         duration: 250,
         easing: Easing.out(Easing.cubic),
      });
    }
  }, [value, layouts, indicatorPosition, indicatorWidth]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      width: indicatorWidth.value,
      transform: [{ translateX: indicatorPosition.value }],
    };
  });

  return (
    <TabsContext.Provider value={{ variant, size, onTriggerLayout }}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <TabsPrimitive.List
          className={cn(
            tabsListVariants({ variant, size }),
            Platform.select({ web: 'inline-flex w-fit', native: 'mr-auto' }),
            className
          )}
          {...props}
        >
          {props.children}
          {variant === 'underline' && (
            <Animated.View
              className="absolute bottom-0 left-0 h-[2px] bg-brand-primary"
              style={indicatorStyle}
            />
          )}
        </TabsPrimitive.List>
      </ScrollView>
      </TabsContext.Provider>
  );
}

function TabsTrigger({
  className,
  ...props
}: TabsPrimitive.TriggerProps & React.RefAttributes<TabsPrimitive.TriggerRef>) {
  const { value } = TabsPrimitive.useRootContext();
  const { variant, size, onTriggerLayout } = React.useContext(TabsContext);

  return (
      <TabsPrimitive.Trigger
        onLayout={(e) => {
          onTriggerLayout(props.value, e.nativeEvent.layout);
        }}
        className={cn(
          tabsTriggerVariants({ variant, size }),
          Platform.select({
            web: 'cursor-default',
          }),
          variant === 'icon' && props.value === value && 'border border-brand-default',
          className
        )}
        {...props}
      />
  );
}

function TabsContent({
  className,
  ...props
}: TabsPrimitive.ContentProps & React.RefAttributes<TabsPrimitive.ContentRef>) {
  return (
    <TabsPrimitive.Content
      className={cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        Platform.select({ web: 'flex-1 outline-none' }),
        className
      )}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants, tabsTriggerVariants };
