import React, { useState } from 'react'
import { View } from 'react-native'
import { CollapsibleTabView, TabFlatList } from '@mstfmedeni/collapsible-tab-view'
import type { Route } from '@mstfmedeni/collapsible-tab-view'
import { TabBar } from 'react-native-tab-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { VariantProps } from 'class-variance-authority'

import { useThemeColors } from '@/hooks/use-theme-colors'
import { cn } from '@/lib/utils'
import {
  tabBarVariants,
  tabItemVariants,
  tabTextVariants,
} from '@/components/ui/collapsible-tab'

// 定义 Props
interface TradeCollapsibleTabProps extends VariantProps<typeof tabBarVariants> {
  children: React.ReactElement[]
  tabBarClassName?: string
  renderTabBarRight?: () => React.ReactNode
  renderScrollHeader?: () => React.ReactElement | null
  initHeaderHeight?: number
}

// 主组件
export function TradeCollapsibleTab({
  variant = 'underline',
  size = 'md',
  tabBarClassName,
  renderTabBarRight,
  renderScrollHeader,
  initHeaderHeight,
  children,
}: TradeCollapsibleTabProps) {
  const { colorBrandPrimary, textColorContent1, textColorContent4 } = useThemeColors()
  const insets = useSafeAreaInsets()

  // 从 children 提取 routes
  const routes: Route[] = React.Children.map(children, (child, index) => ({
    key: child.props.name,
    title: child.props.label,
    index,
  }))

  const [index, setIndex] = useState(0)

  // 渲染场景
  const renderScene = ({ route }: { route: Route }) => {
    const child = children.find((c) => c.props.name === route.key)
    return child ? child.props.children : null
  }

  // 渲染 TabBar
  const renderTabBar = (props: any) => (
    <View className={cn(tabBarVariants({ variant, size }), 'px-xl', tabBarClassName)}>
      <TabBar
        {...props}
        indicatorStyle={{
          backgroundColor: colorBrandPrimary,
          height: 2,
        }}
        style={{ backgroundColor: 'transparent' }}
        activeColor={textColorContent1}
        inactiveColor={textColorContent4}
      />
      {renderTabBarRight && (
        <View className="flex-shrink-0 flex-row items-center">
          {renderTabBarRight()}
        </View>
      )}
    </View>
  )

  return (
    <CollapsibleTabView
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      renderTabBar={renderTabBar}
      renderScrollHeader={renderScrollHeader}
      initHeaderHeight={initHeaderHeight}
    />
  )
}

// Scene 组件
export function TradeCollapsibleTabScene({
  name,
  label,
  children,
}: {
  name: string
  label: string
  children: React.ReactNode
}) {
  return <>{children}</>
}

// 导出 TabFlatList
export { TabFlatList as TradeCollapsibleFlatList }
