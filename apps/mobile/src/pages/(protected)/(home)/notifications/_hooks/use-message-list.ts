import { useInfiniteQuery } from '@tanstack/react-query'
import { getMyMessageList } from '@/v1/services/message'

const PAGE_SIZE = 10

/**
 * 获取消息列表（支持无限加载）
 */
export function useMessageList(type: 'SINGLE' | 'GROUP') {
  return useInfiniteQuery({
    queryKey: ['message', 'list', type],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getMyMessageList({
        current: pageParam,
        size: PAGE_SIZE,
        type,
      })
      return response.data
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined
      const { current, pages } = lastPage
      return current < pages ? current + 1 : undefined
    },
    initialPageParam: 1,
  })
}
