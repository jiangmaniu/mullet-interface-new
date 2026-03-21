import * as React from 'react'
import { Dimensions, Keyboard, Modal, Platform, Pressable, Text, TextInput, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { PressableProps, TextProps, ViewProps } from 'react-native'

import { useThemeColors } from '@/hooks/use-theme-colors'
import { cn } from '@/lib/utils'

import { IconButton } from './button'
import { IconifyXmark } from './icons'

const { height: screenHeight } = Dimensions.get('window')

// Context for drawer state
interface DrawerContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null)

function useDrawerContext() {
  const context = React.useContext(DrawerContext)
  if (!context) {
    throw new Error('Drawer components must be used within a Drawer')
  }
  return context
}

// Animation config
const animConfig = {
  duration: 300,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
}

const closeDuration = 350

// ============================================================================
// Drawer Root
// ============================================================================

export type DrawerRef = {
  open: () => void
  close: () => void
  toggle: () => void
}

interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function Drawer({ open, onOpenChange, children }: DrawerProps) {
  return <DrawerContext.Provider value={{ open, onOpenChange }}>{children}</DrawerContext.Provider>
}
Drawer.displayName = 'Drawer'

// ============================================================================
// Drawer Trigger
// ============================================================================

interface DrawerTriggerProps extends PressableProps {
  ref?: React.Ref<View>
  asChild?: boolean
}

function DrawerTrigger({ onPress, ref, ...props }: DrawerTriggerProps) {
  const { onOpenChange } = useDrawerContext()

  return (
    <Pressable
      ref={ref}
      onPress={(e) => {
        onOpenChange(true)
        onPress?.(e)
      }}
      {...props}
    />
  )
}
DrawerTrigger.displayName = 'DrawerTrigger'

// ============================================================================
// Drawer Portal (Modal with animations)
// ============================================================================

interface DrawerPortalProps {
  children: React.ReactNode
}

function DrawerPortal({ children }: DrawerPortalProps) {
  const { open, onOpenChange } = useDrawerContext()
  const [modalVisible, setModalVisible] = React.useState(false)

  // 分离：开关动画 vs 键盘偏移
  const overlayOpacity = useSharedValue(0)
  const drawerSlideY = useSharedValue(screenHeight) // 开关动画
  const keyboardOffsetY = useSharedValue(0) // 键盘偏移
  const keyboardTopRef = React.useRef(0)
  const lastFocusedRef = React.useRef<ReturnType<typeof TextInput.State.currentlyFocusedInput>>(null)
  const pollTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const measureAndAdjust = React.useCallback(
    (keyboardTop: number) => {
      if (Platform.OS === 'android') {
        // 安卓：Modal 内 measureInWindow 坐标不可靠
        // 直接用键盘高度的一半上移，确保输入框可见
        const keyboardHeight = screenHeight - keyboardTop
        const target = -(keyboardHeight * 0.5)
        keyboardOffsetY.value = withTiming(target, animConfig)
        return
      }

      const focused = TextInput.State.currentlyFocusedInput()
      if (!focused) return

      focused.measureInWindow((_x: number, y: number, _w: number, h: number) => {
        if (h === 0) return
        const currentOffset = keyboardOffsetY.value
        const originalBottom = y - currentOffset + h
        const overlap = originalBottom - keyboardTop + 20
        const target = overlap > 0 ? -overlap : 0
        keyboardOffsetY.value = withTiming(target, animConfig)
      })
    },
    [keyboardOffsetY],
  )

  const stopFocusPoll = React.useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }, [])

  const startFocusPoll = React.useCallback(() => {
    stopFocusPoll()
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
  }, [stopFocusPoll, measureAndAdjust])

  // 键盘事件
  React.useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const showSub = Keyboard.addListener(showEvent, (e) => {
      if (!open || !modalVisible) return
      keyboardTopRef.current = e.endCoordinates.screenY
      measureAndAdjust(e.endCoordinates.screenY)
      startFocusPoll()
    })

    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardTopRef.current = 0
      stopFocusPoll()
      // 安卓 keyboardDidHide 时布局已瞬间恢复，用动画会导致抖动，直接归零
      if (Platform.OS === 'android') {
        keyboardOffsetY.value = 0
      } else {
        keyboardOffsetY.value = withTiming(0, animConfig)
      }
    })

    return () => {
      showSub.remove()
      hideSub.remove()
      stopFocusPoll()
    }
  }, [open, modalVisible, measureAndAdjust, startFocusPoll, stopFocusPoll, keyboardOffsetY])

  // 开关动画
  React.useEffect(() => {
    if (open) {
      setModalVisible(true)
      overlayOpacity.value = withTiming(1, animConfig)
      drawerSlideY.value = withTiming(0, animConfig)
    } else if (modalVisible) {
      keyboardTopRef.current = 0
      stopFocusPoll()
      keyboardOffsetY.value = 0
      overlayOpacity.value = withTiming(0, { ...animConfig, duration: closeDuration })
      drawerSlideY.value = withTiming(screenHeight, { ...animConfig, duration: closeDuration })
      const timer = setTimeout(() => {
        setModalVisible(false)
      }, closeDuration)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, modalVisible])

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }))

  // 开关滑入/滑出动画（应用于外层整体）
  const slideAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: drawerSlideY.value }],
  }))

  // 键盘偏移动画（仅应用于内层 drawer 内容）
  const keyboardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: keyboardOffsetY.value }],
  }))

  const handleClose = React.useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={handleClose}>
      {/* 安卓 Modal 会创建新的原生 window，脱离外层 GestureHandlerRootView 作用域，需在内部重新包裹 */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* Overlay */}
        <Animated.View
          style={[
            {
              flex: 1,
              justifyContent: 'flex-end',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
            },
            overlayAnimatedStyle,
            slideAnimatedStyle,
          ]}
        >
          {/* Backdrop pressable for closing */}
          <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={handleClose} />

          {/* Drawer content wrapper */}
          <Animated.View
            style={[
              { maxHeight: screenHeight * 0.85 },
              // { maxHeight: screenHeight * 1 },
              keyboardAnimatedStyle,
            ]}
          >
            {children}
          </Animated.View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  )
}
DrawerPortal.displayName = 'DrawerPortal'

// ============================================================================
// Drawer Overlay (optional explicit overlay)
// ============================================================================

interface DrawerOverlayProps extends ViewProps {
  ref?: React.Ref<View>
}

function DrawerOverlay({ className, ref, ...props }: DrawerOverlayProps) {
  return <View ref={ref} className={cn('absolute inset-0 bg-black/60', className)} {...props} />
}
DrawerOverlay.displayName = 'DrawerOverlay'

// ============================================================================
// Drawer Content
// ============================================================================

interface DrawerContentProps extends ViewProps {
  ref?: React.Ref<View>
}

function DrawerContent({ className, children, ref, ...props }: DrawerContentProps) {
  return (
    <DrawerPortal>
      <SafeAreaView edges={['bottom']}>
        <View ref={ref} className={cn('bg-special rounded-t-large gap-3xl', className)} {...props}>
          {children}
        </View>
      </SafeAreaView>
    </DrawerPortal>
  )
}
DrawerContent.displayName = 'DrawerContent'

// ============================================================================
// Drawer Header
// ============================================================================

interface DrawerHeaderProps extends ViewProps {
  ref?: React.Ref<View>
  showClose?: boolean
}

function DrawerHeader({ className, ref, showClose = true, children, ...props }: DrawerHeaderProps) {
  return (
    <View ref={ref} className={cn('flex-row items-center justify-between', className)} {...props}>
      <View className="flex-1">{children}</View>
      {showClose && <DrawerClose />}
    </View>
  )
}
DrawerHeader.displayName = 'DrawerHeader'

// ============================================================================
// Drawer Title
// ============================================================================

interface DrawerTitleProps extends TextProps {
  ref?: React.Ref<Text>
}

function DrawerTitle({ className, ref, ...props }: DrawerTitleProps) {
  return (
    <View className="min-h-6 justify-center">
      <Text ref={ref} className={cn('text-important-1 text-content-1', className)} {...props} />
    </View>
  )
}
DrawerTitle.displayName = 'DrawerTitle'

// ============================================================================
// Drawer Description
// ============================================================================

interface DrawerDescriptionProps extends TextProps {
  ref?: React.Ref<Text>
}

function DrawerDescription({ className, ref, ...props }: DrawerDescriptionProps) {
  return <Text ref={ref} className={cn('text-content-4 text-paragraph-p3', className)} {...props} />
}
DrawerDescription.displayName = 'DrawerDescription'

// ============================================================================
// Drawer Footer
// ============================================================================

interface DrawerFooterProps extends ViewProps {
  ref?: React.Ref<View>
}

function DrawerFooter({ className, ref, ...props }: DrawerFooterProps) {
  return <View ref={ref} className={cn('flex-row', className)} {...props} />
}
DrawerFooter.displayName = 'DrawerFooter'

// ============================================================================
// Drawer Close
// ============================================================================

interface DrawerCloseProps extends PressableProps {
  ref?: React.Ref<View>
}

function DrawerClose({ onPress, className, children, ref, ...props }: DrawerCloseProps) {
  const { onOpenChange } = useDrawerContext()
  const { colorBrandSecondary3 } = useThemeColors()

  return (
    <IconButton variant="none" onPress={() => onOpenChange(false)} {...props}>
      <IconifyXmark width={24} height={24} color={colorBrandSecondary3} />
    </IconButton>
  )
}
DrawerClose.displayName = 'DrawerClose'

export {
  Drawer,
  DrawerTrigger,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  useDrawerContext,
}
