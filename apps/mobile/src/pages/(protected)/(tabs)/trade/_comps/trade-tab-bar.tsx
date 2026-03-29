import React, { useCallback, useEffect } from 'react'
import { Pressable, View } from 'react-native'
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import { IconButton } from '@/components/ui/button'
import { tabBarVariants, tabItemVariants, tabTextVariants } from '@/components/ui/collapsible-tab'
import { IconifyPage } from '@/components/ui/icons'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { cn } from '@/lib/utils'

export type TradeTab = 'positions' | 'orders'

interface TradeTabBarProps {
  activeTab: TradeTab
  onTabChange: (tab: TradeTab) => void
  positionCount: number
  orderCount: number
  onRecordsPress: () => void
  onLayout?: (height: number) => void
}

interface TabItemProps {
  label: string
  isActive: boolean
  onPress: () => void
}

const TabItem = React.memo(({ label, isActive, onPress }: TabItemProps) => {
  const { textColorContent1 } = useThemeColors()
  // 用 sharedValue 驱动文字颜色透明度，与 collapsible-tab.tsx 保持一致
  const activeValue = useSharedValue(isActive ? 0 : 1)

  // 修复：渲染阶段不直接赋值 sharedValue，改用 useEffect + withTiming 驱动动画
  useEffect(() => {
    activeValue.value = withTiming(isActive ? 0 : 1, { duration: 200 })
  }, [isActive, activeValue])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(activeValue.value, [0, 1], [1, 0.45]),
  }))

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        tabItemVariants({ variant: 'underline', size: 'md', selected: false }),
        'flex-1',
        isActive && 'border-b-2 border-brand-primary',
      )}
    >
      <Animated.Text
        className={cn(tabTextVariants({ variant: 'underline', size: 'md', selected: false }))}
        style={[{ color: textColorContent1 }, animatedStyle]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  )
})

export function TradeTabBar({
  activeTab,
  onTabChange,
  positionCount,
  orderCount,
  onRecordsPress,
  onLayout,
}: TradeTabBarProps) {
  // 用 useCallback 避免每次渲染创建新的内联函数
  const handleLayout = useCallback(
    (e: { nativeEvent: { layout: { height: number } } }) => {
      onLayout?.(e.nativeEvent.layout.height)
    },
    [onLayout],
  )

  const handlePressPositions = useCallback(() => onTabChange('positions'), [onTabChange])
  const handlePressOrders = useCallback(() => onTabChange('orders'), [onTabChange])

  return (
    <View
      className={cn(tabBarVariants({ variant: 'underline', size: 'md' }), 'px-xl bg-secondary')}
      onLayout={handleLayout}
    >
      <TabItem
        label={`持仓(${positionCount})`}
        isActive={activeTab === 'positions'}
        onPress={handlePressPositions}
      />
      <TabItem
        label={`挂单(${orderCount})`}
        isActive={activeTab === 'orders'}
        onPress={handlePressOrders}
      />
      <IconButton onPress={onRecordsPress}>
        <IconifyPage width={22} height={22} />
      </IconButton>
    </View>
  )
}
