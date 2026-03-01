import { useState } from 'react'
import { View, Pressable } from 'react-native'
import { Trans } from '@lingui/react/macro'

import { Text } from '@/components/ui/text'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IconNavArrowSuperior, IconNavArrowDown } from '@/components/ui/icons'
import { TradingviewChart } from '@/components/tradingview'
import { cn } from '@/lib/utils'

const TIME_PERIODS = [
  '1分',
  '5分',
  '15分',
  '30分',
  '1小时',
  '4小时',
  '1天',
  '1周',
  '1月',
]

const PERIOD_TO_RESOLUTION: Record<string, string> = {
  '1分': '1',
  '5分': '5',
  '15分': '15',
  '30分': '30',
  '1小时': '60',
  '4小时': '160',
  '1天': '1D',
  '1周': '1W',
  '1月': '1M',
}

export function SymbolChartView() {
  const [isVisible, setIsVisible] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('15分') // 默认周期

  const handleToggle = () => setIsVisible((prev) => !prev)

  return (
    <View>
      {/* 头部：收起时仅显示标题+展开，展开时显示周期 Tabs+隐藏 */}
      <View className="flex-row items-center justify-between border-b border-brand-default h-10">
        {isVisible ? (
          <>
            <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="flex-1" renderTabBarRight={() => (
              <Pressable onPress={handleToggle} className="flex-row items-center gap-xs pr-xl">
                <Text className="text-button-1 text-content-4">
                  <Trans>隐藏</Trans>
                </Text>
                <IconNavArrowSuperior width={16} height={16} className="text-content-4" />
              </Pressable>
            )}>
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
            <Pressable onPress={handleToggle} className="flex-row items-center gap-xs pr-xl">
              <Text className="text-button-1 text-content-4">
                <Trans>展开</Trans>
              </Text>
              <IconNavArrowDown width={16} height={16} className="text-content-4" />
            </Pressable>
          </>
        )}
      </View>

      {/* 图表：隐藏时高度为 0，不销毁 WebView */}
      <View
        className={cn({
          'border-b border-brand-default': isVisible,
        })}
        style={{ height: isVisible ? 193 : 0, overflow: 'hidden' }}
      >
        <TradingviewChart mode="simple" resolution={PERIOD_TO_RESOLUTION[selectedPeriod] ?? '15'} />
      </View>
    </View >
  )
}
