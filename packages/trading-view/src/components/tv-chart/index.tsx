import { runInAction } from 'mobx'
import { useRouter } from 'next/router'
import type { Bar } from 'public/static/charting_library'
import {
  ChartStyle,
  IChartingLibraryWidget,
  LanguageCode,
  ThemeName,
  widget
} from 'public/static/charting_library'
import { useEffect, useMemo, useRef, useState } from 'react'

import { BridgeOutgoing, destroyBridge, initBridge, onWatermark, postToApp } from '@/bridge'
import { symbolInfoArr } from '@/config/symbols'
import { KEY_TRADINGVIEW_CHART_PROPS } from '@/constants'
import { useConfig } from '@/context/config-provider'
import { useStores } from '@/context/mobx-provider'
import { createMt5Datafeed } from '@/core/datafeed/mt5/mt5-datafeed'
import { Mt5HistoryProvider } from '@/core/datafeed/mt5/mt5-history-provider'
import { createStaticSymbolProvider } from '@/core/symbols/static-provider'
import { ThemeConst } from '@/theme/theme'
import { STORAGE_GET_CHART_PROPS, STORAGE_REMOVE_CHART_PROPS } from '@/utils/storage'

import styles from './index.module.scss'
import { applyOverrides, ColorType, setChartStyleProperties } from './widget-methods'
import getWidgetOpts from './widget-opts'

// ── 辅助函数（纯逻辑，不依赖 React） ──

/** 清除 TradingView 相关的 localStorage 缓存，避免主题切换时颜色闪动 */
function clearChartCache(theme: ThemeName, bgGradientStartColor: string) {
  const defaultBgColor = theme === 'dark' ? ThemeConst.black : ThemeConst.white
  if (theme && defaultBgColor !== STORAGE_GET_CHART_PROPS('paneProperties.background')) {
    STORAGE_REMOVE_CHART_PROPS()
  }
  // 渐变背景模式下需要清除 TradingView 本地缓存，否则主题切换不生效
  if (bgGradientStartColor) {
    clearTradingViewStorage()
  }
}

/** 仅清除 TradingView 相关的 localStorage key，避免误删其他业务数据 */
function clearTradingViewStorage() {
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.startsWith('tradingview.') || key === KEY_TRADINGVIEW_CHART_PROPS)) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key))
}

/** 创建默认指标（MACD + 自定义 MA） */
function createDefaultStudies(tvWidget: IChartingLibraryWidget, showMACD: boolean, isPc: boolean) {
  const chart = tvWidget.activeChart()

  if (showMACD) {
    chart.createStudy(
      'MACD',
      false,
      false,
      { in_0: 12, in_1: 26, in_3: 'close', in_2: 9 },
      { showLabelsOnPriceScale: isPc }
    )
  }

  chart.createStudy(
    'Customer Moving Average',
    false,
    false,
    {},
    { showLabelsOnPriceScale: false }
  )
}

/** 注入水印到 K 线主面板 */
function injectWatermark(containerEl: HTMLDivElement | null, base64: string) {
  const iframe = containerEl?.querySelector<HTMLIFrameElement>('iframe')
  const doc = iframe?.contentDocument || document
  const mainPane = doc.querySelector<HTMLElement>('.chart-gui-wrapper')
  if (!mainPane) return

  const img = doc.createElement('img')
  img.src = base64
  img.style.cssText =
    'position:absolute;left:12px;bottom:12px;width:96px;height:26px;opacity:0.2;pointer-events:none;user-select:none;z-index:2;'
  mainPane.style.position = 'relative'
  mainPane.appendChild(img)
}

// ── 组件 ──

export const TVChart = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartReady, setChartReady] = useState(false)
  const { ws } = useStores()
  const { isMobile, isPc } = useConfig()
  const { query } = useRouter()

  // 将 query 参数提取为原始值，避免每次渲染产生新对象引用
  const symbol = (query.name || 'GOLD') as string
  const locale = (query.lang || 'en') as LanguageCode
  const theme = (query.theme || 'light') as ThemeName
  const colorType = Number(query.colorType || 1) as ColorType
  const bgGradientStartColor = query.bgGradientStartColor ? `#${query.bgGradientStartColor}` : ''
  const bgGradientEndColor = query.bgGradientEndColor ? `#${query.bgGradientEndColor}` : ''
  const showBottomMACD = Number(query.showBottomMACD || 1)
  const chartType = (query.chartType !== '' ? Number(query.chartType || 1) : 1) as ChartStyle
  const mode = (query.mode === 'simple' ? 'simple' : 'detail') as 'simple' | 'detail'

  const params = useMemo(
    () => ({ symbol, locale, theme, colorType, isMobile, bgGradientStartColor, bgGradientEndColor, mode }),
    [symbol, locale, theme, colorType, isMobile, bgGradientStartColor, bgGradientEndColor, mode]
  )

  useEffect(() => {
    clearChartCache(theme, bgGradientStartColor)

    const symbolProvider = createStaticSymbolProvider(symbolInfoArr)
    const historyProvider = new Mt5HistoryProvider()
    const datafeed = createMt5Datafeed(
      symbolProvider,
      {
        setActiveSymbolInfo: ws.setActiveSymbolInfo,
        getHistoryBars: (p, onResult) => {
          historyProvider.getBars(p, (bars: Bar[], meta: { noData?: boolean }) => {
            runInAction(() => {
              ws.loading = false
            })
            onResult(bars, meta)
          })
        },
        removeActiveSymbol: ws.removeActiveSymbol,
      },
      { isZh: locale === 'zh_TW' }
    )

    const container = chartContainerRef.current
    if (!container) return

    setChartReady(false)
    const widgetOptions = getWidgetOpts(params, container, datafeed)
    const tvWidget = new widget(widgetOptions)

    tvWidget.onChartReady(() => {
      setChartStyleProperties({ colorType, tvWidget })

      applyOverrides({
        tvWidget,
        chartType,
        bgColor: theme === 'dark' ? ThemeConst.black : ThemeConst.white,
        bgGradientStartColor,
        bgGradientEndColor
      })

      if (mode !== 'simple') {
        createDefaultStudies(tvWidget, showBottomMACD === 1, !!isPc)
      }

      initBridge(tvWidget)
      onWatermark((base64) => injectWatermark(chartContainerRef.current, base64))

      setChartReady(true)
      postToApp({ type: BridgeOutgoing.ChartReady })
    })

    ws.setTvWidget(tvWidget)

    return () => {
      destroyBridge()
      tvWidget.remove()
    }
  }, [params, isPc, chartType, showBottomMACD, mode])

  return (
    <div className={styles.TVChartContainer} style={{ visibility: chartReady ? 'visible' : 'hidden' }}>
      <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
