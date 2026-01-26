import React, { useMemo } from 'react'
import { WebView } from 'react-native-webview'
import { useUniwind } from 'uniwind'
import { ChartBase } from './chart-base'
import { AreaChartProps } from './types'

export const AreaChart = React.forwardRef<WebView, AreaChartProps>(({
  data,
  lineColor = '#2962FF',
  topColor = 'transparent',
  bottomColor = 'transparent',
  className,
  style,
  textColor,
  lineWidth = 1,
  ...props
}, ref) => {
  const { theme } = useUniwind()
  const isDark = theme === 'dark'
  const actualTextColor = textColor || (isDark ? 'white' : 'black')

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

      const data = ${JSON.stringify(data)};
      areaSeries.setData(data);

      chart.timeScale().fitContent();

      new ResizeObserver(entries => {
        if (entries.length === 0 || entries[0].target !== container) { return; }
        const newRect = entries[0].contentRect;
        chart.applyOptions({ width: newRect.width, height: newRect.height });
        chart.timeScale().fitContent();
      }).observe(container);
    `
  }, [data, lineColor, topColor, bottomColor, actualTextColor, lineWidth])

  return (
    <ChartBase
      ref={ref}
      script={script}
      className={className}
      style={style}
      {...props}
    />
  )
})

AreaChart.displayName = 'AreaChart'
