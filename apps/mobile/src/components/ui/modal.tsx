import * as React from 'react'
import { Pressable, Modal as RNModal, TouchableWithoutFeedback, View } from 'react-native'
import type { ModalProps as RNModalProps, ViewProps } from 'react-native'

import { Text } from '@/components/ui/text'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { cn } from '@/lib/utils'

import { IconButton } from './button'
import { IconifyXmark } from './icons'

const ModalContext = React.createContext<{
  onClose?: () => void
}>({})

export type ModalRef = {
  open: () => void
  close: () => void
  toggle: () => void
}

interface ModalProps extends RNModalProps {
  /**
   * 是否显示遮罩层
   * @default true
   */
  hasBackdrop?: boolean
  /**
   * 点击遮罩层是否关闭
   * @default true
   */
  closeOnBackdropPress?: boolean
  /**
   * 关闭回调
   */
  onClose?: () => void
  className?: string
}

/**
 * 基础模态框组件 (Modal)
 *
 * 封装了 React Native Modal，提供了遮罩层点击关闭等功能。
 */
function Modal({
  className,
  transparent = true,
  animationType = 'fade',
  hasBackdrop = true,
  closeOnBackdropPress = true,
  onClose,
  children,
  ...props
}: ModalProps) {
  return (
    <ModalContext.Provider value={{ onClose }}>
      <RNModal
        transparent={transparent}
        animationType={animationType}
        statusBarTranslucent
        onRequestClose={onClose}
        {...props}
      >
        <TouchableWithoutFeedback onPress={closeOnBackdropPress ? onClose : undefined}>
          <View className={cn('flex-1 items-center justify-center', hasBackdrop && 'bg-black/80', className)}>
            <TouchableWithoutFeedback>{children}</TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </RNModal>
    </ModalContext.Provider>
  )
}

function ModalContent({ className, children, ref, ...props }: ViewProps & { ref?: React.Ref<View> }) {
  return (
    <View
      ref={ref}
      className={cn(
        'bg-special rounded-large border-brand-default pointer-events-box-none gap-3xl w-[281px] shrink-0 border',
        className,
      )}
      {...props}
    >
      {children}
    </View>
  )
}

function ModalHeader({
  className,
  children,
  showClose = true,
  ref,
  ...props
}: ViewProps & { showClose?: boolean; ref?: React.Ref<View> }) {
  return (
    <View ref={ref} className={cn('px-2xl mt-2xl relative', className, { 'pr-10': showClose })} {...props}>
      {children}
      {showClose && <ModalClose />}
    </View>
  )
}

function ModalTitle({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof Text> & { ref?: React.Ref<import('react-native').Text> }) {
  return (
    <View className="min-h-6 justify-center">
      <Text ref={ref} className={cn('text-important-1 text-content-1', className)} {...props} />
    </View>
  )
}

function ModalDescription({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof Text> & { ref?: React.Ref<import('react-native').Text> }) {
  return <Text ref={ref} className={cn('text-content-4 text-paragraph-p3 mt-medium', className)} {...props} />
}

function ModalFooter({ className, ref, ...props }: ViewProps & { ref?: React.Ref<View> }) {
  return <View ref={ref} className={cn('px-2xl pb-2xl w-full flex-row justify-end gap-4', className)} {...props} />
}

/**
 * 模态框关闭按钮
 * 默认使用 X 图标，放置在 Header 右侧
 */
function ModalClose({
  className,
  onPress,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof Pressable> & { ref?: React.Ref<typeof Pressable> }) {
  const { onClose } = React.useContext(ModalContext)
  const { colorBrandSecondary3 } = useThemeColors()
  return (
    <IconButton variant="none" onPress={onClose} className="right-2xl absolute top-1/2 -translate-y-1/2" {...props}>
      <IconifyXmark width={24} height={24} color={colorBrandSecondary3} />
    </IconButton>
  )
}

export { Modal, ModalClose, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle }
