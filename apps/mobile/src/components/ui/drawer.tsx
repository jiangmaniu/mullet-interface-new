import * as React from 'react'
import {
  View,
  Text,
  Pressable,
  Modal,
  Dimensions,
  type ViewProps,
  type TextProps,
  type PressableProps,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { cn } from '@/lib/utils'
import { IconButton } from './button'
import { IconifyXmark } from './icons'
import { useThemeColors } from '@/hooks/use-theme-colors'

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

interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function Drawer({ open, onOpenChange, children }: DrawerProps) {
  return (
    <DrawerContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DrawerContext.Provider>
  )
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

  // Reanimated shared values
  const overlayOpacity = useSharedValue(0)
  const drawerTranslateY = useSharedValue(screenHeight)

  // Animation effects
  React.useEffect(() => {
    if (open) {
      setModalVisible(true)
      overlayOpacity.value = withTiming(1, animConfig)
      drawerTranslateY.value = withTiming(0, animConfig)
    } else if (modalVisible) {
      overlayOpacity.value = withTiming(0, { ...animConfig, duration: closeDuration })
      drawerTranslateY.value = withTiming(screenHeight, { ...animConfig, duration: closeDuration })
      const timer = setTimeout(() => {
        setModalVisible(false)
      }, closeDuration)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, modalVisible])

  // Animated styles
  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }))

  const drawerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: drawerTranslateY.value }],
  }))

  const handleClose = React.useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* Overlay */}
      <Animated.View
        style={[
          {
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          },
          overlayAnimatedStyle,
        ]}
      >
        {/* Backdrop pressable for closing */}
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={handleClose}
        />

        {/* Drawer content wrapper */}
        <Animated.View
          style={[
            { maxHeight: screenHeight * 0.85 },
            drawerAnimatedStyle,
          ]}
        >
          {children}
        </Animated.View>
      </Animated.View>
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
  return (
    <View
      ref={ref}
      className={cn('absolute inset-0 bg-black/60', className)}
      {...props}
    />
  )
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
      <View
        ref={ref}
        className={cn(
          'bg-special rounded-t-large gap-3xl',
          className
        )}
        {...props}
      >
        {children}
      </View>
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
    <View
      ref={ref}
      className={cn('pt-xl px-5 relative', className, { 'pr-11': showClose })}
      {...props}
    >
      {children}
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
    <View className='justify-center min-h-6'>
      <Text
        ref={ref}
        className={cn('text-important-1 text-content-1', className)}
        {...props}
      />
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
  return (
    <Text
      ref={ref}
      className={cn('text-content-4 text-paragraph-p3 mt-medium', className)}
      {...props}
    />
  )
}
DrawerDescription.displayName = 'DrawerDescription'

// ============================================================================
// Drawer Footer
// ============================================================================

interface DrawerFooterProps extends ViewProps {
  ref?: React.Ref<View>
}

function DrawerFooter({ className, ref, ...props }: DrawerFooterProps) {
  return (
    <View
      ref={ref}
      className={cn('px-5 mb-3xl', className)}
      {...props}
    />
  )
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
    <IconButton
      variant='none'
      onPress={() => onOpenChange(false)}
      className='absolute right-5 top-xl'
      {...props}
    >
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
}
