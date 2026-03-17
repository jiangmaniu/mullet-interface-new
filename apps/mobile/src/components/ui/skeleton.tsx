import React, { useEffect, useRef } from 'react'
import { Animated, Platform, StyleSheet, View, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  style?: ViewStyle
}

/**
 * 骨架屏组件 - 带有从左到右的光晕动画
 * 使用className控制宽高圆角等样式
 */
export function Skeleton({ className, style }: SkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // 创建循环动画
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 2500, // 调慢速度：1500ms -> 2500ms
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    )

    animation.start()

    return () => {
      animation.stop()
    }
  }, [animatedValue])

  // 计算光晕的translateX位置
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 400], // 从左侧-200移动到右侧400
  })

  return (
    <View
      className={cn('overflow-hidden bg-zinc-300/10', className)}
      style={[
        {
          overflow: 'hidden', // iOS兼容：明确设置overflow
          backgroundColor: Platform.OS === 'ios' ? 'rgba(161, 161, 170, 0.1)' : undefined, // iOS兼容：确保背景色生效
        },
        style,
      ]}
    >
      {/* 光晕渐变层 */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255, 255, 255, 0.03)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            StyleSheet.absoluteFill,
            {
              width: '200%', // iOS兼容：确保渐变宽度足够
            },
          ]}
        />
      </Animated.View>
    </View>
  )
}
