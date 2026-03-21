import React, { useCallback, useEffect, useRef } from 'react'
import { AppState, Dimensions, Keyboard, Platform, TextInput, ViewProps } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

interface KeyboardAvoidViewProps extends ViewProps {
  /** 最大上移距离（防止内容移出屏幕） */
  maxOffset: number
  /** 输入框与键盘之间的间距，默认 20 */
  padding?: number
  /** 动画时长（ms），默认 250 */
  duration?: number
  children: React.ReactNode
}

/**
 * KeyboardAvoidView - 基于 translateY 的键盘避让容器
 *
 * 适用于不能滚动的固定布局（collapsible header、自定义布局等）。
 * 键盘弹出时测量聚焦输入框是否被遮挡，仅在遮挡时上移内容。
 *
 * 与 KeyboardAwareContainer（基于 scroll）的区别：
 * - KeyboardAwareContainer：用于常规可滚动页面
 * - KeyboardAvoidView：用于固定布局，通过 translateY 平移内容
 *
 * @example
 * ```tsx
 * const [bannerHeight, setBannerHeight] = useState(0)
 *
 * <KeyboardAvoidView maxOffset={bannerHeight}>
 *   <View onLayout={(e) => setBannerHeight(e.nativeEvent.layout.height)}>
 *     <Chart />
 *     <AccountCard />
 *   </View>
 *   <OrderPanel />  // 含输入框，被键盘遮挡时整块内容上移
 * </KeyboardAvoidView>
 * ```
 */
export function KeyboardAvoidView({
  maxOffset,
  padding = 20,
  duration = 250,
  children,
  style,
  ...props
}: KeyboardAvoidViewProps) {
  const translateY = useSharedValue(0)
  const keyboardTopRef = useRef(0)
  const lastFocusedRef = useRef<ReturnType<typeof TextInput.State.currentlyFocusedInput>>(null)
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const containerRef = useRef<any>(null)

  const measureAndAdjust = useCallback(
    (keyboardTop: number) => {
      const focused = TextInput.State.currentlyFocusedInput()
      if (!focused || maxOffset <= 0 || !containerRef.current) return

      // 先测量容器，再测量输入框，确认输入框在容器内才处理
      containerRef.current.measureInWindow((_cx: number, cy: number, _cw: number, ch: number) => {
        if (ch === 0) return
        focused.measureInWindow((_fx: number, fy: number, _fw: number, fh: number) => {
          if (fh === 0) return
          // 输入框不在容器纵向范围内 → 是 Drawer/Modal 里的输入框，跳过
          if (fy + fh < cy || fy > cy + ch) return

          const currentOffset = translateY.value
          const originalBottom = fy - currentOffset + fh
          const overlap = originalBottom - keyboardTop + padding
          const target = overlap > 0 ? -Math.min(overlap, maxOffset) : 0
          translateY.value = withTiming(target, { duration })
        })
      })
    },
    [maxOffset, padding, duration, translateY],
  )

  const startFocusPoll = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
    }
    lastFocusedRef.current = TextInput.State.currentlyFocusedInput()
    pollTimerRef.current = setInterval(() => {
      const current = TextInput.State.currentlyFocusedInput()
      if (current !== lastFocusedRef.current) {
        lastFocusedRef.current = current
        if (current && keyboardTopRef.current > 0) {
          measureAndAdjust(keyboardTopRef.current)
        }
      }
    }, 150)
  }, [measureAndAdjust])

  const stopFocusPoll = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const keyboardTop =
        Platform.OS === 'ios' ? e.endCoordinates.screenY : Dimensions.get('window').height - e.endCoordinates.height
      keyboardTopRef.current = keyboardTop
      measureAndAdjust(keyboardTop)
      startFocusPoll()
    })

    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardTopRef.current = 0
      stopFocusPoll()
      translateY.value = withTiming(0, { duration })
    })

    // 切换应用回来时重新测量
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && keyboardTopRef.current > 0) {
        measureAndAdjust(keyboardTopRef.current)
      }
    })

    return () => {
      showSub.remove()
      hideSub.remove()
      appStateSub.remove()
      stopFocusPoll()
    }
  }, [measureAndAdjust, startFocusPoll, stopFocusPoll, duration, translateY])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <Animated.View ref={containerRef} style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  )
}
