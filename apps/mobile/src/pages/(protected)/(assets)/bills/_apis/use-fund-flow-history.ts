import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { depositRequest } from '@/v1/utils/deposit-request'
import { DepositEventTypeEnum } from '@/options/deposit/event'

/**
 * 资金流水历史-参数
 */
export interface FundFlowHistoryParams {
  /** 用户 ID */
  userId: string
  /** 每页条数（默认 50，最大 200） */
  limit?: number
  /** 分页偏移（默认 0） */
  offset?: number
  /** 逗号分隔的事件类型 */
  eventType?: string
  /** 按 token 过滤，如 USDC（大小写不敏感） */
  token?: string
  /** 按链过滤，如 SOL / ETH（大小写不敏感） */
  chain?: string
  /** 开始时间，格式 YYYY-MM-DD HH:MM:SS */
  startTime?: string
  /** 结束时间，格式 YYYY-MM-DD HH:MM:SS */
  endTime?: string
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
  /** 自增主键 */
  id: number
  /** 唯一事件 ID（UUID） */
  eventId: string
  /** 用户 ID */
  userId: string
  /** 事件类型 */
  eventType: DepositEventTypeEnum
  /** 关联入金订单 ID */
  depositId: string | null
  /** 关联出金订单 ID */
  withdrawalId: string | null
  /** 关联跨链订单 ID */
  bridgeOrderId: string | null
  /** 关联 Swap 订单 ID */
  swapOrderId: string | null
  /** 链标识，如 SOL / ETH */
  chain: string | null
  /** 代币符号，如 USDC */
  token: string | null
  /** 本次事件涉及金额（USDC，人类可读小数） */
  amount: string | null
  /** 操作前余额快照 */
  balanceBefore: string | null
  /** 操作后余额快照 */
  balanceAfter: string | null
  /** 链上交易哈希 */
  txHash: string | null
  /** JSON 字符串，附加信息（如错误原因、跨链详情） */
  metadata: string | null
  /** 事件创建时间 */
  createdAt: string
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
export function useFundFlowHistory(params: Omit<FundFlowHistoryParams, 'limit' | 'offset'>, pageSize: number = 50) {
  return useInfiniteQuery({
    queryKey: ['fundFlowHistory', params.userId, params.eventType, params.startTime, params.endTime, params.token, params.chain],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await getFundFlowHistory({
        ...params,
        offset: pageParam,
        limit: pageSize,
      })
      // depositRequest 返回 { success, code, msg, data }
      // data 字段包含 { data: [], pagination: {} }
      return res.data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage?.pagination) return undefined
      const { hasMore, offset, limit } = lastPage.pagination
      // 下一页的 offset = 当前 offset + limit
      return hasMore ? offset + limit : undefined
    },
    enabled: !!params.userId,
    // 保留旧数据，queryKey 变化时先展示旧数据再后台刷新
    placeholderData: keepPreviousData,
    // 组件重新挂载时始终后台刷新最新数据
    refetchOnMount: 'always',
  })
}
