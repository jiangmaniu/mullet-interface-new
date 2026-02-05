import React from 'react'
import { View } from 'react-native'
import { Slider as AwesomeSlider } from 'react-native-awesome-slider'
import { useSharedValue } from 'react-native-reanimated'
import { useResolveClassNames } from 'uniwind'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'

interface SliderProps {
  min?: number
  max?: number
  step?: number
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  interval?: number
  className?: string
  disabled?: boolean
  /** 是否显示刻度标签 */
  showLabels?: boolean
  /** 标签格式化函数 */
  labelFormat?: (value: number) => string
}

export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value: controlledValue,
  defaultValue = 0,
  onValueChange,
  interval = 25,
  className,
  disabled = false,
  showLabels = true,
  labelFormat = (value) => `${value}%`,
}: SliderProps) {
  // 使用 Reanimated shared values
  const progress = useSharedValue(controlledValue ?? defaultValue)
  const minValue = useSharedValue(min)
  const maxValue = useSharedValue(max)

  // 当 controlledValue 变化时更新 progress
  React.useEffect(() => {
    if (controlledValue !== undefined) {
      progress.value = controlledValue
    }
  }, [controlledValue, progress])

  // 处理值变化
  const handleValueChange = (value: number) => {
    // 按 step 对齐
    const steppedValue = Math.round(value / step) * step
    onValueChange?.(steppedValue)
  }

  // 计算刻度标记
  const markInterval = interval ?? step ?? 25
  const numberOfMarks = Math.floor((max - min) / markInterval) + 1

  return (
    <View className={cn('gap-medium', className)}>
      <AwesomeSlider
        progress={progress}
        minimumValue={minValue}
        maximumValue={maxValue}
        onValueChange={handleValueChange}
        renderBubble={() => null}
        disable={disabled}
        theme={{
          minimumTrackTintColor: '#EED94C',
          maximumTrackTintColor: '#393d60',
          bubbleBackgroundColor: '#0E123A',
          bubbleTextColor: '#EED94C',
          heartbeatColor: '#EED94C',
        }}
        containerStyle={useResolveClassNames('h-[2px] rounded-0')}
        thumbWidth={10}
        renderThumb={() => (
          <View className='size-[10px] rounded-5 bg-primary border-[2px] border-brand-primary'>
            <View className='size-full' />
          </View>
        )}
        // 刻度配置
        steps={numberOfMarks - 1}
        markWidth={6}
        renderMark={({ index }) => {
          const markValue = min + index * markInterval
          const active = markValue <= (controlledValue ?? defaultValue)
          return (
            <View
              className={cn('w-[6px] h-[6px] rounded-3', active ? 'bg-brand-primary' : 'bg-brand-secondary-1')}
            />
          )
        }}
      />

      {showLabels && (
        <View className="flex-row justify-between">
          {Array.from({ length: numberOfMarks }, (_, index) => {
            const markValue = min + index * markInterval
            return (
              <Text key={index} className="text-paragraph-p3 text-content-1">
                {labelFormat(markValue)}
              </Text>
            )
          })}
        </View>
      )}
    </View>
  )
}

