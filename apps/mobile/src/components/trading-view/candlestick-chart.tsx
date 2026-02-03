import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { WebView, WebViewMessageEvent } from 'react-native-webview'
import { ChartBase } from './chart-base'
import { CandlestickChartProps } from './types'

export const CandlestickChart = React.forwardRef<WebView, CandlestickChartProps>(
  (
    {
      data,
      liveCandle,
      upColor = '#2ebc84',
      downColor = '#ff112f',
      wickUpColor,
      wickDownColor,
      borderUpColor,
      borderDownColor,
      textColor = '#9093ad',
      backgroundColor = 'transparent',
      showGrid = true,
      showTimeScale = true,
      showPriceScale = true,
      watermarkImage,
      ma5Data,
      ma10Data,
      ma30Data,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const actualWickUpColor = wickUpColor || upColor
    const actualWickDownColor = wickDownColor || downColor
    const actualBorderUpColor = borderUpColor || upColor
    const actualBorderDownColor = borderDownColor || downColor

    const gridColor = 'rgba(57, 61, 96, 0.3)'

    const webViewRef = useRef<WebView>(null)
    const isReadyRef = useRef(false)
    const initialDataRef = useRef(data)
    const ma5DataRef = useRef(ma5Data)
    const ma10DataRef = useRef(ma10Data)
    const ma30DataRef = useRef(ma30Data)

    const setRef = useCallback(
      (node: WebView | null) => {
        webViewRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) (ref as React.MutableRefObject<WebView | null>).current = node
      },
      [ref],
    )

    const script = useMemo(() => {
      const watermarkHtml = watermarkImage
        ? `<img src="${watermarkImage}" style="position:absolute;left:12px;bottom:35px;pointer-events:none;z-index:0;opacity:0.8;" />`
        : ''
      return `
      var container = document.getElementById('container');
      ${watermarkImage ? `container.insertAdjacentHTML('afterbegin', '${watermarkHtml}');` : ''}
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
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
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

      var series = chart.addSeries(LightweightCharts.CandlestickSeries, {
        upColor: '${upColor}',
        downColor: '${downColor}',
        borderUpColor: '${actualBorderUpColor}',
        borderDownColor: '${actualBorderDownColor}',
        wickUpColor: '${actualWickUpColor}',
        wickDownColor: '${actualWickDownColor}',
        lastValueVisible: true,
        priceLineVisible: true,
      });

      var initialData = ${JSON.stringify(initialDataRef.current)};
      series.setData(initialData);

      // MA5 line (purple #9754CB)
      var ma5Data = ${JSON.stringify(ma5DataRef.current || [])};
      if (ma5Data.length > 0) {
        var ma5Series = chart.addSeries(LightweightCharts.LineSeries, {
          color: '#9754CB',
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        });
        ma5Series.setData(ma5Data);
      }

      // MA10 line (gold #D5B95C)
      var ma10Data = ${JSON.stringify(ma10DataRef.current || [])};
      if (ma10Data.length > 0) {
        var ma10Series = chart.addSeries(LightweightCharts.LineSeries, {
          color: '#D5B95C',
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        });
        ma10Series.setData(ma10Data);
      }

      // MA30 line (blue #3AA5DC)
      var ma30Data = ${JSON.stringify(ma30DataRef.current || [])};
      if (ma30Data.length > 0) {
        var ma30Series = chart.addSeries(LightweightCharts.LineSeries, {
          color: '#3AA5DC',
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        });
        ma30Series.setData(ma30Data);
      }

      // 数据少时保持固定 barSpacing，不拉伸；数据多时 fitContent
      if (initialData.length > 30) {
        chart.timeScale().fitContent();
      } else {
        chart.timeScale().scrollToRealTime();
      }

      window.updateCandle = function(candle) {
        series.update(candle);
      };

      window.updateChartData = function(newData) {
        series.setData(newData);
        if (newData.length > 30) {
          chart.timeScale().fitContent();
        } else {
          chart.timeScale().scrollToRealTime();
        }
      };

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
      actualWickUpColor,
      actualWickDownColor,
      actualBorderUpColor,
      actualBorderDownColor,
      textColor,
      backgroundColor,
      showGrid,
      showTimeScale,
      showPriceScale,
      watermarkImage,
    ])

    const handleMessage = useCallback((event: WebViewMessageEvent) => {
      if (event.nativeEvent.data === 'ready') {
        isReadyRef.current = true
      }
    }, [])

    useEffect(() => {
      if (isReadyRef.current && webViewRef.current && liveCandle) {
        webViewRef.current.injectJavaScript(
          `window.updateCandle(${JSON.stringify(liveCandle)}); true;`,
        )
      }
    }, [liveCandle])

    return (
      <ChartBase
        ref={setRef}
        script={script}
        className={className}
        style={style}
        onMessage={handleMessage}
        {...props}
      />
    )
  },
)

CandlestickChart.displayName = 'CandlestickChart'
