import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { depositRequest } from '@/v1/utils/deposit-request'

/**
 * 资金流水历史-参数
 */
export interface FundFlowHistoryParams {
  /** 用户 ID */
  userId: string
  /** 交易账户 ID */
  tradeAccountId?: string
  /** 类型：deposit / withdrawal */
  type?: 'deposit' | 'withdrawal'
  /** 当前页（默认 1） */
  page?: number
  /** 每页条数（默认 20） */
  limit?: number
}

/**
 * 资金流水历史-响应数据（API 返回的 data 字段内容）
 */
export interface FundFlowHistoryData {
  data: FundFlowHistoryItem[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

/**
 * 资金流水历史-列表项
 */
export interface FundFlowHistoryItem {
  id: number
  userId: string
  tradeAccountId: string
  type: 'deposit' | 'withdrawal'
  amount: number
  status: string
  createTime: string
  remark?: string
}

/**
 * 获取资金流水历史（充值/提现）
 */
export async function getFundFlowHistory(params: FundFlowHistoryParams) {
  return depositRequest<FundFlowHistoryData>('/api/fund-flow/history', {
    method: 'GET',
    params,
  })
}

/**
 * 使用资金流水历史的 hook（无限滚动）
 */
export function useFundFlowHistory(params: Omit<FundFlowHistoryParams, 'page' | 'limit'>, pageSize: number = 20) {
  return useInfiniteQuery({
    queryKey: ['fundFlowHistory', params.userId, params.tradeAccountId, params.type],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getFundFlowHistory({
        ...params,
        page: pageParam,
        limit: pageSize,
      })
      // depositRequest 返回 { success, code, msg, data }
      // data 字段包含 { data: [], pagination: {} }
      return res.data
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage?.pagination) return undefined
      const { hasMore } = lastPage.pagination
      // 下一页 = 当前已加载的页数 + 1
      return hasMore ? allPages.length + 1 : undefined
    },
    enabled: !!params.userId,
    // 保留旧数据，queryKey 变化时先展示旧数据再后台刷新
    placeholderData: keepPreviousData,
    // 组件重新挂载时始终后台刷新最新数据
    refetchOnMount: 'always',
  })
}
