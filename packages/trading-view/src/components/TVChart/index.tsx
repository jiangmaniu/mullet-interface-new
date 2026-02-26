import { useRouter } from 'next/router'
import {
  ChartStyle,
  LanguageCode,
  ThemeName,
  widget
} from 'public/static/charting_library'
import { useEffect, useMemo, useRef, useState } from 'react'

import { BridgeOutgoing, destroyBridge, initBridge, postToApp } from '@/bridge'
import { useConfig } from '@/context/configProvider'
import { useStores } from '@/context/mobxProvider'
import { ThemeConst } from '@/theme/theme'
import { STORAGE_GET_CHART_PROPS, STORAGE_REMOVE_CHART_PROPS } from '@/utils/storage'

import styles from './index.module.scss'
import { applyOverrides, ColorType, setChartStyleProperties } from './widgetMethods'
import getWidgetOpts from './widgetOpts'

export const TVChart = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartReady, setChartReady] = useState(false)
  const { ws } = useStores()
  const { isMobile, isIpad, isPc } = useConfig()
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

  const params = useMemo(
    () => ({ symbol, locale, theme, colorType, isMobile, bgGradientStartColor, bgGradientEndColor }),
    [symbol, locale, theme, colorType, isMobile, bgGradientStartColor, bgGradientEndColor]
  )

  useEffect(() => {
    // 切换主题删除本地缓存，避免切换主题颜色闪动
    const defaultBgColor = theme === 'dark' ? ThemeConst.black : ThemeConst.white
    if (theme && defaultBgColor !== STORAGE_GET_CHART_PROPS('paneProperties.background')) {
      STORAGE_REMOVE_CHART_PROPS()
    }

    // @fix 主题切换没有生效
    if (bgGradientStartColor) {
      localStorage.clear()
    }

    const datafeedParams = {
      setActiveSymbolInfo: ws.setActiveSymbolInfo,
      removeActiveSymbol: ws.removeActiveSymbol,
      getDataFeedBarCallback: ws.getDataFeedBarCallback
    }

    setChartReady(false)
    const widgetOptions = getWidgetOpts(params, chartContainerRef.current, datafeedParams)
    const tvWidget = new widget(widgetOptions)

    tvWidget.onChartReady(async () => {
      // 设置k线柱样式（涨跌色）
      setChartStyleProperties({ colorType, tvWidget })

      // 通过api设置overview样式（强制 solid 背景，防止默认 gradient）
      applyOverrides({
        tvWidget,
        chartType,
        bgColor: theme === 'dark' ? ThemeConst.black : ThemeConst.white,
        bgGradientStartColor,
        bgGradientEndColor
      })

      // 默认显示MACD指标在k线底部
      if (showBottomMACD === 1) {
        tvWidget.activeChart().createStudy(
          'MACD',
          false,
          false,
          { in_0: 12, in_1: 26, in_3: 'close', in_2: 9 },
          {
            showLabelsOnPriceScale: !!isPc
          }
        )
      }

      // 创建自定义的MA线
      tvWidget.activeChart().createStudy(
        'Customer Moving Average',
        false,
        false,
        {},
        {
          showLabelsOnPriceScale: false
        }
      )

      // 初始化 Bridge（替代旧的 window.TVBridge 全局挂载）
      initBridge(tvWidget)

      // 主题已就绪，显示图表
      setChartReady(true)

      // 通知宿主 App chart 已就绪
      postToApp({ type: BridgeOutgoing.ChartReady })
    })

    // 记录k线实例
    ws.setTvWidget(tvWidget)

    return () => {
      destroyBridge()
      tvWidget.remove()
    }
  }, [params, isPc, chartType, showBottomMACD, bgGradientStartColor, bgGradientEndColor])

  return (
    <div
      ref={chartContainerRef}
      className={styles.TVChartContainer}
      style={{ visibility: chartReady ? 'visible' : 'hidden' }}
    />
  )
}
