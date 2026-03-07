import { useQuery } from '@tanstack/react-query'
import { getAccountGroupList } from '@/v1/services/tradeCore/accountGroup'
import { AccountGroup } from '@/v1/services/tradeCore/accountGroup/typings'

/**
 * 获取账户组列表的 React Query Hook
 */
export function useAccountGroupList() {
  return useQuery({
    queryKey: ['accountGroupList'],
    queryFn: async () => {
      const res = await getAccountGroupList()
      return (res?.data || []) as AccountGroup.AccountGroupItem[]
    },
    staleTime: 30 * 1000, // 30秒内数据视为新鲜，不会重新请求
    refetchOnMount: 'always', // 挂载时总是刷新
  })
}
