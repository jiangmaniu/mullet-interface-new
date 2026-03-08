import { useQuery } from '@tanstack/react-query'

import { depositRequest } from '@/v1/utils/deposit-request'
import { BNumber } from '@mullet/utils/number'

/**
 * Swap 询价响应
 */
export interface SwapQuoteResponse {
  /** 来源 Token */
  fromToken: string
  /** 目标 Token */
  toToken: string
  /** 输入金额（最小单位） */
  inputAmount: string
  /** 预期输出金额（最小单位） */
  expectedOutputAmount: string
  /** 最小输出金额（最小单位） */
  minOutputAmount: string
  /** 价格影响百分比 */
  priceImpactPct: number | null
  /** 滑点 BPS */
  slippageBps: number
  /** 滑点百分比 */
  slippagePercent: number
  /** 使用的工具（如 Jupiter） */
  tool: string
  /** 预估 Gas 费用（USD） */
  estimatedGasUSD: string
  /** 预估服务费（USD） */
  estimatedFeeUSD: string
  /** 序列化的交易（base64，仅当提供 fromAddress 时返回） */
  serializedTx: string | null
  /** LiFi 原始响应 */
  lifiQuote?: any
}

/**
 * Swap 询价请求参数
 */
export interface SwapQuoteParams {
  /** 来源 Token 符号（如 USDC、USDT、SOL、JUP） */
  fromToken: string
  /** 目标 Token 符号（同上） */
  toToken: string
  /** 发送数量（最小单位，USDC 为 6 位：10000000 = $10） */
  amount: string
  /** 发起地址（可选，提供时返回 serializedTx） */
  fromAddress?: string
  /** 滑点 BPS（默认 50，即 0.5%） */
  slippageBps?: number
}

/**
 * 查询 Swap 询价
 *
 * LiFi 询价接口（前端无水印价格查询，无需认证）
 *
 * @param params - 询价参数
 * @param options - 查询配置选项
 * @param options.enabled - 是否启用查询，默认 true
 * @param options.refetchInterval - 自动刷新间隔（毫秒），默认 30 秒
 */
export function useSwapQuote(
  params: SwapQuoteParams | null,
  options?: {
    enabled?: boolean
    refetchInterval?: number | false
  },
) {
  return useQuery({
    queryKey: ['swap', 'quote', params],
    queryFn: async () => {
      if (!params) {
        throw new Error('Swap quote params are required')
      }

      const response = await depositRequest<SwapQuoteResponse>('/api/swap/quote', {
        method: 'POST',
        data: params,
      })
      return response.data
    },
    // 数据新鲜度：5 秒内认为数据是新鲜的
    staleTime: 5000,
    // 缓存时间：1 分钟后清除缓存
    gcTime: 60 * 1000,
    // 窗口聚焦时不自动刷新（避免频繁询价）
    refetchOnWindowFocus: false,
    // 组件挂载时自动刷新
    refetchOnMount: true,
    // 自动轮询刷新间隔（默认 30 秒）
    refetchInterval: options?.refetchInterval ?? 30000,
    // 是否启用查询
    enabled: (options?.enabled ?? true) && !!params && !!params.amount && BNumber.from(params.amount).gt(0),
  })
}
