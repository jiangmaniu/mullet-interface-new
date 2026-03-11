import React from 'react'
import { Pressable, View } from 'react-native'
import { toast as sonnerToast } from 'sonner-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated'
import { router } from 'expo-router'

import { cn } from '@/lib/utils'
import { IconSuccess } from './icons/set/success'
import { IconifyXmark } from './icons'
import { Text } from './text'

interface AnnouncementToastProps {
  id: number
  title: string
  content: string
  toastId: string | number
}

/**
 * 公告通知 Toast 组件
 * - 支持点击跳转到通知详情
 * - 支持上、左、右滑动关闭
 */
export function AnnouncementToast({ id, title, content, toastId }: AnnouncementToastProps) {
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)

  const dismissToast = () => {
    sonnerToast.dismiss(toastId)
  }

  // 手势处理：支持上、左、右滑动关闭
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // 只允许向上、向左、向右滑动
      if (event.translationY < 0) {
        translateY.value = event.translationY
      }
      if (event.translationX !== 0) {
        translateX.value = event.translationX
      }
    })
    .onEnd((event) => {
      const shouldDismiss =
        Math.abs(event.translationX) > 100 || // 左右滑动超过 100
        event.translationY < -50 // 向上滑动超过 50

      if (shouldDismiss) {
        runOnJS(dismissToast)()
      } else {
        // 回弹
        translateX.value = withSpring(0)
        translateY.value = withSpring(0)
      }
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }))

  const handlePress = () => {
    dismissToast()
    router.push(`/notifications/detail?id=${id}`)
  }

  const handleClose = () => {
    dismissToast()
  }

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[{ width: '90%', maxWidth: 400 }, animatedStyle]}>
        <Pressable onPress={handlePress}>
          <View
            className={cn(
              'bg-background-2 flex-row items-start gap-3 rounded-2xl border-2 border-brand-primary p-4',
            )}
          >
            {/* 左侧图标 */}
            <View className="mt-0.5">
              <IconSuccess width={24} height={24} />
            </View>

            {/* 中间内容 */}
            <View className="flex-1 flex-shrink gap-1">
              <Text className="text-title-t3 text-content-1">{title}</Text>
              <Text className="text-paragraph-p2 text-brand-primary" numberOfLines={1}>
                {content}
              </Text>
            </View>

            {/* 右侧关闭按钮 */}
            <Pressable onPress={handleClose} hitSlop={8}>
              <IconifyXmark width={20} height={20} className="text-content-3" />
            </Pressable>
          </View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  )
}
