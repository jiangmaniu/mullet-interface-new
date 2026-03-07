import { View, ScrollView, ActivityIndicator } from 'react-native'
import { useLocalSearchParams } from 'expo-router'

import { Text } from '@/components/ui/text'
import { ScreenHeader } from '@/components/ui/screen-header'
import { useMessageDetail } from './_hooks/use-message-detail'

export default function NotificationDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: message, isLoading } = useMessageDetail(id)

  if (isLoading) {
    return (
      <View className="flex-1 bg-secondary">
        <ScreenHeader content="消息详情" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </View>
    )
  }

  if (!message) {
    return (
      <View className="flex-1 bg-secondary">
        <ScreenHeader content="消息详情" />
        <View className="flex-1 items-center justify-center">
          <Text className="text-paragraph-p2 text-content-4">消息不存在</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-secondary">
      <ScreenHeader content="消息详情" />
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <View className="gap-xl">
          {/* 标题 */}
          <Text className="text-paragraph-p1 text-content-1 font-medium">
            {message.title}
          </Text>

          {/* 创建时间 */}
          <Text className="text-paragraph-p3 text-content-4">
            {message.createTime}
          </Text>

          {/* 内容 */}
          <Text className="text-paragraph-p2 text-content-2 leading-6">
            {message.content}
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
