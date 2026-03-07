import { Trans } from '@lingui/react/macro'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from 'react-native'
import { Route } from 'react-native-tab-view'
import { router } from 'expo-router'

import { EmptyState } from '@/components/states/empty-state'
import { IconifyTrash } from '@/components/ui/icons'
import { ScreenHeader } from '@/components/ui/screen-header'
import { SwipeableTabs } from '@/components/ui/tabs'
import { Text } from '@/components/ui/text'
import { useThemeColors } from '@/hooks/use-theme-colors'

import { useMarkAllRead } from './_hooks/use-mark-all-read'
import { useMessageList } from './_hooks/use-message-list'
import { useUnreadCount } from './_hooks/use-unread-count'

// ============ NotificationItem ============
interface NotificationItemProps {
  id: string
  title: string
  description: string
  time: string
  unread?: boolean
  onPress: () => void
}

function NotificationItem({ id, title, description, time, unread, onPress }: NotificationItemProps) {
  return (
    <Pressable onPress={onPress}>
      <View className="gap-xs p-xl">
        <View className="flex-row items-center justify-between">
          <Text className="text-paragraph-p2 text-content-1 flex-1">{title}</Text>
          {unread && <View className="bg-status-danger ml-medium size-2 rounded-full" />}
        </View>
        <Text className="text-paragraph-p3 text-content-4" numberOfLines={2}>
          {description}
        </Text>
        <Text className="text-paragraph-p3 text-content-4">{time}</Text>
      </View>
    </Pressable>
  )
}

// ============ NotificationList ============
interface NotificationListProps {
  type: 'SINGLE' | 'GROUP'
}

function NotificationList({ type }: NotificationListProps) {
  const queryClient = useQueryClient()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching, isLoading } =
    useMessageList(type)

  const items = useMemo(() => {
    return data?.pages.flatMap((page) => page?.records || []) || []
  }, [data])

  const handleItemPress = useCallback(
    (item: Message.MessageItem) => {
      // 乐观更新：标记为已读
      if (item.isRead === 'UNREAD') {
        queryClient.setQueryData(['message', 'list', type], (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              records: page.records.map((record: Message.MessageItem) =>
                record.id === item.id ? { ...record, isRead: 'READ' } : record,
              ),
            })),
          }
        })
        // 刷新未读数量
        queryClient.invalidateQueries({ queryKey: ['message', 'unread-count'] })
      }
      // 跳转到详情页
      router.push(`/notifications/detail?id=${item.id}`)
    },
    [type, queryClient],
  )

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null
    return (
      <View className="items-center py-4">
        <ActivityIndicator />
      </View>
    )
  }, [isFetchingNextPage])

  // 初始加载状态
  if (isLoading) {
    return (
      <View className="py-[96px]">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  // 空状态
  if (items.length === 0) {
    return (
      <View className="py-[96px]">
        <EmptyState message={<Trans>暂无内容</Trans>} iconWidth={107} iconHeight={76} className="gap-2xl" />
      </View>
    )
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id!}
      renderItem={({ item }) => (
        <NotificationItem
          id={item.id!}
          title={item.title || ''}
          description={item.content || ''}
          time={item.createTime || ''}
          unread={item.isRead === 'UNREAD'}
          onPress={() => handleItemPress(item)}
        />
      )}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      showsVerticalScrollIndicator={false}
    />
  )
}

// ============ Main Page ============
export default function NotificationsPage() {
  const { textColorContent1 } = useThemeColors()
  const { mutate: markAllRead } = useMarkAllRead()
  const { data: unreadCount = 0 } = useUnreadCount()

  const routes = useMemo<Route[]>(
    () => [
      { key: 'notifications', title: '通知' },
      { key: 'announcements', title: '公告' },
    ],
    [],
  )

  const renderScene = useCallback(({ route }: { route: Route }) => {
    if (route.key === 'notifications') {
      return <NotificationList type="SINGLE" />
    }
    return <NotificationList type="GROUP" />
  }, [])

  const handleMarkAllRead = useCallback(() => {
    markAllRead()
  }, [markAllRead])

  return (
    <View className="bg-secondary flex-1">
      <ScreenHeader
        content="消息通知"
        right={
          unreadCount > 0 ? (
            <Pressable onPress={handleMarkAllRead} className="p-1">
              <IconifyTrash width={20} height={20} color={textColorContent1} />
            </Pressable>
          ) : null
        }
      />
      <SwipeableTabs
        routes={routes}
        renderScene={renderScene}
        variant="underline"
        size="md"
        tabBarClassName="border-b border-brand-default"
        tabFlex
      />
    </View>
  )
}
