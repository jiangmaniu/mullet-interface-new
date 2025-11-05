import { echarts, EChartsOption } from '@/libs/echarts'
import { cloneDeep, merge } from 'lodash-es'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useVaultChartsDataList, VaultChartsTimeIntervalEnum } from '../../_hooks/use-vault-charts-data-list'
import { baseVaultChartsOption } from './base-option'

export const VaultPNLCharts = ({ timeInterval }: { timeInterval: VaultChartsTimeIntervalEnum }) => {
  const echartsRef = useRef<echarts.ECharts | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const {
    queryResult: { data: chartsOriginalData, isSuccess, isLoading }
  } = useVaultChartsDataList({ timeInterval })

  const chartsDataOptions = useMemo(() => {
    if (!chartsOriginalData) return

    const chartsData = chartsOriginalData || []
    const chartsDataFiltered = chartsData.filter((item) => item.profit !== undefined && item.twrTime !== undefined)
    const options = merge<EChartsOption, EChartsOption>(cloneDeep(baseVaultChartsOption), {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: chartsDataFiltered.map((item) => item.twrTimeFormated)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'PnL',
          data: chartsData?.map((item) => item.profit!)
        }
      ]
    })

    return options
  }, [chartsOriginalData, timeInterval])

  const setOption = useCallback(() => {
    if (chartsDataOptions && echartsRef.current) {
      echartsRef.current?.setOption(chartsDataOptions)
    }
  }, [chartsDataOptions])

  const initEchartsInstance = useCallback(() => {
    if (containerRef.current && !echartsRef.current) {
      echartsRef.current = echarts.init(containerRef.current, 'dark', { renderer: 'svg' })
    }
    return echartsRef.current
  }, [])

  useEffect(() => {
    initEchartsInstance()

    if (isLoading) {
      echartsRef.current?.showLoading('default', {
        text: '加载中...',
        color: '#EED94C', // 动画圆圈颜色
        textColor: '#EED94C', // 文本颜色
        maskColor: 'transparent' // 透明背景
      })
    } else {
      echartsRef.current?.hideLoading()
    }
  }, [isLoading, initEchartsInstance])

  useEffect(() => {
    if (!isLoading && isSuccess && containerRef.current && echartsRef.current) {
      setOption()
    }
  }, [setOption, isLoading, isSuccess])

  return <div ref={containerRef} className="w-full min-h-[210px] h-full"></div>
}
