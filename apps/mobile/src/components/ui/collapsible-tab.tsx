import React, { useState, createContext, useContext, ComponentProps } from 'react';
import { LayoutChangeEvent, Pressable, View, ViewStyle } from 'react-native';
import {
  Tabs,
  MaterialTabBar,
  MaterialTabBarProps,
  useCurrentTabScrollY,
} from 'react-native-collapsible-tab-view';
import { useScroller, useTabsContext } from 'react-native-collapsible-tab-view/src/hooks';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { useResolveClassNames } from 'uniwind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
  useAnimatedReaction,
  useSharedValue,
  cancelAnimation,
  withDecay,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

type TabVariant = 'solid' | 'outline' | 'underline' | 'text';
type TabSize = 'sm' | 'md' | 'lg';

const tabBarVariants = cva(
  'w-full flex-row items-center',
  {
    variants: {
      variant: {
        solid: 'gap-medium',
        outline: 'gap-medium',
        underline: 'border-b border-brand-default',
        text: '',
      },
      size: {
        sm: '',
        md: 'h-10',
        lg: '',
      },
    },
    defaultVariants: {
      variant: 'underline',
      size: 'sm',
    },
  }
);

const tabItemVariants = cva(
  'items-center justify-center',
  {
    variants: {
      variant: {
        solid: 'rounded-small',
        outline: 'rounded-small',
        underline: '',
        text: '',
      },
      size: {
        sm: 'px-2xl py-small',
        md: 'px-3xl py-medium',
        lg: 'px-3xl py-xl',
      },
      selected: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      { variant: 'solid', selected: false, className: 'bg-button' },
      { variant: 'outline', selected: false, className: '' },
      { variant: 'outline', selected: true, className: 'border border-brand-secondary-2' },
      { variant: 'underline', selected: false, className: '' },
      { variant: 'underline', selected: true, className: 'border-b-2 border-brand-primary' }, // Fallback style
      { variant: 'text', selected: false, className: '' },
    ],
    defaultVariants: {
      variant: 'underline',
      size: 'sm',
      selected: false,
    },
  }
);

const tabTextVariants = cva(
  'font-medium',
  {
    variants: {
      variant: {
        solid: '',
        outline: '',
        underline: '',
        text: '',
      },
      size: {
        sm: 'text-button-1',
        md: 'text-button-2',
        lg: 'text-button-2',
      },
      selected: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'underline',
      size: 'sm',
      selected: false,
    },
  }
);


interface CustomTabItemProps {
  index: number;
  indexDecimal: SharedValue<number>;
  label: string;
  onPress: () => void;
  // 添加 onLayout 定义，以便 MaterialTabBar 计算指示器位置
  onLayout?: (event: LayoutChangeEvent) => void;
  variant: TabVariant;
  size: TabSize;
  activeColor: string;
  inactiveColor: string;
  scrollEnabled: boolean;
}

function CustomTabItem({
  index,
  indexDecimal,
  label,
  onPress,
  onLayout,
  variant,
  size,
  activeColor,
  inactiveColor,
  scrollEnabled,
}: CustomTabItemProps) {

  // 文字颜色插值动画
  const animatedTextStyle = useAnimatedStyle(() => {
    const distance = Math.abs(index - indexDecimal.value);
    const progress = Math.min(distance, 1);

    const color = interpolateColor(
      progress,
      [0, 1],
      [activeColor, inactiveColor]
    );

    return {
      color,
    };
  });

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  }

  return (
    <Pressable
      onPress={handlePress}
      // 绑定 onLayout
      onLayout={onLayout}
      className={cn(tabItemVariants({ variant, size, selected: false }), { 'flex-1': !scrollEnabled })}
    >
      <Animated.Text
        className={cn(tabTextVariants({ variant, size, selected: false }))}
        style={animatedTextStyle}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
}

// ----------------------------------------------------------------------
// 3. 主组件 CollapsibleTab
// ----------------------------------------------------------------------

// Context: CollapsibleStickyNavBar fixed 时向 CollapsibleTab 注册额外高度
type FixedNavBarContextType = {
  fixedNavBarHeight: number;
  setFixedNavBarHeight: (h: number) => void;
};
const FixedNavBarContext = createContext<FixedNavBarContextType | undefined>(undefined);

type CollapsibleTabProps = Omit<React.ComponentProps<typeof Tabs.Container>, 'renderTabBar'> &
  VariantProps<typeof tabBarVariants> & {
    tabBarClassName?: string;
    tabClassName?: string;
    renderTabBarRight?: () => React.ReactNode;
    scrollEnabled?: boolean;
  };

export function CollapsibleTab({
  variant = 'underline',
  size = 'sm',
  tabBarClassName,
  tabClassName,
  renderTabBarRight,
  containerStyle,
  scrollEnabled = true,
  ...props
}: CollapsibleTabProps) {
  const {
    colorBrandPrimary,
    textColorContent1,
    textColorContent4,
    backgroundColorSecondary,
  } = useThemeColors();

  const insets = useSafeAreaInsets();
  const [fixedNavBarHeight, setFixedNavBarHeight] = useState(0);
  const currentVariant = variant || 'underline';
  const currentSize = size || 'sm';

  const renderTabBar = (tabBarProps: MaterialTabBarProps<any>) => {
    return (
      <View className={cn(tabBarVariants({ variant: currentVariant, size: currentSize }), "px-xl", tabBarClassName)}>
        <MaterialTabBar
          {...tabBarProps}
          scrollEnabled={scrollEnabled}
          style={{ height: '100%', backgroundColor: 'transparent' }}
          contentContainerStyle={{ alignItems: 'center' }}

          // 指示器样式配置
          indicatorStyle={
            currentVariant === 'underline'
              ? {
                backgroundColor: colorBrandPrimary,
                height: 2,
                bottom: 0,
                borderRadius: 1, // 圆角更现代
              }
              : { backgroundColor: 'transparent', height: 0 }
          }

          activeColor={textColorContent1}
          inactiveColor={textColorContent4}

          TabItemComponent={(itemProps) => (
            <CustomTabItem
              index={itemProps.index}
              indexDecimal={itemProps.indexDecimal}
              scrollEnabled={scrollEnabled}
              label={typeof itemProps.label === 'string' ? itemProps.label : ''}
              onPress={() => itemProps.onPress(itemProps.name)}

              // 透传 onLayout 给 CustomTabItem
              onLayout={itemProps.onLayout}

              variant={currentVariant}
              size={currentSize}
              activeColor={textColorContent1}
              inactiveColor={textColorContent4}
            />
          )}
        />
        {renderTabBarRight && (
          <View className='flex-shrink-0'>
            {renderTabBarRight()}
          </View>
        )}
      </View>
    );
  };

  const headerContainerStyle = useResolveClassNames('shadow-none elevation-0 bg-secondary')

  return (
    <FixedNavBarContext.Provider value={{ fixedNavBarHeight, setFixedNavBarHeight }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          zIndex: 1000,
          backgroundColor: backgroundColorSecondary,
        }}
      />

      <Tabs.Container
        renderTabBar={renderTabBar}
        containerStyle={containerStyle}
        headerContainerStyle={headerContainerStyle}
        minHeaderHeight={insets.top + fixedNavBarHeight}
        {...props}
      >
        {props.children}
      </Tabs.Container>
    </FixedNavBarContext.Provider>
  );
}

export const CollapsibleTabScene = Tabs.Tab;
export const CollapsibleFlatList = Tabs.FlatList;
export const CollapsibleScrollView = ({ showsVerticalScrollIndicator = false, ...props }: ComponentProps<typeof Tabs.ScrollView>) => <Tabs.ScrollView showsVerticalScrollIndicator={showsVerticalScrollIndicator} {...props} />;
export const CollapsibleSectionList = Tabs.SectionList;

type CollapsibleStickyContextType = {
  bannerHeight: number;
  setBannerHeight: (height: number) => void;
};

const CollapsibleStickyContext = createContext<CollapsibleStickyContextType | undefined>(undefined);

function useCollapsibleStickyContext() {
  const context = useContext(CollapsibleStickyContext);
  if (!context) {
    throw new Error('CollapsibleStickyHeader compound components must be used within a CollapsibleStickyHeader provider');
  }
  return context;
}

export function CollapsibleStickyHeader({
  children,
  className,
  style,
  minDistance = 5,
  minVelocity = 50,
  deceleration = 0.998,
}: {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  minDistance?: number;
  minVelocity?: number;
  deceleration?: number;
}) {
  const [bannerHeight, setBannerHeight] = useState(0);

  const { refMap, focusedTab } = useTabsContext();
  const scrollTo = useScroller();
  const scrollY = useCurrentTabScrollY();
  const initialScrollY = useSharedValue(0);
  const isGestureActive = useSharedValue(false);
  const targetScrollY = useSharedValue(0);

  useAnimatedReaction(
    () => targetScrollY.value,
    (targetY) => {
      'worklet';
      if (!isGestureActive.value) {
        const currentTab = focusedTab.value;
        const ref = refMap[currentTab];
        if (ref) {
          scrollTo(ref, 0, Math.max(0, targetY), false, 'momentumScroll');
        }
      }
    },
    [refMap, focusedTab, scrollTo],
  );

  const headerPanGesture = Gesture.Pan()
    .minDistance(minDistance)
    .onStart(() => {
      'worklet';
      cancelAnimation(targetScrollY);
      initialScrollY.value = scrollY.value;
      targetScrollY.value = scrollY.value;
      isGestureActive.value = true;
    })
    .onUpdate((e) => {
      'worklet';
      if (Math.abs(e.translationY) > Math.abs(e.translationX) || Math.abs(e.translationY) > 10) {
        const currentTab = focusedTab.value;
        const ref = refMap[currentTab];
        if (ref) {
          const delta = -e.translationY;
          const newTargetScrollY = Math.max(0, initialScrollY.value + delta);
          targetScrollY.value = newTargetScrollY;
          scrollTo(ref, 0, newTargetScrollY, false, 'headerGesture');
        }
      }
    })
    .onEnd((e) => {
      'worklet';
      isGestureActive.value = false;
      if (Math.abs(e.velocityY) > minVelocity) {
        const velocity = -e.velocityY;
        targetScrollY.value = withDecay(
          {
            velocity,
            deceleration,
            clamp: [0, Infinity],
          },
          (finished) => {
            'worklet';
            if (finished) {
              targetScrollY.value = Math.max(0, targetScrollY.value);
            }
          },
        );
      } else {
        targetScrollY.value = Math.max(0, scrollY.value);
      }
    })
    .onFinalize(() => {
      'worklet';
      isGestureActive.value = false;
    });

  return (
    <CollapsibleStickyContext.Provider value={{ bannerHeight, setBannerHeight }}>
      <GestureDetector gesture={headerPanGesture}>
        <View className={cn("relative", className)} style={style}>
          {children}
        </View>
      </GestureDetector>
    </CollapsibleStickyContext.Provider>
  );
}

export function CollapsibleStickyContent({
  children,
  className,
  style
}: {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}) {
  const { setBannerHeight } = useCollapsibleStickyContext();

  return (
    <View
      className={className}
      style={style}
      onLayout={(event: LayoutChangeEvent) => {
        setBannerHeight(event.nativeEvent.layout.height);
      }}
    >
      {children}
    </View>
  );
}

export interface CollapsibleStickyNavBarProps {
  zIndex?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
  className?: string;
  fixed?: boolean;
}

export function CollapsibleStickyNavBar({
  style,
  children,
  className,
  zIndex = 100,
  fixed = false,
}: CollapsibleStickyNavBarProps) {
  const { bannerHeight } = useCollapsibleStickyContext();
  const setFixedNavBarHeight = useContext(FixedNavBarContext)?.setFixedNavBarHeight;
  const insets = useSafeAreaInsets();
  const headerHeight = 44 + insets.top;

  // fixed 时注册纯导航栏高度（不含 insets）给 CollapsibleTab
  React.useEffect(() => {
    if (fixed && setFixedNavBarHeight) {
      setFixedNavBarHeight(44);
      return () => setFixedNavBarHeight(0);
    }
  }, [fixed, setFixedNavBarHeight]);

  const scrollY = useCurrentTabScrollY();

  const animatedStyle = useAnimatedStyle(() => {
    if (bannerHeight === 0) return {};

    const translateY = interpolate(
      scrollY.value,
      [0, bannerHeight],
      [0, bannerHeight],
      Extrapolation.CLAMP
    );

    if (fixed) {
      return { transform: [{ translateY }] };
    }

    const opacity = interpolate(
      scrollY.value + insets.top,
      [bannerHeight, bannerHeight + headerHeight],
      [1, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  const statusBarAnimatedStyle = useAnimatedStyle(() => {
    if (bannerHeight === 0) return {};
    const translateY = interpolate(
      scrollY.value,
      [0, bannerHeight],
      [0, bannerHeight],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateY }],
    };
  });

  return (
    <>
      <View style={{ height: headerHeight }} />
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: headerHeight,
            zIndex: zIndex - 1,
          },
          style,
          statusBarAnimatedStyle
        ]}
        className={className || "bg-secondary"}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: headerHeight,
            zIndex,
          },
          animatedStyle
        ]}
      >
        {children}
      </Animated.View>
    </>
  );
}

export { tabBarVariants, tabItemVariants, tabTextVariants };
export type { TabVariant, TabSize };