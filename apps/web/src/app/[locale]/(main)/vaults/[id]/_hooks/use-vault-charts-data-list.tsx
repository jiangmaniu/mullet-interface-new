import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'

import { useGetTWRRecordListApiOptions } from '@/services/api/trade-core/hooks/follow-manage/twr-record-list'
import { dayjs } from '@mullet/utils/dayjs'

export enum VaultChartsTimeIntervalEnum {
  HOUR24 = 'HOUR24',
  DAY30 = 'DAY30',
  ALL_TIME = 'ALL_TIME',
}

// 定义数据类型
interface VaultChartItem {
  twrTime: number
  twr: number
  profit: number
  navReturnRate: number
  twrTimeFormated?: string
}

// 生成24小时数据（60条，每半小时间隔）
const generate24HourData = (): VaultChartItem[] => {
  const data: VaultChartItem[] = []
  const baseTime = dayjs().subtract(24, 'hour').valueOf()
  let baseTWR = 0
  let baseProfit = 0
  let baseNavReturnRate = 1

  for (let i = 0; i < 60; i++) {
    const time = baseTime + i * 30 * 60 * 1000 // 每30分钟

    // 生成有正有负且反差较大的数据
    const sineWave = Math.sin(i * 0.15) * 2 // 增大正弦波幅度
    const randomShock = (Math.random() - 0.5) * 3 // 增大随机冲击
    const trendFactor = Math.sin(i * 0.05) * 1.5 // 添加趋势因子

    const combinedFactor = sineWave + randomShock + trendFactor
    const twrChange = combinedFactor * 0.008 // 增大TWR变化幅度
    const profitChange = combinedFactor * 500 + (Math.random() - 0.5) * 800 // 大幅增加利润变化范围

    baseTWR += twrChange
    baseProfit += profitChange
    baseNavReturnRate = 1 + baseTWR

    data.push({
      twrTime: time,
      twr: Number(baseTWR.toFixed(4)),
      profit: Number(baseProfit.toFixed(2)),
      navReturnRate: Number(baseNavReturnRate.toFixed(4)),
    })
  }

  return data
}

// 生成30天数据（30条，每日间隔）
const generate30DayData = (): VaultChartItem[] => {
  const data: VaultChartItem[] = []
  const baseTime = dayjs().subtract(30, 'day').valueOf()
  let baseTWR = 0
  let baseProfit = 0
  let baseNavReturnRate = 1

  for (let i = 0; i < 30; i++) {
    const time = baseTime + i * 24 * 60 * 60 * 1000 // 每天

    // 生成有正有负且反差更大的数据
    const sineWave = Math.sin(i * 0.25) * 3 // 增大正弦波幅度
    const randomShock = (Math.random() - 0.5) * 4 // 更大的随机冲击
    const cycleFactor = Math.cos(i * 0.1) * 2 // 添加余弦周期
    const volatility = Math.random() > 0.8 ? (Math.random() - 0.5) * 6 : 0 // 20%概率出现高波动

    const combinedFactor = sineWave + randomShock + cycleFactor + volatility
    const twrChange = combinedFactor * 0.015 // 增大TWR变化幅度
    const profitChange = combinedFactor * 800 + (Math.random() - 0.5) * 1200 // 大幅增加利润变化范围

    baseTWR += twrChange
    baseProfit += profitChange
    baseNavReturnRate = 1 + baseTWR

    data.push({
      twrTime: time,
      twr: Number(baseTWR.toFixed(4)),
      profit: Number(baseProfit.toFixed(2)),
      navReturnRate: Number(baseNavReturnRate.toFixed(4)),
    })
  }

  return data
}

// 生成全年数据（52条，每周间隔）
const generateAllTimeData = (): VaultChartItem[] => {
  const data: VaultChartItem[] = []
  const baseTime = dayjs().subtract(52, 'week').valueOf()
  let baseTWR = 0
  let baseProfit = 0
  let baseNavReturnRate = 1

  for (let i = 0; i < 52; i++) {
    const time = baseTime + i * 7 * 24 * 60 * 60 * 1000 // 每周

    // 生成有正有负且反差极大的长期数据
    const longTermTrend = Math.sin(i * 0.12) * 4 // 长期趋势波动
    const seasonalEffect = Math.cos(i * 0.3) * 2.5 // 季节性效应
    const marketShock = Math.random() > 0.9 ? (Math.random() - 0.5) * 8 : 0 // 10%概率市场震荡
    const randomWalk = (Math.random() - 0.5) * 5 // 随机游走
    const volatilityCluster = Math.random() > 0.85 ? (Math.random() - 0.5) * 10 : 0 // 15%概率波动聚集

    const combinedFactor = longTermTrend + seasonalEffect + marketShock + randomWalk + volatilityCluster
    const twrChange = combinedFactor * 0.025 // 大幅增加TWR变化
    const profitChange = combinedFactor * 1500 + (Math.random() - 0.5) * 2000 // 极大增加利润变化范围

    baseTWR += twrChange
    baseProfit += profitChange
    baseNavReturnRate = 1 + baseTWR

    data.push({
      twrTime: time,
      twr: Number(baseTWR.toFixed(4)),
      profit: Number(baseProfit.toFixed(2)),
      navReturnRate: Number(baseNavReturnRate.toFixed(4)),
    })
  }

  return data
}

export const useVaultChartsDataList = ({ timeInterval }: { timeInterval: VaultChartsTimeIntervalEnum }) => {
  const { vaultId } = useParams<{ vaultId: string }>()

  const { getTWRRecordListApiOptions } = useGetTWRRecordListApiOptions({
    followManageId: Number(vaultId),
    followTwrQueryScope: timeInterval,
  })

  const queryResult = useQuery({
    ...getTWRRecordListApiOptions,
    select: (rs) => {
      // 根据timeInterval生成对应的mock数据
      let data: VaultChartItem[] = []

      switch (timeInterval) {
        case VaultChartsTimeIntervalEnum.HOUR24:
          data = generate24HourData()
          break
        case VaultChartsTimeIntervalEnum.DAY30:
          data = generate30DayData()
          break
        case VaultChartsTimeIntervalEnum.ALL_TIME:
          data = generateAllTimeData()
          break
        default:
          data = []
      }

      return data.map((item) => {
        return {
          ...item,
          twrTimeFormated: dayjs(item.twrTime).format(
            timeInterval === VaultChartsTimeIntervalEnum.HOUR24
              ? 'HH:mm'
              : timeInterval === VaultChartsTimeIntervalEnum.DAY30
                ? 'MM-DD'
                : 'MM-DD',
          ),
        }
      })
    },
  })

  return { chartsData: queryResult.data, queryResult }
}
