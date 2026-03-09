import React, { useMemo } from 'react'
import { WebView } from 'react-native-webview'
import { useUniwind } from 'uniwind'
import { ChartBase } from './chart-base'
import { AreaChartProps } from './types'

// 数据序列化缓存，避免重复 JSON.stringify
const dataCache = new WeakMap<any[], string>()

const serializeData = (data: any[]): string => {
  if (dataCache.has(data)) {
    return dataCache.get(data)!
  }
  const serialized = JSON.stringify(data)
  dataCache.set(data, serialized)
  return serialized
}

// 深度比较函数，避免不必要的重渲染
const arePropsEqual = (prev: AreaChartProps, next: AreaChartProps): boolean => {
  // 比较基础属性
  if (
    prev.lineColor !== next.lineColor ||
    prev.topColor !== next.topColor ||
    prev.bottomColor !== next.bottomColor ||
    prev.lineWidth !== next.lineWidth ||
    prev.textColor !== next.textColor ||
    prev.className !== next.className
  ) {
    return false
  }

  // 比较数据数组（浅比较引用，深比较长度和内容）
  if (prev.data === next.data) return true
  if (prev.data.length !== next.data.length) return false

  // 如果数组为空，认为相等
  if (prev.data.length === 0 && next.data.length === 0) return true

  // 只比较首尾元素，避免遍历整个数组
  if (prev.data.length > 0 && next.data.length > 0) {
    const first = prev.data[0]
    const last = prev.data[prev.data.length - 1]
    const nextFirst = next.data[0]
    const nextLast = next.data[next.data.length - 1]

    if (
      first.time !== nextFirst.time ||
      first.value !== nextFirst.value ||
      last.time !== nextLast.time ||
      last.value !== nextLast.value
    ) {
      return false
    }
  }

  return true
}

function AreaChartComponent({
  data,
  lineColor = '#2962FF',
  topColor = 'transparent',
  bottomColor = 'transparent',
  className,
  style,
  textColor,
  lineWidth = 1,
  ref,
  ...props
}: AreaChartProps & { ref?: React.Ref<WebView> }) {
  const { theme } = useUniwind()
  const isDark = theme === 'dark'
  const actualTextColor = textColor || (isDark ? 'white' : 'black')

  // 预序列化数据，避免在 script 字符串中重复序列化
  const serializedData = useMemo(() => serializeData(data), [data])

  const script = useMemo(() => {
    return `
      const chartOptions = {
        layout: {
          textColor: '${actualTextColor}',
          background: { type: 'solid', color: 'transparent' },
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        },
        grid: {
          vertLines: { visible: false },
          horzLines: { visible: false },
        },
        rightPriceScale: {
          visible: false,
          borderVisible: false,
          scaleMargins: {
            top: 0,
            bottom: 0,
          },
        },
        leftPriceScale: {
          visible: false,
        },
        timeScale: {
          visible: false,
        },
        handleScroll: false,
        handleScale: false,
      };

      const container = document.getElementById('container');
      const chart = LightweightCharts.createChart(container, chartOptions);

      const areaSeries = chart.addSeries(LightweightCharts.AreaSeries, {
        lineColor: '${lineColor}',
        topColor: '${topColor}',
        bottomColor: '${bottomColor}',
        lineWidth: ${lineWidth},
        crosshairMarkerVisible: false,
        priceLineVisible: false,
      });

      const data = ${serializedData};
      areaSeries.setData(data);

      chart.timeScale().fitContent();

      new ResizeObserver(entries => {
        if (entries.length === 0 || entries[0].target !== container) { return; }
        const newRect = entries[0].contentRect;
        chart.applyOptions({ width: newRect.width, height: newRect.height });
        chart.timeScale().fitContent();
      }).observe(container);
    `
  }, [serializedData, lineColor, topColor, bottomColor, actualTextColor, lineWidth])

  return (
    <ChartBase
      ref={ref}
      script={script}
      className={className}
      style={style}
      {...props}
    />
  )
}

// 使用 React.memo 包裹，配合深度比较函数
export const AreaChart = React.memo(AreaChartComponent, arePropsEqual)
