import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { request } from '@/v1/utils/request'

/**
 * 划转记录项
 */
export interface MoneyTransferVO {
  /** 主键 */
  id: number
  /** 交易账户ID */
  tradeAccountId: number
  /** 交易账户组ID */
  accountGroupId: number
  /** 类型: RECHARGE, WITHDRAW, TRANSFER */
  type: string
  /** 转移金额 */
  money: number
  /** 转移前账户余额 */
  preBalance: number
  /** 转移后账户余额 */
  postBalance: number
  /** 钱包地址 */
  address: string
  /** to交易账户ID */
  toAccountId: number
  /** to钱包地址 */
  toAddress: string
  /** 是否SWAP */
  isSwap: boolean
  /** SWAP到某链 */
  swapChain: string
  /** SWAP到某链的Token */
  swapChainToken: string
  /** 交易Hash */
  signature: string
  /** 交易费用 */
  fee: number
  /** 区块高度 */
  slot: number
  /** 状态: CREATE, SUCCESS, FAIL, RETURN */
  status: string
  /** 备注 */
  remark: string
  /** 创建时间 */
  createTime: string
  /** 修改时间 */
  updateTime: string
  /** 完成时间 */
  finishTime: string
}

/**
 * 划转列表请求参数
 */
export interface MoneyTransferListParams {
  /** 交易账户ID */
  tradeAccountId?: number | string
  /** 类型: RECHARGE, WITHDRAW, TRANSFER */
  type?: string
  /** 交易Hash */
  signature?: string
  /** 状态: CREATE, SUCCESS, FAIL, RETURN */
  status?: string
  /** 开始时间 YYYY-MM-DD */
  startDate?: string
  /** 结束时间 YYYY-MM-DD */
  endDate?: string
  /** 当前页 */
  current?: number
  /** 每页数量 */
  size?: number
}

/**
 * 获取划转列表
 */
export async function getMoneyTransferList(params: MoneyTransferListParams) {
  return request<API.Response<API.PageResult<MoneyTransferVO>>>('/api/trade-node/coreApi/money-transfer/list', {
    method: 'GET',
    params,
  })
}

/**
 * 划转列表 hook（无限滚动）
 */
export function useMoneyTransferList(
  params: Omit<MoneyTransferListParams, 'current' | 'size'>,
  pageSize: number = 10,
) {
  return useInfiniteQuery({
    queryKey: [
      'moneyTransferList',
      params.tradeAccountId,
      params.type,
      params.startDate,
      params.endDate,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getMoneyTransferList({
        ...params,
        current: pageParam,
        size: pageSize,
      })
      return res.data
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined
      const { current, pages } = lastPage
      return current < pages ? current + 1 : undefined
    },
    enabled: !!params.tradeAccountId,
    placeholderData: keepPreviousData,
    refetchOnMount: 'always',
  })
}
