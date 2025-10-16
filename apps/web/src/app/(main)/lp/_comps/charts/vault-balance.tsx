import { echarts, EChartsOption } from '@/libs/echarts'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'

export const VaultBalanceCharts = () => {
  const echartsRef = useRef<echarts.ECharts | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['vault-pnl-charts'],
    queryFn: () => {
      return new Promise<EChartsOption>((resolve) => {
        setTimeout(() => {
          resolve({
            backgroundColor: 'transparent',
            tooltip: {
              trigger: 'axis'
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              top: '3%',
              containLabel: true
            },
            xAxis: {
              type: 'category',
              data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            yAxis: {
              type: 'value'
            },
            series: [
              {
                name: 'Step Start',
                type: 'line',
                step: 'start',
                data: [120, 132, 101, 134, 90, 230, 210]
              }
            ]
          })
        }, 5000)
      })
    }
  })

  const setOption = useCallback(() => {
    if (data && echartsRef.current) {
      echartsRef.current?.setOption(data)
    }
  }, [data])

  const initEchartsInstance = useCallback(() => {
    if (containerRef.current && !echartsRef.current) {
      echartsRef.current = echarts.init(containerRef.current, 'dark', { renderer: 'svg' })
    }
    return echartsRef.current
  }, [])

  useEffect(() => {
    initEchartsInstance()

    if (isLoading) {
      echartsRef.current?.showLoading()
    } else {
      echartsRef.current?.hideLoading()
    }
  }, [isLoading])

  useEffect(() => {
    if (!isLoading && isSuccess && containerRef.current && echartsRef.current) {
      setOption()
    }
  }, [setOption, isLoading, isSuccess])

  return <div ref={containerRef} className="w-full min-h-[210px] h-full"></div>
}
