import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

import { ChartData } from '@/components/trading-view'
import { request } from '@/utils/request'

// K线数据项类型
interface KlineItem {
  klineTime: number
  open: number
  high: number
  low: number
  close: number
}

// 请求参数类型
interface GetSymbolKlineParams {
  symbol: string
  klineType: string
  size: number
}

/**
 * 获取单个品种的 K线数据 queryOptions Hook
 */
export const useGetSymbolKlineOptions = (params: GetSymbolKlineParams) => {
  const getSymbolKlineOptions = queryOptions({
    queryKey: ['symbol-kline', params.symbol, params.klineType],
    placeholderData: keepPreviousData,
    queryFn: useCallback(async () => {
      const res = await request<API.Response<string[]>>('/api/trade-market/marketApi/kline/symbol/klineList', {
        params: {
          symbol: params.symbol,
          klineType: params.klineType,
          size: params.size,
          current: 1,
        },
      })

      if (res?.data) {
        // 解析 K线数据字符串 "时间,开,高,低,收"
        const klineData: KlineItem[] = res.data
          .map((item) => {
            const [klineTime, open, high, low, close] = item.split(',')
            return {
              klineTime: Number(klineTime),
              open: Number(open),
              high: Number(high),
              low: Number(low),
              close: Number(close),
            }
          })
          .reverse() // 反转数据，按时间从旧到新排序

        // 转换为图表数据格式
        const chartData: ChartData[] = klineData.map((item) => ({
          time: Math.floor(item.klineTime / 1000), // 转换为秒级时间戳
          value: item.close, // 使用收盘价
        }))

        return chartData
      }

      return []
    }, [params]),
    refetchInterval: 15 * 60 * 1000, // 15分钟轮询一次
    staleTime: 14 * 60 * 1000, // 14分钟内数据视为新鲜
    // 延长内存缓存时间，配合 MMKV 持久化缓存
    gcTime: 7 * 24 * 60 * 60 * 1000,
  })

  return { getSymbolKlineOptions }
}

/**
 * 使用品种 K线数据的 Hook
 */
export const useSymbolKline = (symbol: string) => {
  const { getSymbolKlineOptions } = useGetSymbolKlineOptions({
    symbol,
    klineType: '15min', // 15分钟间隔
    size: 100, // 固定100条
  })

  return useQuery(getSymbolKlineOptions)
}
