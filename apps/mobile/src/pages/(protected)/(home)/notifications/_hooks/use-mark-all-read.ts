import { useMutation, useQueryClient } from '@tanstack/react-query'
import { readAllMessage } from '@/v1/services/message'

/**
 * 标记所有消息为已读
 */
export function useMarkAllRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: readAllMessage,
    onSuccess: () => {
      // 刷新未读数量
      queryClient.invalidateQueries({ queryKey: ['message', 'unread-count'] })
      // 刷新消息列表
      queryClient.invalidateQueries({ queryKey: ['message', 'list'] })
    },
  })
}
