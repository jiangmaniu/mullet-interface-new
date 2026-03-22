import React, { useCallback } from 'react'
import { Pressable, View } from 'react-native'
import { Slider as AwesomeSlider } from 'react-native-awesome-slider'
import Animated, { type SharedValue, useAnimatedStyle, useDerivedValue, useSharedValue } from 'react-native-reanimated'
import { useResolveClassNames } from 'uniwind'

import { cn } from '@/lib/utils'
import { vibrate } from '@/v1/utils/native'

// 颜色常量，与 theme 保持一致
const MARK_ACTIVE_COLOR = '#EED94C'
const MARK_INACTIVE_COLOR = '#393d60'
const LABEL_ACTIVE_COLOR = 'rgba(255,255,255,0.87)' // text-content-1
const LABEL_INACTIVE_COLOR = 'rgba(255,255,255,0.36)' // text-content-3

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

/**
 * 独立 Mark 组件，通过 useDerivedValue + useAnimatedStyle
 * 在 UI 线程直接驱动颜色变化，拖动过程零 JS 重渲染
 */
const SliderMark = React.memo(function SliderMark({
  markValue,
  progress,
  showLabel,
  label,
  isFirst,
  isLast,
  onValueChange,
}: {
  markValue: number
  progress: SharedValue<number>
  showLabel: boolean
  label: string
  isFirst: boolean
  isLast: boolean
  onValueChange?: (value: number) => void
}) {
  const active = useDerivedValue(() => markValue <= progress.value)

  const dotStyle = useAnimatedStyle(() => ({
    backgroundColor: active.value ? MARK_ACTIVE_COLOR : MARK_INACTIVE_COLOR,
  }))

  const labelColorStyle = useAnimatedStyle(() => ({
    color: active.value ? LABEL_ACTIVE_COLOR : LABEL_INACTIVE_COLOR,
  }))

  const handlePress = useCallback(() => {
    progress.value = markValue
    onValueChange?.(markValue)
  }, [progress, markValue, onValueChange])

  const dotBaseStyle = useResolveClassNames('rounded-3 h-[6px] w-[6px]')
  const labelFirstStyle = useResolveClassNames('absolute top-[10px] w-[38px] left-0')
  const labelLastStyle = useResolveClassNames('absolute top-[10px] w-[38px] right-0')
  const labelCenterStyle = useResolveClassNames('absolute top-[10px] w-[38px] -translate-x-[16px]')
  const textLeftStyle = useResolveClassNames('text-[11px] text-left')
  const textRightStyle = useResolveClassNames('text-[11px] text-right')
  const textCenterStyle = useResolveClassNames('text-[11px] text-center')

  return (
    <View>
      <Pressable hitSlop={8} onPress={handlePress}>
        <Animated.View style={[dotBaseStyle, dotStyle]} />
      </Pressable>
      {showLabel && (
        <Pressable
          hitSlop={4}
          onPress={handlePress}
          style={isFirst ? labelFirstStyle : isLast ? labelLastStyle : labelCenterStyle}
        >
          <Animated.Text
            style={[
              isFirst ? textLeftStyle : isLast ? textRightStyle : textCenterStyle,
              labelColorStyle,
            ]}
          >
            {label}
          </Animated.Text>
        </Pressable>
      )}
    </View>
  )
})

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
  labelFormat = (v) => `${v}%`,
}: SliderProps) {
  const isControlled = controlledValue !== undefined
  const initialValue = controlledValue ?? defaultValue

  const progress = useSharedValue(initialValue)
  const minValue = useSharedValue(min)
  const maxValue = useSharedValue(max)

  // 受控模式：外部 value 变化直接同步到 shared value
  if (isControlled) {
    progress.value = controlledValue
  }

  const markInterval = interval ?? step ?? 25
  const numberOfMarks = Math.floor((max - min) / markInterval) + 1

  const handleValueChange = useCallback(
    (value: number) => {
      const steppedValue = Math.round(value / step) * step
      onValueChange?.(steppedValue)
    },
    [step, onValueChange],
  )

  return (
    <View className={cn(showLabels ? 'pb-[28px]' : '', className)}>
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
        hapticMode="step"
        onHapticFeedback={() => vibrate(10)}
        thumbTouchSize={15}
        thumbWidth={10}
        panHitSlop={{ top: 10, bottom: 10 }}
        renderThumb={() => (
          <View className="rounded-5 bg-primary border-brand-primary size-[10px] border-[2px]">
            <View className="size-full" />
          </View>
        )}
        steps={numberOfMarks - 1}
        markWidth={6}
        renderMark={({ index }) => (
          <SliderMark
            markValue={min + index * markInterval}
            progress={progress}
            showLabel={showLabels}
            label={labelFormat(min + index * markInterval)}
            isFirst={index === 0}
            isLast={index === numberOfMarks - 1}
            onValueChange={onValueChange}
          />
        )}
      />
    </View>
  )
}
