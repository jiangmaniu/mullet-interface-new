'use client'

import ReactEChartsCore from 'echarts-for-react/lib/core'
import { useMemo } from 'react'
import { LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TitleComponent, ToolboxComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { cloneDeep, merge } from 'lodash-es'
import type { ComposeOption } from 'echarts'
import type { EChartsReactProps } from 'echarts-for-react'
import type { LineSeriesOption } from 'echarts/charts'
import type {
  GridComponentOption,
  LegendComponentOption,
  TitleComponentOption,
  ToolboxComponentOption,
  TooltipComponentOption,
} from 'echarts/components'

import { cn } from '../lib/utils'

type EChartsProps = Omit<EChartsReactProps, 'echarts' | 'option'> & {
  option?: EChartsOption
}

export type EChartsOption = ComposeOption<
  | TitleComponentOption
  | ToolboxComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | LegendComponentOption
  | LineSeriesOption
>

echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
])

const EChartOption: echarts.EChartsCoreOption = {
  series: [
    {
      type: 'line',
      showSymbol: false,
      symbol: 'none',
      smooth: true,
      lineStyle: {
        color: '#ffffff',
      },
    },
  ],
  tooltip: {
    confine: true,
    trigger: 'axis',
    backgroundColor: '#23262f',
    borderColor: '#23262f',
    borderRadius: 8,
    padding: 10,
    textStyle: {
      fontSize: 12,
      color: '#ffffff',
    },
  },
  xAxis: {
    type: 'category',
    axisTick: {
      lineStyle: {
        color: '#ffffff',
      },
    },
    axisLine: {
      lineStyle: {
        color: '#ffffff',
      },
    },
    axisLabel: {
      interval: 0,
      color: '#ffffff',
    },
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      color: '#ffffff',
    },
    splitLine: {
      lineStyle: {
        type: 'dashed',
        color: 'rgba(81, 8, 8, 0.3)',
      },
    },
  },
  grid: {
    top: '20px',
    left: '16px',
    right: '16px',
    bottom: '20px',
    containLabel: true,
  },
}

export { echarts }

export function ECharts({ option, className, ...props }: EChartsProps) {
  const mergedOption = useMemo(() => merge(cloneDeep(EChartOption), option), [option])

  return <ReactEChartsCore echarts={echarts} option={mergedOption} className={cn('!h-full', className)} {...props} />
}
