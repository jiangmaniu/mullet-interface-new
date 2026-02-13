import * as React from 'react'
import { View, Modal, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'
import { Text } from './text'
import { IconSuccess } from './icons/set/success'
import { IconRemind } from './icons/set/remind'
import { cn } from '@/lib/utils'

// Toast 配置
interface ToastConfig {
  message: string
  duration?: number
  type?: 'success' | 'error' | 'info' | 'remind'
  icon?: React.ReactNode
}

// Toast 上下文
interface ToastContextValue {
  show: (config: ToastConfig) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Toast Provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = React.useState(false)
  const [config, setConfig] = React.useState<ToastConfig>({ message: '' })
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(-20)
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  const hide = React.useCallback(() => {
    opacity.value = withTiming(0, { duration: 200 })
    translateY.value = withTiming(-20, { duration: 200 }, () => {
      runOnJS(setVisible)(false)
    })
  }, [opacity, translateY])

  const show = React.useCallback(
    (newConfig: ToastConfig) => {
      // 清除之前的定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      setConfig(newConfig)
      setVisible(true)

      // 动画显示
      opacity.value = withTiming(1, { duration: 200 })
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      })

      // 自动隐藏
      const duration = newConfig.duration ?? 2000
      timeoutRef.current = setTimeout(() => {
        hide()
      }, duration)
    },
    [opacity, translateY, hide]
  )

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  const getIcon = () => {
    if (config.icon) return config.icon
    if (config.type === 'success') return <IconSuccess width={24} height={24} />
    if (config.type === 'remind') return <IconRemind width={24} height={24} />
    return null
  }

  const borderClass = config.type === 'remind' ? 'border-status-warning' : 'border-brand-default'

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {visible && (
        <Modal transparent visible={visible} animationType="none">
          <Pressable
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={hide}
          >
            <Animated.View style={animatedStyle}>
              <View
                className={cn(
                  'bg-secondary border',
                  borderClass,
                  'rounded-xl px-3 py-1.5 flex-row items-center gap-medium'
                )}
              >
                {getIcon()}
                <Text className="text-paragraph-p2 text-content-1">
                  {config.message}
                </Text>
              </View>
            </Animated.View>
          </Pressable>
        </Modal>
      )}
    </ToastContext.Provider>
  )
}

// 便捷方法
export const toast = {
  success: (message: string, duration?: number) => {
    // 这个方法需要在 ToastProvider 上下文中使用
    // 实际使用时应该通过 useToast hook
    console.warn('toast.success should be called via useToast hook')
  },
}
