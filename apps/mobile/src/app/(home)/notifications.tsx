import { View, ScrollView } from 'react-native'
import { useMemo, useCallback } from 'react'
import { Trans } from '@lingui/react/macro'
import { Route } from 'react-native-tab-view'

import { Text } from '@/components/ui/text'
import { SwipeableTabs } from '@/components/ui/tabs'
import { ScreenHeader } from '@/components/ui/screen-header'
import { EmptyState } from '@/components/ui/empty-state'

// Mock data
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Deposit Successful',
    description:
      "You've successfully deposited 150 USD to your account. You can now start trading!",
    time: '2025-08-18 09:10:03',
    unread: true,
  },
  {
    id: '2',
    title: 'Deposit Successful',
    description:
      "You've successfully deposited 150 USD to your account. You can now start trading!",
    time: '2025-08-18 09:10:03',
    unread: true,
  },
  {
    id: '3',
    title: 'Deposit Successful',
    description:
      "You've successfully deposited 150 USD to your account. You can now start trading!",
    time: '2025-08-18 09:10:03',
    unread: true,
  },
  {
    id: '4',
    title: 'Deposit Successful',
    description:
      "You've successfully deposited 150 USD to your account. You can now start trading!",
    time: '2025-08-18 09:10:03',
    unread: true,
  },
]

// ============ NotificationItem ============
interface NotificationItemProps {
  title: string
  description: string
  time: string
  unread?: boolean
}

function NotificationItem({ title, description, time, unread }: NotificationItemProps) {
  return (
    <View className="gap-xs p-xl">
      <View className="flex-row items-center justify-between">
        <Text className="text-paragraph-p2 text-content-1 flex-1">{title}</Text>
        {unread && <View className="size-2 rounded-full bg-status-danger ml-medium" />}
      </View>
      <Text className="text-paragraph-p3 text-content-4">{description}</Text>
      <Text className="text-paragraph-p3 text-content-4">{time}</Text>
    </View>
  )
}

// ============ NotificationList ============
function NotificationList({ items }: { items: typeof MOCK_NOTIFICATIONS }) {
  if (items.length === 0) {
    return (
      <View className='py-[96px]'>
        <EmptyState message={< Trans > 暂无内容</Trans >} iconWidth={107} iconHeight={76} className='gap-2xl' />
      </View>
    )
  }
  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {items.map((item) => (
        <NotificationItem
          key={item.id}
          title={item.title}
          description={item.description}
          time={item.time}
          unread={item.unread}
        />
      ))}
    </ScrollView>
  )
}

// ============ Main Page ============
export default function NotificationsPage() {
  const routes = useMemo<Route[]>(() => [
    { key: 'notifications', title: '通知' },
    { key: 'announcements', title: '公告' },
  ], [])

  const renderScene = useCallback(({ route }: { route: Route }) => {
    if (route.key === 'notifications') {
      return <NotificationList items={MOCK_NOTIFICATIONS} />
    }
    // 公告 tab - 空状态
    return <NotificationList items={[]} />
  }, [])

  return (
    <View className="flex-1 bg-secondary">
      <ScreenHeader content="消息通知" />
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