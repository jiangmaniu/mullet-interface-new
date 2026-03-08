import { useQuery } from '@tanstack/react-query'

import { depositRequest } from '@/v1/utils/deposit-request'

/**
 * Solana 钱包余额信息 - 单个代币
 */
export interface SolanaTokenBalance {
  /** 代币符号 */
  symbol: string
  /** USD 估值 */
  usdValue: number
  /** 代币数量（字符串格式，保留精度） */
  amount: string
  /** 最小转账金额（USD） */
  minAmount: string
}

/**
 * Solana 钱包余额响应
 */
export interface SolanaWalletBalanceResponse {
  /** 钱包地址 */
  address: string
  /** SOL 当前价格（USD） */
  solPrice: number
  /** 总估值（USD） */
  totalUsdValue: number
  /** 是否余额不足（总估值 < minAmount） */
  insufficientBalance: boolean
  /** 余额不足提示信息（仅当 insufficientBalance 为 true 时返回） */
  insufficientBalanceMessage?: string
  /** 各代币余额数组 */
  balances: SolanaTokenBalance[]
  /** SOL 余额（字符串格式） */
  solBalance: string
  /** SOL 余额（Lamports） */
  solBalanceLamports: number
  /** USDC 余额（字符串格式） */
  usdcBalance: string
  /** USDC 余额（原始值） */
  usdcBalanceRaw: number
  /** USDT 余额（字符串格式） */
  usdtBalance: string
  /** USDT 余额（原始值） */
  usdtBalanceRaw: number
}

/**
 * 查询 Solana 钱包余额
 *
 * 实时查询 Solana 钱包余额（SOL + USDC + USDT），使用 Ankr RPC
 * SOL 价格来自 Binance SOLUSDC 实时报价
 *
 * @param address - 钱包地址（可选，不填则查当前 Bearer token 用户的钱包）
 * @param options - 查询配置选项
 * @param options.refetchInterval - 自动刷新间隔（毫秒），默认 30 秒
 * @param options.enabled - 是否启用查询，默认 true
 */
export function useSolanaWalletBalance(
  address?: string | null,
  options?: {
    refetchInterval?: number | false
    enabled?: boolean
  },
) {
  return useQuery({
    queryKey: ['solana-wallet', 'balance', address],
    queryFn: async () => {
      const response = await depositRequest<SolanaWalletBalanceResponse>('/api/solana-wallet/balance', {
        method: 'GET',
        params: address ? { address } : undefined,
      })

      // // 模拟数据
      // response.data.balances = response.data.balances.map((item) => {
      //   return { ...item, usdValue: 12.0, amount: '12.000000' }
      // })
      return response.data
    },
    // 数据新鲜度：30 秒内认为数据是新鲜的，不会自动重新请求
    staleTime: 30000,
    // 缓存时间：5 分钟后清除缓存
    gcTime: 5 * 60 * 1000,
    // 窗口聚焦时自动刷新（用户切回应用时更新余额）
    refetchOnWindowFocus: true,
    // 组件挂载时自动刷新
    refetchOnMount: true,
    // 自动轮询刷新间隔（默认 30 秒）
    refetchInterval: options?.refetchInterval ?? 30000,
    // 是否启用查询
    enabled: options?.enabled ?? true,
  })
}
