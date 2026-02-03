import React, { useMemo, useRef } from 'react'
import { WebView } from 'react-native-webview'
import { ChartBase } from './chart-base'
import { MACDData } from './types'

export interface MACDChartProps {
  data: MACDData[]
  upColor?: string
  downColor?: string
  textColor?: string
  backgroundColor?: string
  showGrid?: boolean
  showTimeScale?: boolean
  showPriceScale?: boolean
  macdParams?: { fast: number; slow: number; signal: number }
  className?: string
}

export const MACDChart = React.forwardRef<WebView, MACDChartProps>(
  (
    {
      data,
      upColor = '#2ebc84',
      downColor = '#ff112f',
      textColor = '#9093ad',
      backgroundColor = 'transparent',
      showGrid = true,
      showTimeScale = true,
      showPriceScale = true,
      macdParams = { fast: 12, slow: 26, signal: 9 },
      className,
    },
    ref,
  ) => {
    const gridColor = 'rgba(57, 61, 96, 0.3)'
    const initialDataRef = useRef(data)

    const script = useMemo(() => {
      return `
      var container = document.getElementById('container');
      var rect = container.getBoundingClientRect();

      var chart = LightweightCharts.createChart(container, {
        width: rect.width,
        height: rect.height,
        layout: {
          textColor: '${textColor}',
          background: { type: 'solid', color: '${backgroundColor}' },
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          fontSize: 11,
        },
        grid: {
          vertLines: { color: '${showGrid ? gridColor : 'transparent'}' },
          horzLines: { color: '${showGrid ? gridColor : 'transparent'}' },
        },
        rightPriceScale: {
          visible: ${showPriceScale},
          borderVisible: false,
          autoScale: true,
          scaleMargins: { top: 0.1, bottom: 0.1 },
          ticksVisible: true,
          minimumWidth: 50,
        },
        timeScale: {
          visible: ${showTimeScale},
          borderVisible: false,
          timeVisible: true,
          barSpacing: 12,
          minBarSpacing: 8,
          rightOffset: 3,
          fixLeftEdge: false,
          fixRightEdge: true,
          tickMarkMaxCharacterLength: 5,
          ticksVisible: true,
          uniformDistribution: true,
        },
        crosshair: {
          mode: 0,
          vertLine: { visible: true },
          horzLine: { visible: true },
        },
      });

      // Histogram series for MACD histogram
      var histogramSeries = chart.addSeries(LightweightCharts.HistogramSeries, {
        priceFormat: { type: 'price', precision: 4, minMove: 0.0001 },
        priceLineVisible: false,
        lastValueVisible: false,
      });

      // MACD line (blue #3AA5DC)
      var macdLineSeries = chart.addSeries(LightweightCharts.LineSeries, {
        color: '#3AA5DC',
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });

      // Signal line / DIF (gold #D5B95C)
      var signalLineSeries = chart.addSeries(LightweightCharts.LineSeries, {
        color: '#D5B95C',
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });

      var macdData = ${JSON.stringify(initialDataRef.current)};
      if (macdData.length > 0) {
        var histogramData = macdData.map(function(d) {
          return { time: d.time, value: d.histogram, color: d.histogram >= 0 ? '${upColor}' : '${downColor}' };
        });
        var macdLineData = macdData.map(function(d) {
          return { time: d.time, value: d.macd };
        });
        var signalLineData = macdData.map(function(d) {
          return { time: d.time, value: d.signal };
        });
        histogramSeries.setData(histogramData);
        macdLineSeries.setData(macdLineData);
        signalLineSeries.setData(signalLineData);
      }

      if (macdData.length > 30) {
        chart.timeScale().fitContent();
      } else {
        chart.timeScale().scrollToRealTime();
      }

      new ResizeObserver(function(entries) {
        if (entries.length === 0 || entries[0].target !== container) { return; }
        var newRect = entries[0].contentRect;
        chart.applyOptions({ width: newRect.width, height: newRect.height });
      }).observe(container);

      window.ReactNativeWebView.postMessage('ready');
    `
    }, [
      upColor,
      downColor,
      textColor,
      backgroundColor,
      showGrid,
      showTimeScale,
      showPriceScale,
    ])

    return (
      <ChartBase
        ref={ref}
        script={script}
        className={className}
      />
    )
  },
)

MACDChart.displayName = 'MACDChart'
