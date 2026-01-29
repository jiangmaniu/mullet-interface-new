import React, { useState, createContext, useContext } from 'react';
import { LayoutChangeEvent, View, ViewStyle } from 'react-native';
import {
  Tabs,
  MaterialTabBar,
  MaterialTabBarProps,
  useCurrentTabScrollY,
} from 'react-native-collapsible-tab-view';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { useResolveClassNames } from 'uniwind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';


const tabBarVariants = cva(
  'w-full flex-row items-center',
  {
    variants: {
      variant: {
        default: '',
        underline: 'border-b border-brand-default', // We handle indicator separately in MaterialTabBar
      },
      size: {
        default: '',
        sm: '',
        md: 'h-10',
        lg: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const labelVariants = cva(
  'text-content-1 m-0 h-auto',
  {
    variants: {
      variant: {
        default: '',
        underline: '', // We handle indicator separately in MaterialTabBar
      },
      size: {
        default: '',
        sm: '',
        md: 'text-button-2',
        lg: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const tabVariants = cva(
  '',
  {
    variants: {
      variant: {
        default: '',
        underline: '', // We handle indicator separately in MaterialTabBar
      },
      size: {
        default: '',
        sm: '',
        md: 'p-xl',
        lg: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type CollapsibleTabProps = Omit<React.ComponentProps<typeof Tabs.Container>, 'renderTabBar'> &
  VariantProps<typeof tabBarVariants> & {
    tabBarClassName?: string;
    renderTabBarRight?: () => React.ReactNode;
  };

export function CollapsibleTab({
  variant = 'underline',
  size = 'default',
  tabBarClassName,
  renderTabBarRight,
  containerStyle,
  ...props
}: CollapsibleTabProps) {
  const {
    colorBrandPrimary,
    textColorContent1,
    textColorContent4,
  } = useThemeColors();

  const labelStyle = useResolveClassNames(labelVariants({ variant, size }))
  const tabStyle = useResolveClassNames(tabVariants({ variant, size }))
  const insets = useSafeAreaInsets();

  // Custom TabBar to match our design system
  const renderTabBar = (tabBarProps: MaterialTabBarProps<any>) => {
    return (
      <View className={cn(tabBarVariants({ variant, size }), "px-xl", tabBarClassName)}>
        {/* <View className="w-full h-full flex-row bg-secondary"> */}
        <MaterialTabBar
          {...tabBarProps}
          scrollEnabled
          style={{ height: '100%' }}
          contentContainerStyle={{ alignItems: 'center' }}
          indicatorStyle={{ backgroundColor: colorBrandPrimary, height: 2, bottom: 0 }}
          labelStyle={labelStyle}
          activeColor={textColorContent1}
          inactiveColor={textColorContent4}
          tabStyle={tabStyle}
        />
        {renderTabBarRight && (
          <View className='flex-shrink-0'>
            {renderTabBarRight()}
          </View>
        )}
        {/* </View> */}
      </View >
    );
  };

  const headerContainerStyle = useResolveClassNames('shadow-none elevation-0 bg-secondary')
  return (
    <Tabs.Container
      renderTabBar={renderTabBar}
      containerStyle={containerStyle}
      headerContainerStyle={headerContainerStyle}
      minHeaderHeight={insets.top}
      {...props}
    >
      {props.children}
    </Tabs.Container>
  );
}

// Export sub-components for direct usage
export const CollapsibleTabScene = Tabs.Tab;
export const CollapsibleFlatList = Tabs.FlatList;
export const CollapsibleScrollView = Tabs.ScrollView;
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
  style
}: {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}) {
  const [bannerHeight, setBannerHeight] = useState(0);

  return (
    <CollapsibleStickyContext.Provider value={{ bannerHeight, setBannerHeight }}>
      <View className={cn("relative", className)} style={style}>
        {children}
      </View>
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
}

export function CollapsibleStickyNavBar({
  style,
  children,
  className,
  zIndex = 100,
}: CollapsibleStickyNavBarProps) {
  const { bannerHeight } = useCollapsibleStickyContext();
  const insets = useSafeAreaInsets();
  const headerHeight = 44 + insets.top;

  // 获取滚动上下文 (必须在 CollapsibleTab 内部渲染才有效)
  const scrollY = useCurrentTabScrollY();

  const animatedStyle = useAnimatedStyle(() => {
    // 如果 Banner 高度还没算出来，先不动
    if (bannerHeight === 0) return {};

    // 当滚动值在 [0, bannerHeight] 之间时，让导航栏向下偏移 [0, bannerHeight]。
    const translateY = interpolate(
      scrollY.value,
      [0, bannerHeight],
      [0, bannerHeight],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      [bannerHeight, bannerHeight + 25, bannerHeight + 50],
      [1, 0.3, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  return (
    <>
      {/* 1. 占位块：把内容顶下去，防止被绝对定位的导航栏遮挡 */}
      <View style={{ height: headerHeight }} />

      {/* 2. 动画导航栏 */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: headerHeight,
            paddingTop: insets.top,
            zIndex,
          },
          style,
          animatedStyle
        ]}
        className={className || "bg-secondary"}
      >
        {children}
      </Animated.View>
    </>
  );
}
