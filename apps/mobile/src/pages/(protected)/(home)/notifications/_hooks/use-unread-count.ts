import { useQuery } from '@tanstack/react-query'

import { getUnReadMessageCount } from '@/services/message'

/**
 * 获取未读消息数量
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: ['message', 'unread-count'],
    queryFn: async () => {
      const res = await getUnReadMessageCount()
      return (res?.data as number) || 0
    },
    refetchInterval: 30000, // 每30秒自动刷新
  })
}
