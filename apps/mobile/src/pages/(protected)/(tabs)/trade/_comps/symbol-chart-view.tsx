import { Trans } from '@lingui/react/macro'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'

import { TradingviewChart } from '@/components/tradingview'
import { IconNavArrowDown, IconNavArrowSuperior } from '@/components/ui/icons'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { useRootStore } from '@/stores'
import {
  PERIOD_TO_RESOLUTION,
  tradeSettingChartResolutionSelector,
} from '@/stores/trade-slice/settingSlice'

const TIME_PERIODS = ['1分', '5分', '15分', '30分', '1小时', '4小时', '1天', '1周', '1月']

interface SymbolChartViewProps {
  isVisible?: boolean
  onToggle?: (visible: boolean) => void
  onInteractionStart?: () => void
  onInteractionEnd?: () => void
  onInteractionCancel?: () => void
}

export function SymbolChartView({ isVisible: externalIsVisible, onToggle, onInteractionStart, onInteractionEnd, onInteractionCancel }: SymbolChartViewProps = {}) {
  const [internalIsVisible, setInternalIsVisible] = useState(true)
  const selectedPeriod = useRootStore(tradeSettingChartResolutionSelector)
  const setSelectedPeriod = useRootStore((s) => s.trade.setting.setChartResolution)

  // 使用外部状态或内部状态
  const isVisible = externalIsVisible !== undefined ? externalIsVisible : internalIsVisible
  const setIsVisible = onToggle || setInternalIsVisible

  const handleToggle = () => setIsVisible(!isVisible)

  return (
    <View className="bg-secondary">
      {/* 头部：收起时仅显示标题+展开，展开时显示周期 Tabs+隐藏 */}
      <View className="border-brand-default h-10 flex-row items-center justify-between border-b">
        {isVisible ? (
          <>
            <Tabs
              value={selectedPeriod}
              onValueChange={setSelectedPeriod}
              className="flex-1"
              renderTabBarRight={() => (
                <Pressable onPress={handleToggle} className="gap-xs pr-xl flex-row items-center">
                  <Text className="text-button-1 text-content-4">
                    <Trans>隐藏</Trans>
                  </Text>
                  <IconNavArrowSuperior width={16} height={16} className="text-content-4" />
                </Pressable>
              )}
            >
              <TabsList variant="text" size="sm" className="gap-2xl pl-medium pr-3xl" scrollable>
                {TIME_PERIODS.map((period) => (
                  <TabsTrigger key={period} value={period} className="flex-row">
                    <Text>{period}</Text>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </>
        ) : (
          <>
            <View className="px-xl py-xs">
              <Text className="text-button-1 text-content-1">
                <Trans>K线图表</Trans>
              </Text>
            </View>
            <Pressable onPress={handleToggle} className="gap-xs pr-xl flex-row items-center">
              <Text className="text-button-1 text-content-4">
                <Trans>展开</Trans>
              </Text>
              <IconNavArrowDown width={16} height={16} className="text-content-4" />
            </Pressable>
          </>
        )}
      </View>

      {/* 图表：隐藏时高度为 0，不销毁 WebView */}
      {/* Gesture.Native() 让 RNGH 将触摸事件直接交给 WebView 原生处理，
          避免外层 ScrollView 的 PanGesture 拦截图表内的拖拽/捏合操作 */}
      <GestureDetector gesture={Gesture.Native()}>
        <View
          className={cn({
            'border-brand-default border-b': isVisible,
          })}
          style={{ height: isVisible ? 193 : 0, overflow: 'hidden' }}
          onTouchStart={onInteractionStart}
          onTouchEnd={onInteractionEnd}
          onTouchCancel={onInteractionCancel}
        >
          <TradingviewChart mode="simple" resolution={PERIOD_TO_RESOLUTION[selectedPeriod] ?? '15'} />
        </View>
      </GestureDetector>
    </View>
  )
}
