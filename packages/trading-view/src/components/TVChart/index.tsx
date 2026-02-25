import { useRouter } from 'next/router'
import {
  ChartingLibraryWidgetOptions,
  ChartStyle,
  LanguageCode,
  ResolutionString,
  ThemeName,
  TickMarkType,
  widget
} from 'public/static/charting_library'
import { useEffect, useRef, useState } from 'react'

import { useConfig } from '@/context/configProvider'
import { useStores } from '@/context/mobxProvider'
import { ThemeConst } from '@/theme/theme'
import { STORAGE_GET_CHART_PROPS, STORAGE_REMOVE_CHART_PROPS, STORAGE_SET_CHART_PROPS } from '@/utils/storage'

import styles from './index.module.scss'
import { applyOverrides, ColorType, setChartStyleProperties, setCSSCustomProperty } from './widgetMethods'
import getWidgetOpts from './widgetOpts'

export const TVChart = () => {
  const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>
  const { ws } = useStores()
  const { isMobile, isIpad, isPc } = useConfig()
  const { query } = useRouter()

  const datafeedParams = {
    setActiveSymbolInfo: ws.setActiveSymbolInfo, // 记录当前的symbol
    removeActiveSymbol: ws.removeActiveSymbol, // 取消订阅移除symbol
    getDataFeedBarCallback: ws.getDataFeedBarCallback // 获取k线柱数据回调
  }

  const params = {
    symbol: (query.name || 'GOLD') as string, // 品种名称
    locale: (query.lang || 'en') as LanguageCode, // 英文 en 繁体zh_TW 印尼id_ID
    theme: (query.theme || 'light') as ThemeName,
    colorType: Number(query.colorType || 1) as ColorType, // 1绿涨红跌 2红涨绿跌
    isMobile,
    bgGradientStartColor: query.bgGradientStartColor ? `#${query.bgGradientStartColor}` : '', // 背景渐变色
    bgGradientEndColor: query.bgGradientEndColor ? `#${query.bgGradientEndColor}` : ''
  }

  useEffect(() => {
    const showBottomMACD = Number(query.showBottomMACD || 1) // 1 展示 2 隐藏
    const chartType = (query.chartType !== '' ? Number(query.chartType || 1) : 1) as ChartStyle
    const theme = params.theme

    // 切换主题删除本地缓存，避免切换主题颜色闪动
    const defaultBgColor = theme === 'dark' ? ThemeConst.black : ThemeConst.white
    if (theme && defaultBgColor !== STORAGE_GET_CHART_PROPS('paneProperties.background')) {
      STORAGE_REMOVE_CHART_PROPS()
    }

    // @fix 主题切换没有生效
    if (params.bgGradientStartColor) {
      localStorage.clear()
    }

    const widgetOptions = getWidgetOpts(params, chartContainerRef.current, datafeedParams)
    const tvWidget = new widget(widgetOptions)

    tvWidget.onChartReady(async () => {
      // 动态设置css变量
      setCSSCustomProperty({ tvWidget, theme })

      // 默认显示MACD指标在k线底部
      if (showBottomMACD === 1) {
        tvWidget.activeChart().createStudy(
          'MACD',
          false,
          false,
          { in_0: 12, in_1: 26, in_3: 'close', in_2: 9 },
          {
            // 修改MACD柱状图颜色
            'Histogram.color.3': 'rgba(197, 71, 71, 0.7188)',
            // 查看localstorage获取默认设置的属性
            showLabelsOnPriceScale: !!isPc // 关闭 在右侧价格刻度上展示value值
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
          //   showLastPriceLine: false, // 最可能的选项
          //   showLastPrice: false, // 另一种可能
          //   showLastPriceAndPercentageLine: false,
          //   showPriceLine: false, // 如果是针对特
          //   //   'scalesProperties.showSeriesLastValue': false, // 如果是针对特
          //   showLegendValues: false, // 展示价格线
          showLabelsOnPriceScale: false // 关闭 在右侧价格刻度上展示value值
        }
      )

      // 当您的网站主题发生变化时，您应该切换图表的主题。为此，请使用 changeTheme 方法动态更改主题
      // theme 值存储在图表的配置中。因此，如果恢复具有深色主题的图表，您可能会在浅色主题中看到黑色图表背景。在这种情况下，您应该使用 changeTheme 方法再次应用主题
      if (query.theme && !params.bgGradientStartColor) {
        await tvWidget.changeTheme(theme)
      }

      // 设置k线柱样式
      setChartStyleProperties({ colorType: params.colorType, tvWidget })

      // 通过api设置overview样式
      applyOverrides({
        tvWidget,
        chartType,
        bgGradientStartColor: params.bgGradientStartColor,
        bgGradientEndColor: params.bgGradientEndColor
      })

      // tvWidget.headerReady().then(() => {
      // 	const button = tvWidget.createButton();
      // 	button.setAttribute("title", "Click to show a notification popup");
      // 	button.classList.add("apply-common-tooltip");
      // 	button.addEventListener("click", () =>
      // 		tvWidget.showNoticeDialog({
      // 			title: "Notification",
      // 			body: "TradingView Charting Library API works correctly",
      // 			callback: () => {
      // 				console.log("Noticed!");
      // 			},
      // 		})
      // 	);

      // 	button.innerHTML = "Check API";
      // });

      // 通过api动态修改图表样式类型，不需要在widgetOptions里面设置
      // tvWidget.applyOverrides({
      // 	'mainSeriesProperties.style': 2
      // }

      // const chart = tvWidget.chart()
      // // 设置图表类型（比如分时图和常规的蜡烛图的类型就不一样）
      // this.chart.setChartType(chartType)
      // // 切换 Symbol
      // this.chart.setSymbol(symbol, callback)
      // // 切换 Resolution
      // this.chart.setResolution(resolution, callback)
    })
    // tvWidget.headerReady().then(() => {
    //   // 创建头部左侧设置按钮 https://www.tradingview.com/charting-library-docs/latest/ui_elements/Toolbars
    //   const button = tvWidget.createButton()
    //   button.setAttribute('title', 'Chart Settings')
    //   button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="26" height="26"><g fill="currentColor" fill-rule="evenodd"><path fill-rule="nonzero" d="M14 17a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0-1a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path><path d="M5.005 16A1.003 1.003 0 0 1 4 14.992v-1.984A.998.998 0 0 1 5 12h1.252a7.87 7.87 0 0 1 .853-2.06l-.919-.925c-.356-.397-.348-1 .03-1.379l1.42-1.42a1 1 0 0 1 1.416.007l.889.882A7.96 7.96 0 0 1 12 6.253V5c0-.514.46-1 1-1h2c.557 0 1 .44 1 1v1.253a7.96 7.96 0 0 1 2.06.852l.888-.882a1 1 0 0 1 1.416-.006l1.42 1.42a.999.999 0 0 1 .029 1.377s-.4.406-.918.926a7.87 7.87 0 0 1 .853 2.06H23c.557 0 1 .447 1 1.008v1.984A.998.998 0 0 1 23 16h-1.252a7.87 7.87 0 0 1-.853 2.06l.882.888a1 1 0 0 1 .006 1.416l-1.42 1.42a1 1 0 0 1-1.415-.007l-.889-.882a7.96 7.96 0 0 1-2.059.852v1.248c0 .56-.45 1.005-1.008 1.005h-1.984A1.004 1.004 0 0 1 12 22.995v-1.248a7.96 7.96 0 0 1-2.06-.852l-.888.882a1 1 0 0 1-1.416.006l-1.42-1.42a1 1 0 0 1 .007-1.415l.882-.888A7.87 7.87 0 0 1 6.252 16H5.005zm3.378-6.193l-.227.34A6.884 6.884 0 0 0 7.14 12.6l-.082.4H5.005C5.002 13 5 13.664 5 14.992c0 .005.686.008 2.058.008l.082.4c.18.883.52 1.71 1.016 2.453l.227.34-1.45 1.46c-.004.003.466.477 1.41 1.422l1.464-1.458.34.227a6.959 6.959 0 0 0 2.454 1.016l.399.083v2.052c0 .003.664.005 1.992.005.005 0 .008-.686.008-2.057l.399-.083a6.959 6.959 0 0 0 2.454-1.016l.34-.227 1.46 1.45c.003.004.477-.466 1.422-1.41l-1.458-1.464.227-.34A6.884 6.884 0 0 0 20.86 15.4l.082-.4h2.053c.003 0 .005-.664.005-1.992 0-.005-.686-.008-2.058-.008l-.082-.4a6.884 6.884 0 0 0-1.016-2.453l-.227-.34 1.376-1.384.081-.082-1.416-1.416-1.465 1.458-.34-.227a6.959 6.959 0 0 0-2.454-1.016L15 7.057V5c0-.003-.664-.003-1.992 0-.005 0-.008.686-.008 2.057l-.399.083a6.959 6.959 0 0 0-2.454 1.016l-.34.227-1.46-1.45c-.003-.004-.477.466-1.421 1.408l1.457 1.466z"></path></g></svg>`
    //   button.addEventListener('click', (e: any) => {})
    // })

    // 记录k线实例
    ws.setTvWidget(tvWidget)
    // @ts-ignore
    window.tvWidget = tvWidget

    return () => {
      tvWidget.remove()
    }
  }, [query, isPc, isMobile, params])

  return <div ref={chartContainerRef} className={styles.TVChartContainer} />
}
