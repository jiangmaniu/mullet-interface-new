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
  iconClassName?: string
  /**
   * 自定义文本样式类名
   */
  textClassName?: string
}

export function EmptyState({
  icon,
  message,
  className,
  iconClassName,
  textClassName,
}: EmptyStateProps) {
  return (
    <View className={cn('flex-1 items-center justify-center gap-medium', className)}>
      <View className={iconClassName}>
        {icon ?? <IconDefault width={67} height={48} />}
      </View>
      <Text className={cn('text-paragraph-p2 text-content-6', textClassName)}>
        {message}
      </Text>
    </View>
  )
}
