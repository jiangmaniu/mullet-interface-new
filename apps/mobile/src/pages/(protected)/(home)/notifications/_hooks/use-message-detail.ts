import { useQuery } from '@tanstack/react-query'
import { getMyMessageInfo } from '@/v1/services/message'

/**
 * 获取消息详情
 */
export function useMessageDetail(id: string) {
  return useQuery({
    queryKey: ['message', 'detail', id],
    queryFn: async () => {
      const response = await getMyMessageInfo({ id })
      return response.data
    },
    enabled: !!id,
  })
}
