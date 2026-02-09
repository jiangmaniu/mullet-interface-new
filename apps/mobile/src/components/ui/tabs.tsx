import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { TabView, Route } from 'react-native-tab-view';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Text, TextClassContext } from '@/components/ui/text';

type TabVariant = 'solid' | 'outline' | 'underline' | 'text' | 'icon' | 'icons-and-text';
type TabSize = 'sm' | 'md' | 'lg';

const tabsListVariants = cva(
  'items-center w-full flex flex-row',
  {
    variants: {
      variant: {
        solid: 'gap-medium',
        outline: 'gap-medium',
        underline: 'relative',
        text: 'gap-xs',
        icon: 'gap-medium',
        'icons-and-text': 'gap-medium',
      },
      size: {
        sm: '',
        md: 'gap-xl',
        lg: '',
      },
    },
    defaultVariants: {
      variant: 'underline',
      size: 'sm',
    },
  }
);

const tabsTriggerVariants = cva(
  'items-center justify-center flex-row',
  {
    variants: {
      variant: {
        solid: 'rounded-small',
        outline: 'rounded-small',
        underline: '',
        text: '',
        icon: 'rounded-xs',
        'icons-and-text': 'rounded-small',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
      },
      state: {
        active: '',
        inactive: '',
        hover: '',
        click: '',
      },
    },
    compoundVariants: [
      // === Solid 变体 ===
      { variant: 'solid', state: 'inactive', className: 'bg-button' },
      { variant: 'solid', state: 'hover', className: 'bg-button shadow-base' },
      { variant: 'solid', state: 'click', className: 'bg-button-box shadow-sm' },
      { variant: 'solid', state: 'active', className: 'bg-brand-primary' },
      // Solid 尺寸
      { variant: 'solid', size: 'sm', className: 'px-2xl py-small' },
      { variant: 'solid', size: 'md', className: 'px-3xl py-medium h-8' },
      { variant: 'solid', size: 'lg', className: 'px-3xl py-xl' },

      // === Outline 变体 ===
      { variant: 'outline', state: 'inactive', className: '' },
      { variant: 'outline', state: 'hover', className: 'shadow-base' },
      { variant: 'outline', state: 'click', className: 'border border-brand-important shadow-sm' },
      { variant: 'outline', state: 'active', className: 'border border-brand-secondary-2' },
      // Outline 尺寸
      { variant: 'outline', size: 'sm', className: 'px-2xl py-small' },
      { variant: 'outline', size: 'md', className: 'px-3xl py-medium h-8' },

      // === Underline 变体 ===
      { variant: 'underline', state: 'inactive', className: '' },
      { variant: 'underline', state: 'hover', className: '' },
      { variant: 'underline', state: 'click', className: '' },
      // { variant: 'underline', state: 'active', className: 'border-b border-brand-primary' }, // 已使用其他方式实现下划线，能实现滑动效果
      // Underline 尺寸
      { variant: 'underline', size: 'sm', className: 'px-2xl py-medium' },
      { variant: 'underline', size: 'md', className: 'p-xl' },

      // === Text 变体 ===
      { variant: 'text', state: 'inactive', className: '' },
      { variant: 'text', state: 'hover', className: '' },
      { variant: 'text', state: 'click', className: '' },
      { variant: 'text', state: 'active', className: '' },
      // Text 尺寸
      { variant: 'text', size: 'sm', className: 'p-xs h-6' },
      { variant: 'text', size: 'md', className: 'px-xs py-medium' },

      // === Icon 变体 ===
      { variant: 'icon', state: 'inactive', className: '' },
      { variant: 'icon', state: 'hover', className: 'border border-brand-important' },
      { variant: 'icon', state: 'click', className: 'border border-brand-important' },
      { variant: 'icon', state: 'active', className: 'border border-brand-default' },
      // Icon 尺寸
      { variant: 'icon', size: 'sm', className: 'p-xs size-5' },

      // === Icons and Text 变体 ===
      { variant: 'icons-and-text', state: 'inactive', className: 'bg-button' },
      { variant: 'icons-and-text', state: 'hover', className: 'bg-button border border-brand-important' },
      { variant: 'icons-and-text', state: 'click', className: 'border border-brand-important' },
      { variant: 'icons-and-text', state: 'active', className: 'border border-brand-secondary-2' },
      // Icons and Text 尺寸
      { variant: 'icons-and-text', size: 'sm', className: 'px-xl py-xs rounded-xs w-32' },
      { variant: 'icons-and-text', size: 'md', className: 'px-xl py-xs rounded-small w-40' },
    ],
    defaultVariants: {
      variant: 'underline',
      size: 'sm',
      state: 'inactive',
    },
  }
);

const tabsTriggerTextVariants = cva(
  'font-medium leading-xs',
  {
    variants: {
      variant: {
        solid: '',
        outline: '',
        underline: '',
        text: '',
        icon: '',
        'icons-and-text': '',
      },
      size: {
        sm: 'text-button-1',
        md: 'text-button-2',
        lg: 'text-button-2',
      },
      state: {
        active: '',
        inactive: '',
        hover: '',
        click: '',
      },
    },
    compoundVariants: [
      // === Solid 变体 ===
      // 选中状态使用深色文字（在黄色背景上）
      { variant: 'solid', state: 'active', className: 'text-content-foreground' },
      { variant: 'solid', state: 'inactive', className: 'text-content-4' },
      { variant: 'solid', state: 'hover', className: 'text-content-1' },
      { variant: 'solid', state: 'click', className: 'text-content-1' },

      // === Outline 变体 ===
      { variant: 'outline', state: 'active', className: 'text-content-1' },
      { variant: 'outline', state: 'inactive', className: 'text-content-4' },
      { variant: 'outline', state: 'hover', className: 'text-content-1' },
      { variant: 'outline', state: 'click', className: 'text-content-1' },

      // === Underline 变体 ===
      { variant: 'underline', state: 'active', className: 'text-content-1' },
      { variant: 'underline', state: 'inactive', className: 'text-content-4' },
      { variant: 'underline', state: 'hover', className: 'text-content-1' },
      { variant: 'underline', state: 'click', className: 'text-content-1' },

      // === Text 变体 ===
      { variant: 'text', state: 'active', className: 'text-content-1' },
      { variant: 'text', state: 'inactive', className: 'text-content-4' },
      { variant: 'text', state: 'hover', className: 'text-content-1' },
      { variant: 'text', state: 'click', className: 'text-content-1' },

      // === Icon 变体 ===
      // 选中状态使用深色文字（在黄色背景上）
      { variant: 'icon', state: 'active', className: 'text-content-foreground' },
      { variant: 'icon', state: 'inactive', className: 'text-content-4' },
      { variant: 'icon', state: 'hover', className: 'text-content-1' },
      { variant: 'icon', state: 'click', className: 'text-content-1' },

      // === Icons and Text 变体 ===
      { variant: 'icons-and-text', state: 'active', className: 'text-content-1' },
      { variant: 'icons-and-text', state: 'inactive', className: 'text-content-1' },
      { variant: 'icons-and-text', state: 'hover', className: 'text-content-1' },
      { variant: 'icons-and-text', state: 'click', className: 'text-content-1' },
    ],
    defaultVariants: {
      variant: 'underline',
      size: 'sm',
      state: 'inactive',
    },
  }
);

// TabView-based Tabs component (with swipe support)
interface SwipeableTabsProps {
  routes: Route[];
  renderScene: (props: { route: Route }) => React.ReactNode;
  variant?: TabVariant;
  size?: TabSize;
  className?: string;
  tabBarClassName?: string;
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  swipeEnabled?: boolean;
  lazy?: boolean;
  renderTabBarRight?: () => React.ReactNode;
  tabFlex?: boolean;
}

function SwipeableTabs({
  routes,
  renderScene,
  variant = 'underline',
  size = 'sm',
  className,
  tabBarClassName,
  initialIndex = 0,
  onIndexChange,
  swipeEnabled = true,
  lazy = true,
  renderTabBarRight,
  tabFlex = false,
}: SwipeableTabsProps) {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(initialIndex);
  const handleIndexChange = (newIndex: number) => {
    setIndex(newIndex);
    onIndexChange?.(newIndex);
  };

  const [tabLayouts, setTabLayouts] = React.useState<Record<string, { x: number; width: number }>>({});
  const indicatorPosition = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  React.useEffect(() => {
    const currentRoute = routes[index];
    if (currentRoute && tabLayouts[currentRoute.key]) {
      const layout = tabLayouts[currentRoute.key];
      indicatorPosition.value = withTiming(layout.x, { duration: 250, easing: Easing.out(Easing.cubic) });
      indicatorWidth.value = withTiming(layout.width, { duration: 250, easing: Easing.out(Easing.cubic) });
    }
  }, [index, tabLayouts, routes, indicatorPosition, indicatorWidth]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    width: indicatorWidth.value,
    transform: [{ translateX: indicatorPosition.value }],
  }));

  const onTabLayout = React.useCallback((key: string, layout: { x: number; width: number }) => {
    setTabLayouts((prev) => {
      if (prev[key]?.x === layout.x && prev[key]?.width === layout.width) {
        return prev;
      }
      return { ...prev, [key]: layout };
    });
  }, []);

  const renderTabBar = () => {
    return (
      <View className={cn(tabsListVariants({ variant, size }), tabBarClassName)}>
        <View className="flex-row" style={{ flex: renderTabBarRight ? 1 : undefined }}>
          {routes.map((route) => {
            const isActive = routes[index].key === route.key;
            const textClassName = tabsTriggerTextVariants({ variant, size, state: isActive ? 'active' : 'inactive' });

            return (
              <Pressable
                key={route.key}
                onLayout={(e) => onTabLayout(route.key, { x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width })}
                onPress={() => handleIndexChange(routes.findIndex((r) => r.key === route.key))}
                className={cn(tabsTriggerVariants({ variant, size, state: isActive ? 'active' : 'inactive' }), tabFlex && 'flex-1')}
              >
                <Text className={textClassName}>{route.title}</Text>
              </Pressable>
            );
          })}
          {variant === 'underline' && (
            <Animated.View
              className="absolute bottom-0 left-0 h-[2px] bg-brand-primary"
              style={animatedIndicatorStyle}
            />
          )}
        </View>
        {renderTabBarRight && (
          <View className="flex-shrink-0">
            {renderTabBarRight()}
          </View>
        )}
      </View>
    );
  };

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={({ route }) => renderScene({ route })}
      onIndexChange={handleIndexChange}
      initialLayout={{ width: layout.width }}
      renderTabBar={renderTabBar}
      swipeEnabled={swipeEnabled}
      lazy={lazy}
      style={{ flex: 1 }}
    />
  );
}

// Simple Tabs (just tab bar, no page content)
interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  variant?: TabVariant;
  size?: TabSize;
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
  centerActiveTab?: boolean;
}

function TabsList({ variant = 'underline', size = 'sm', children, className, scrollable = false, centerActiveTab = true }: TabsListProps) {
  const [layouts, setLayouts] = React.useState<Record<string, { x: number; width: number }>>({});
  const indicatorPosition = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const { width: screenWidth } = useWindowDimensions();

  // Get parent Tabs context
  const parentContext = React.useContext(SimpleTabsContext);
  const value = parentContext?.value || '';

  const onTriggerLayout = React.useCallback(
    (triggerValue: string, layout: { x: number; width: number }) => {
      setLayouts((prev) => {
        if (prev[triggerValue]?.x === layout.x && prev[triggerValue]?.width === layout.width) {
          return prev;
        }
        return { ...prev, [triggerValue]: layout };
      });
    },
    []
  );

  React.useEffect(() => {
    if (value && layouts[value]) {
      const layout = layouts[value];
      indicatorPosition.value = withTiming(layout.x, { duration: 250, easing: Easing.out(Easing.cubic) });
      indicatorWidth.value = withTiming(layout.width, { duration: 250, easing: Easing.out(Easing.cubic) });

      // Auto-center active tab when scrollable
      if (scrollable && centerActiveTab && scrollViewRef.current) {
        const scrollX = layout.x - (screenWidth / 2) + (layout.width / 2);
        scrollViewRef.current.scrollTo({ x: Math.max(0, scrollX), animated: true });
      }
    }
  }, [value, layouts, indicatorPosition, indicatorWidth, scrollable, centerActiveTab, screenWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: indicatorWidth.value,
    transform: [{ translateX: indicatorPosition.value }],
  }));

  const content = (
    <View className={cn(tabsListVariants({ variant, size }), scrollable && 'w-auto', className)}>
      {children}
      {variant === 'underline' && (
        <Animated.View
          className="absolute bottom-0 left-0 h-[2px] bg-brand-primary"
          style={indicatorStyle}
        />
      )}
    </View>
  );

  if (scrollable) {
    return (
      <TabsListContext.Provider value={{ variant, size, onTriggerLayout }}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {content}
        </ScrollView>
      </TabsListContext.Provider>
    );
  }

  return (
    <TabsListContext.Provider value={{ variant, size, onTriggerLayout }}>
      {content}
    </TabsListContext.Provider>
  );
}

interface TabsListContextValue {
  variant: TabVariant;
  size: TabSize;
  onTriggerLayout: (value: string, layout: { x: number; width: number }) => void;
}

const TabsListContext = React.createContext<TabsListContextValue>({
  variant: 'underline',
  size: 'sm',
  onTriggerLayout: () => { },
});

interface SimpleTabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const SimpleTabsContext = React.createContext<SimpleTabsContextValue | null>(null);

// Simple Tabs Root
function SimpleTabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <SimpleTabsContext.Provider value={{ value, onValueChange }}>
      <View className={className}>
        {children}
      </View>
    </SimpleTabsContext.Provider>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
}

function TabsTrigger({ value, children, className, onPress }: TabsTriggerProps) {
  const parentContext = React.useContext(SimpleTabsContext);
  const { variant, size, onTriggerLayout } = React.useContext(TabsListContext);
  const isActive = parentContext?.value === value;

  const textClassName = tabsTriggerTextVariants({ variant, size, state: isActive ? 'active' : 'inactive' });

  return (
    <Pressable
      onLayout={(e) => onTriggerLayout(value, e.nativeEvent.layout)}
      onPress={() => {
        parentContext?.onValueChange(value)
        onPress?.()
      }}
      className={cn(tabsTriggerVariants({ variant, size, state: isActive ? 'active' : 'inactive' }), className)}
    >
      <TextClassContext.Provider value={textClassName}>
        {children}
      </TextClassContext.Provider>
    </Pressable>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

function TabsContent({ value, children, className }: TabsContentProps) {
  const parentContext = React.useContext(SimpleTabsContext);
  if (parentContext?.value !== value) return null;
  return <View className={className}>{children}</View>;
}

export {
  // SwipeableTabs (with page content and swipe)
  SwipeableTabs,
  // Simple Tabs (just tab bar, no page content)
  SimpleTabs as Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  // Variants
  tabsListVariants,
  tabsTriggerVariants,
  tabsTriggerTextVariants,
};

export type { TabVariant, TabSize, SwipeableTabsProps };
