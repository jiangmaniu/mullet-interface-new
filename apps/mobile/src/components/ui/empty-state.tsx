import { View } from 'react-native'
import { Text } from '@/components/ui/text'
import { IconDefault } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  /**
   * 自定义图标组件
   * @default IconDefault
   */
  icon?: ReactNode
  /**
   * 空状态提示文本
   */
  message: ReactNode
  /**
   * 自定义容器样式类名
   */
  className?: string
  /**
   * 自定义图标容器样式类名
   */
  iconContainerClassName?: string
  /**
   * 自定义图标样式类名
   */
  iconClassName?: string
  /**
   * 自定义文本样式类名
   */
  textClassName?: string
  /**
   * 自定义图标宽度
   */
  iconWidth?: number
  /**
   * 自定义图标高度
   */
  iconHeight?: number
}

export function EmptyState({
  icon,
  message,
  className,
  iconClassName,
  iconContainerClassName,
  textClassName,
  iconWidth = 67,
  iconHeight = 48,
}: EmptyStateProps) {
  return (
    <View className={cn('items-center justify-center gap-medium', className)}>
      <View className={iconContainerClassName}>
        {icon ?? <IconDefault width={iconWidth} height={iconHeight} className={iconClassName} />}
      </View>
      <Text className={cn('text-paragraph-p2 text-content-6', textClassName)}>
        {message}
      </Text>
    </View>
  )
}
