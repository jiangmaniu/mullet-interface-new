import React, { ComponentProps, createContext, useContext, useState } from 'react'
import { Keyboard, LayoutChangeEvent, Pressable, View, ViewStyle } from 'react-native'
import { MaterialTabBar, MaterialTabBarProps, Tabs, useCurrentTabScrollY } from 'react-native-collapsible-tab-view'
import { useScroller, useTabsContext } from 'react-native-collapsible-tab-view/src/hooks'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  cancelAnimation,
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDecay,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cva } from 'class-variance-authority'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { useResolveClassNames } from 'uniwind'
import type { VariantProps } from 'class-variance-authority'

import { useThemeColors } from '@/hooks/use-theme-colors'
import { cn } from '@/lib/utils'

type TabVariant = 'solid' | 'outline' | 'underline' | 'text'
type TabSize = 'sm' | 'md' | 'lg'

const tabBarVariants = cva('w-full flex-row items-center', {
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
})

const tabItemVariants = cva('items-center justify-center', {
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
})

const tabTextVariants = cva('font-medium', {
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
})

interface CustomTabItemProps {
  index: number
  indexDecimal: SharedValue<number>
  label: string
  onPress: () => void
  // 添加 onLayout 定义，以便 MaterialTabBar 计算指示器位置
  onLayout?: (event: LayoutChangeEvent) => void
  variant: TabVariant
  size: TabSize
  activeColor: string
  inactiveColor: string
  scrollEnabled: boolean
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
  // 缓存距离计算，避免每帧重复 Math.abs
  const progress = useDerivedValue(() => {
    'worklet'
    return Math.min(Math.abs(index - indexDecimal.value), 1)
  })

  // 用 opacity 替代 interpolateColor，性能提升显著
  const animatedTextStyle = useAnimatedStyle(() => {
    'worklet'
    return {
      opacity: interpolate(progress.value, [0, 1], [1, 0.45]),
    }
  })

  const handlePress = () => {
    // 如果当前 tab 已选中，不触发 onPress 以避免双击滚动到顶部
    if (Math.abs(index - indexDecimal.value) < 0.5) return
    Haptics.selectionAsync()
    onPress()
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
        style={[{ color: activeColor }, animatedTextStyle]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  )
}

// 使用 React.memo 避免不必要的重渲染
const MemoizedCustomTabItem = React.memo(CustomTabItem)

// ----------------------------------------------------------------------
// 3. 主组件 CollapsibleTab
// ----------------------------------------------------------------------

// Context: CollapsibleStickyNavBar fixed 时向 CollapsibleTab 注册额外高度
type FixedNavBarContextType = {
  fixedNavBarHeight: number
  setFixedNavBarHeight: (h: number) => void
}
const FixedNavBarContext = createContext<FixedNavBarContextType | undefined>(undefined)

type CollapsibleTabProps = Omit<React.ComponentProps<typeof Tabs.Container>, 'renderTabBar'> &
  VariantProps<typeof tabBarVariants> & {
    tabBarClassName?: string
    tabClassName?: string
    renderTabBarRight?: () => React.ReactNode
    renderTabBarBottom?: () => React.ReactNode
    scrollEnabled?: boolean
  }

export function CollapsibleTab({
  variant = 'underline',
  size = 'sm',
  tabBarClassName,
  tabClassName,
  renderTabBarRight,
  renderTabBarBottom,
  containerStyle,
  scrollEnabled = true,
  ...props
}: CollapsibleTabProps) {
  const { colorBrandPrimary, textColorContent1, textColorContent4, backgroundColorSecondary } = useThemeColors()

  const insets = useSafeAreaInsets()
  const [fixedNavBarHeight, setFixedNavBarHeight] = useState(0)
  const currentVariant = variant || 'underline'
  const currentSize = size || 'sm'

  const renderTabBar = (tabBarProps: MaterialTabBarProps<any>) => {
    return (
      <View>
        <View className={cn(tabBarVariants({ variant: currentVariant, size: currentSize }), 'px-xl', tabBarClassName)}>
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
              <MemoizedCustomTabItem
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
            <View className="flex-shrink-0 flex-row items-center">
              <LinearGradient
                colors={['transparent', backgroundColorSecondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ width: 24, position: 'absolute', left: -24, top: 0, bottom: 2 }}
                pointerEvents="none"
              />
              {renderTabBarRight()}
            </View>
          )}
        </View>
        {renderTabBarBottom?.()}
      </View>
    )
  }

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
  )
}

export const CollapsibleTabScene = Tabs.Tab
export const CollapsibleFlatList = <T,>({
  showsVerticalScrollIndicator = false,
  ...props
}: ComponentProps<typeof Tabs.FlatList<T>>) => (
  <Tabs.FlatList<T> showsVerticalScrollIndicator={showsVerticalScrollIndicator} {...props} />
)
export const CollapsibleScrollView = ({
  showsVerticalScrollIndicator = false,
  ...props
}: ComponentProps<typeof Tabs.ScrollView>) => (
  <Tabs.ScrollView showsVerticalScrollIndicator={showsVerticalScrollIndicator} {...props} />
)
export const CollapsibleSectionList = Tabs.SectionList

type CollapsibleStickyContextType = {
  bannerHeight: number
  setBannerHeight: (height: number) => void
}

const CollapsibleStickyContext = createContext<CollapsibleStickyContextType | undefined>(undefined)

function useCollapsibleStickyContext() {
  const context = useContext(CollapsibleStickyContext)
  if (!context) {
    throw new Error(
      'CollapsibleStickyHeader compound components must be used within a CollapsibleStickyHeader provider',
    )
  }
  return context
}

export function CollapsibleStickyHeader({
  children,
  className,
  style,
  minDistance = 5,
  minVelocity = 50,
  deceleration = 0.998,
}: {
  children: React.ReactNode
  className?: string
  style?: ViewStyle
  minDistance?: number
  minVelocity?: number
  deceleration?: number
}) {
  const [bannerHeight, setBannerHeight] = useState(0)

  const { refMap, focusedTab } = useTabsContext()
  const scrollTo = useScroller()
  const scrollY = useCurrentTabScrollY()
  const initialScrollY = useSharedValue(0)
  const isGestureActive = useSharedValue(false)
  const targetScrollY = useSharedValue(0)
  const lastScrolledY = useSharedValue(0)

  useAnimatedReaction(
    () => targetScrollY.value,
    (targetY, previousTargetY) => {
      'worklet'
      // 只在值真正变化且手势未激活时才执行
      if (!isGestureActive.value && targetY !== previousTargetY) {
        const currentTab = focusedTab.value
        const ref = refMap[currentTab]
        if (ref) {
          scrollTo(ref, 0, Math.max(0, targetY), false, 'momentumScroll')
        }
      }
    },
    [refMap, focusedTab, scrollTo],
  )

  const headerPanGesture = Gesture.Pan()
    .minDistance(minDistance)
    .activeOffsetY([-5, 5]) // 垂直方向移动超过 5px 才激活
    .failOffsetX([-5, 5]) // 横向移动超过 5px 则失败，让内部 ScrollView 处理
    .onStart(() => {
      'worklet'
      cancelAnimation(targetScrollY)
      initialScrollY.value = scrollY.value
      targetScrollY.value = scrollY.value
      lastScrolledY.value = scrollY.value
      isGestureActive.value = true
    })
    .onUpdate((e) => {
      'worklet'
      const currentTab = focusedTab.value
      const ref = refMap[currentTab]
      if (ref) {
        const delta = -e.translationY
        const newTargetScrollY = Math.max(0, initialScrollY.value + delta)
        // 只在变化超过 1px 时才调用 scrollTo，减少桥接开销
        if (Math.abs(newTargetScrollY - lastScrolledY.value) > 1) {
          targetScrollY.value = newTargetScrollY
          scrollTo(ref, 0, newTargetScrollY, false, 'headerGesture')
          lastScrolledY.value = newTargetScrollY
        }
      }
    })
    .onEnd((e) => {
      'worklet'
      isGestureActive.value = false
      if (Math.abs(e.velocityY) > minVelocity) {
        const velocity = -e.velocityY
        targetScrollY.value = withDecay(
          {
            velocity,
            deceleration,
            clamp: [0, Infinity],
          },
          (finished) => {
            'worklet'
            if (finished) {
              targetScrollY.value = Math.max(0, targetScrollY.value)
            }
          },
        )
      } else {
        targetScrollY.value = Math.max(0, scrollY.value)
      }
    })
    .onFinalize(() => {
      'worklet'
      isGestureActive.value = false
    })

  const headerTapGesture = Gesture.Tap()
    .runOnJS(true)
    .onEnd(() => {
      Keyboard.dismiss()
    })

  const composedGesture = Gesture.Simultaneous(headerTapGesture, headerPanGesture)

  return (
    <CollapsibleStickyContext.Provider value={{ bannerHeight, setBannerHeight }}>
      <GestureDetector gesture={composedGesture}>
        <View className={cn('relative', className)} style={style}>
          {children}
        </View>
      </GestureDetector>
    </CollapsibleStickyContext.Provider>
  )
}

export function CollapsibleStickyContent({
  children,
  className,
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: ViewStyle
}) {
  const { setBannerHeight } = useCollapsibleStickyContext()

  return (
    <View
      className={className}
      style={style}
      onLayout={(event: LayoutChangeEvent) => {
        setBannerHeight(event.nativeEvent.layout.height)
      }}
    >
      {children}
    </View>
  )
}

export interface CollapsibleStickyNavBarProps {
  zIndex?: number
  style?: ViewStyle
  children?: React.ReactNode
  className?: string
  fixed?: boolean
}

export function CollapsibleStickyNavBar({
  style,
  children,
  className,
  zIndex = 100,
  fixed = false,
}: CollapsibleStickyNavBarProps) {
  const { bannerHeight } = useCollapsibleStickyContext()
  const setFixedNavBarHeight = useContext(FixedNavBarContext)?.setFixedNavBarHeight
  const insets = useSafeAreaInsets()
  const headerHeight = 44 + insets.top

  // fixed 时注册纯导航栏高度（不含 insets）给 CollapsibleTab
  React.useEffect(() => {
    if (fixed && setFixedNavBarHeight) {
      setFixedNavBarHeight(44)
      return () => setFixedNavBarHeight(0)
    }
  }, [fixed, setFixedNavBarHeight])

  const scrollY = useCurrentTabScrollY()

  // 提取共享的 translateY 计算，避免两个 useAnimatedStyle 重复计算
  const translateY = useDerivedValue(() => {
    'worklet'
    if (bannerHeight === 0) return 0
    return interpolate(scrollY.value, [0, bannerHeight], [0, bannerHeight], Extrapolation.CLAMP)
  })

  // 仅 non-fixed 模式需要 opacity
  const navOpacity = useDerivedValue(() => {
    'worklet'
    if (fixed || bannerHeight === 0) return 1
    return interpolate(
      scrollY.value + insets.top,
      [bannerHeight, bannerHeight + headerHeight],
      [1, 0],
      Extrapolation.CLAMP,
    )
  })

  const animatedStyle = useAnimatedStyle(() => {
    'worklet'
    return {
      transform: [{ translateY: translateY.value }],
      opacity: navOpacity.value,
    }
  })

  const statusBarAnimatedStyle = useAnimatedStyle(() => {
    'worklet'
    return {
      transform: [{ translateY: translateY.value }],
    }
  })

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
          statusBarAnimatedStyle,
        ]}
        className={className || 'bg-secondary'}
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
          animatedStyle,
        ]}
      >
        {children}
      </Animated.View>
    </>
  )
}

export { tabBarVariants, tabItemVariants, tabTextVariants }
export type { TabVariant, TabSize }
