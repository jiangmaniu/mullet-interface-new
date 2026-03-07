import { View, Text } from 'react-native'

interface NotificationBadgeProps {
  count: number
}

/**
 * 通知角标组件
 */
export function NotificationBadge({ count }: NotificationBadgeProps) {
  if (count <= 0) return null

  return (
    <View className="bg-status-danger rounded-full min-w-[16px] h-4 items-center justify-center px-1 absolute -top-1 -right-1">
      <Text className="text-[10px] text-white font-medium">
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  )
}
