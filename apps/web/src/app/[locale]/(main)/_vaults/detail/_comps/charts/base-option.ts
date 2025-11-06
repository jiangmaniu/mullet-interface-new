import { EChartsOption } from "@/libs/echarts"

export const baseVaultChartsOption: EChartsOption = {
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
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
    axisLabel: {
      color: '#767783',
    },
    axisLine: {
      lineStyle: {
        type: 'dashed',
        color: 'rgba(216, 216, 216, 0.2)',
      },
    }
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      color: '#767783',
    },
    splitLine: {
      lineStyle: {
        type: 'dashed',
        color: 'rgba(216, 216, 216, 0.2)',
      },
    },
  },
  series: [
    {
      type: 'line',
      step: 'start',
      lineStyle: {
        color: '#2EBC84'
      },
      itemStyle: {
        color: '#2EBC84'
      },
      showSymbol: false,
      emphasis: {
        focus: 'series',
        scale: true // 鼠标经过时放大点
      }
    }
  ]
}
