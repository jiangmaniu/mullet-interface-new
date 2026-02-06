import React, { useState, createContext, useContext, ComponentProps } from 'react';
import { LayoutChangeEvent, Pressable, View, ViewStyle } from 'react-native';
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
import Animated, { useAnimatedStyle, interpolate, Extrapolation, SharedValue, useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { Text } from '@/components/ui/text';

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
      // solid
      { variant: 'solid', selected: false, className: 'bg-button' },
      { variant: 'solid', selected: true, className: 'bg-brand-primary' },
      // outline
      { variant: 'outline', selected: false, className: '' },
      { variant: 'outline', selected: true, className: 'border border-brand-secondary-2' },
      // underline
      { variant: 'underline', selected: false, className: '' },
      { variant: 'underline', selected: true, className: 'border-b-2 border-brand-primary' },
      // text
      { variant: 'text', selected: false, className: '' },
      { variant: 'text', selected: true, className: '' },
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
    compoundVariants: [
      // solid selected uses dark text
      { variant: 'solid', selected: true, className: 'text-content-foreground' },
      { variant: 'solid', selected: false, className: 'text-content-4' },
      // others use white when selected, gray when not
      { variant: 'outline', selected: true, className: 'text-content-1' },
      { variant: 'outline', selected: false, className: 'text-content-4' },
      { variant: 'underline', selected: true, className: 'text-content-1' },
      { variant: 'underline', selected: false, className: 'text-content-4' },
      { variant: 'text', selected: true, className: 'text-content-1' },
      { variant: 'text', selected: false, className: 'text-content-4' },
    ],
    defaultVariants: {
      variant: 'underline',
      size: 'sm',
      selected: false,
    },
  }
);

// Custom TabItem component props
interface CustomTabItemProps {
  index: number;
  indexDecimal: SharedValue<number>;
  label: string;
  onPress: () => void;
  variant: TabVariant;
  size: TabSize;
}

// Custom TabItem component
function CustomTabItem({
  index,
  indexDecimal,
  label,
  onPress,
  variant,
  size,
}: CustomTabItemProps) {
  const [isSelected, setIsSelected] = useState(false);

  // Use useAnimatedReaction to properly read SharedValue without triggering render warnings
  useAnimatedReaction(
    () => Math.abs(index - indexDecimal.value) < 0.5,
    (selected) => {
      runOnJS(setIsSelected)(selected);
    },
    [index]
  );

  return (
    <Pressable
      onPress={onPress}
      className={cn(tabItemVariants({ variant, size, selected: isSelected }))}
    >
      <Text className={cn(tabTextVariants({ variant, size, selected: isSelected }))}>
        {label}
      </Text>
    </Pressable>
  );
}

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

  const currentVariant = variant || 'underline';
  const currentSize = size || 'sm';

  const renderTabBar = (tabBarProps: MaterialTabBarProps<any>) => {
    // For underline variant, use default MaterialTabBar with indicator
    // For other variants, use custom TabItemComponent
    const useCustomTabItem = currentVariant !== 'underline';

    return (
      <View className={cn(tabBarVariants({ variant: currentVariant, size: currentSize }), "px-xl", tabBarClassName)}>
        <MaterialTabBar
          {...tabBarProps}
          scrollEnabled={scrollEnabled}
          style={{ height: '100%' }}
          contentContainerStyle={{ alignItems: 'center' }}
          indicatorStyle={
            currentVariant === 'underline'
              ? { backgroundColor: colorBrandPrimary, height: 2, bottom: 0 }
              : { backgroundColor: 'transparent', height: 0 }
          }
          activeColor={textColorContent1}
          inactiveColor={textColorContent4}
          TabItemComponent={
            useCustomTabItem
              ? (itemProps) => (
                <CustomTabItem
                  index={itemProps.index}
                  indexDecimal={itemProps.indexDecimal}
                  label={typeof itemProps.label === 'string' ? itemProps.label : ''}
                  onPress={() => itemProps.onPress(itemProps.name)}
                  variant={currentVariant}
                  size={currentSize}
                />
              )
              : undefined
          }
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
    <>
      {/* 状态栏遮挡层 - 固定在顶部，防止 header 内容透出 */}
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
        minHeaderHeight={insets.top}
        {...props}
      >
        {props.children}
      </Tabs.Container>
    </>
  );
}

// Export sub-components for direct usage
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

  // 确保 Status Bar 区域始终有背景遮挡，防止内容透过
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
      {/* 1. 占位块：把内容顶下去，防止被绝对定位的导航栏遮挡 */}
      <View style={{ height: headerHeight }} />

      {/* 2. 背景层：始终不透明，遮挡 Status Bar 区域 */}
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
          style, // 继承传入的背景色
          statusBarAnimatedStyle
        ]}
        className={className || "bg-secondary"}
      />

      {/* 3. 内容层：包含文字标题等，会渐隐 */}
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

// Export variants for external use
export { tabBarVariants, tabItemVariants, tabTextVariants };
export type { TabVariant, TabSize };
