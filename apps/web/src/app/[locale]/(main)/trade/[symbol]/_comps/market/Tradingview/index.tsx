// eslint-disable-next-line simple-import-sort/imports
import { observer } from 'mobx-react'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { isAndroid } from 'react-device-detect'
import { usePrevious } from 'ahooks'

import { PageLoading } from '@/components/loading/page-loading'
import { getTradingViewLng } from '@/v1/constants/enum'
import { ChartStyle, LanguageCode, ThemeName, widget } from '@/v1/libs/charting_library'
import klineStore from '@/v1/mobx/kline'
import { useEnv } from '@/v1/provider/envProvider'
import { useStores } from '@/v1/provider/mobxProvider'
import { STORAGE_SET_TRADINGVIEW_RESOLUTION } from '@/v1/utils/storage'
import { cn } from '@mullet/ui/lib/utils'

import { STORAGE_GET_CHART_PROPS, STORAGE_REMOVE_CHART_PROPS, ThemeConst } from './constant'
import {
  applyOverrides,
  ColorType,
  createWatermarkLogo,
  setChartStyleProperties,
  setCSSCustomProperty,
  setSymbol,
} from './widgetMethods'
import getWidgetOpts from './widgetOpts'

const Tradingview = (props: any, ref: any) => {
  const chartContainerRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLInputElement>
  const { kline, trade } = useStores()
  const { isMobile, isIpad, isMobileOrIpad, isPc, isPwaApp } = useEnv()
  const symbolName = trade.activeSymbolName
  const previousSymbolName = usePrevious(symbolName)
  const [loading, setLoading] = useState(true) // 控制图表延迟一会加载，避免闪烁
  // const [isChartLoading, setIsChartLoading] = useState(true) // 图表是否加载中，直到完成
  const { isChartLoading, setIsChartLoading } = kline
  const switchSymbolLoading = kline.switchSymbolLoading
  const [tvWidget, setTvWidget] = useState<any>(null)

  const datafeedParams = {
    setActiveSymbolInfo: kline.setActiveSymbolInfo, // 记录当前的symbol
    removeActiveSymbol: kline.removeActiveSymbol, // 取消订阅移除symbol
    getDataFeedBarCallback: kline.getDataFeedBarCallback, // 获取k线柱数据回调
  }

  const themeMode = 'dark'
  const params = useMemo(() => {
    return {
      symbol: symbolName as string, // 品种名称
      locale: (getTradingViewLng() || 'en') as LanguageCode, // 英文 en 繁体zh_TW 印尼id_ID
      theme: themeMode as ThemeName,
      colorType: 1 as ColorType, // 1绿涨红跌 2红涨绿跌
      isMobile: !isPc,
    }
  }, [symbolName, themeMode, isPc])

  const bgGradientStartColor = '#161A1E' // 背景渐变色
  const bgGradientEndColor = '#161A1E'

  const loadingTimer = useRef<any>(null)

  // 清理函数
  const clean = () => {
    // 页面卸载时清理 store
    kline.destroyed()
    clearTimeout(loadingTimer.current)
    // 清除定时器
    if (loadingTimer.current) {
      clearTimeout(loadingTimer.current)
      loadingTimer.current = null
    }
    setTvWidget(null)
  }

  const initChart = useCallback(() => {
    // 先清理之前的实例
    clean()

    const showBottomMACD = 1 // 1 展示 2 隐藏
    const chartType = 1 as ChartStyle
    const theme = params.theme

    // 切换主题删除本地缓存，避免切换主题颜色闪动
    const defaultBgColor = theme === 'dark' ? ThemeConst.black : ThemeConst.white
    if (theme && defaultBgColor !== STORAGE_GET_CHART_PROPS('paneProperties.background')) {
      STORAGE_REMOVE_CHART_PROPS()
    }

    // 注意：这里只初始化一次，后面不在通过params更新，需要使用对应的方法动态更新，否则需要重载页面才可以使用params
    const widgetOptions = getWidgetOpts(params, chartContainerRef.current, datafeedParams)
    const tvWidget = new widget(widgetOptions)

    // 延迟400ms设置loading状态，避免图表闪烁
    loadingTimer.current = setTimeout(() => {
      setLoading(false)
    }, 400)

    tvWidget.onChartReady(async () => {
      setIsChartLoading(false)
      kline.setSwitchSymbolLoading(false)

      // 动态设置css变量
      setCSSCustomProperty({ tvWidget, theme: 'dark' })
      // setSymbol(symbolName, tvWidget)

      // 监听k线可视区域图表范围变化，可以在这里请求后台数据
      // tvWidget
      //   .activeChart().onVisibleRangeChanged().subscribe( null,({ from, to }) =>{
      //     console.log('onVisibleRangeChanged:from', new Date(from * 1000).toTimeString())
      //     console.log('onVisibleRangeChanged:to', new Date(to * 1000).toTimeString())
      //   })

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
            showLabelsOnPriceScale: !!isPc, // 关闭 在右侧价格刻度上展示value值
          },
        )
      }

      // 创建自定义的MA线
      tvWidget.activeChart().createStudy(
        'Customer Moving Average',
        false,
        false,
        {},
        {
          showLabelsOnPriceScale: false, // 关闭 在右侧价格刻度上展示value值
        },
      )

      // 当您的网站主题发生变化时，您应该切换图表的主题。为此，请使用 changeTheme 方法动态更改主题
      // theme 值存储在图表的配置中。因此，如果恢复具有深色主题的图表，您可能会在浅色主题中看到黑色图表背景。在这种情况下，您应该使用 changeTheme 方法再次应用主题
      // if (theme && !bgGradientStartColor) {
      //   await tvWidget.changeTheme(theme)
      // }

      // 设置k线柱样式
      setChartStyleProperties({ colorType: params.colorType, isDark: true, tvWidget })

      // 通过api设置overview样式
      applyOverrides({
        tvWidget,
        chartType,
        bgGradientStartColor,
        bgGradientEndColor,
      })

      // 添加水印LOGO
      createWatermarkLogo(true)

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
    kline.setTvWidget(tvWidget)
  }, [])

  useEffect(() => {
    if (!tvWidget) return

    const onIntervalChangedCallback = (interval: any, timeframeObj: any) => {
      console.log('interval', interval, timeframeObj)

      // 记录当前切换的分辨率
      STORAGE_SET_TRADINGVIEW_RESOLUTION(interval)

      // 除了分钟 小时的k线 其他都设置为上海时区，否则时区显示错误，绘制天以上周期的k线时间不对
      if (['D', 'W', 'M', 'Y'].some((item) => interval.endsWith(item))) {
        tvWidget.activeChart().getTimezoneApi().setTimezone('Etc/UTC')
      } else {
        tvWidget.activeChart().getTimezoneApi().setTimezone('Asia/Shanghai')
      }
      // 重置数据，请求历史数据
      klineStore.forceRefreshKlineData()
    }

    const onTimezoneChangedCallback = (timezone: any) => {
      console.log('timezone', timezone)
    }

    tvWidget.onChartReady(() => {
      // 监听分时等时间周期变化，请求请求历史k线数据，重置缓存
      tvWidget.activeChart().onIntervalChanged().subscribe(null, onIntervalChangedCallback)

      // 监听时区切换
      tvWidget.activeChart().getTimezoneApi().onTimezoneChanged().subscribe(null, onTimezoneChangedCallback, true)
    })

    return () => {
      // 移除所有事件监听器
      const activeChart = tvWidget.activeChart()
      if (activeChart) {
        activeChart.onIntervalChanged().unsubscribeAll(onIntervalChangedCallback)
        activeChart.getTimezoneApi().onTimezoneChanged().unsubscribeAll(onTimezoneChangedCallback)
      }
    }
  }, [tvWidget])

  const reload = useCallback(() => {
    setIsChartLoading(true)
    setLoading(true)
    // 初始化图表实例
    initChart()
  }, [initChart])

  useImperativeHandle(ref, () => {
    return {
      reload,
      clean,
    }
  })

  useEffect(() => {
    if (!symbolName || kline.tvWidget) return
    reload()
  }, [params, kline.tvWidget])

  // useEffect(() => {
  //   return () => {
  //     clean()
  //   }
  // }, [])

  // 监听切换品种
  useEffect(() => {
    if (!symbolName || switchSymbolLoading || !kline.tvWidget) return

    // 立即设置loading状态
    kline.setSwitchSymbolLoading(true)

    // 实例已经初始化，直接切换品种
    kline.tvWidget.onChartReady(() => {
      setSymbol(symbolName, kline.tvWidget)
    })
  }, [symbolName])

  let height = 0
  if (isPwaApp) {
    height = isAndroid ? 240 : 260
  } else {
    height = 240
  }

  return (
    <div
      className={cn('relative h-full [&_iframe]:!h-full')}
      style={{ height: isPc ? '' : document.documentElement.clientHeight - height }}
    >
      <div
        id="tradingview"
        ref={chartContainerRef}
        className="relative flex h-full flex-1"
        style={{ opacity: loading ? 0 : 1 }}
      />
      {isChartLoading && (
        <div className="absolute top-0 right-0 bottom-0 left-0 z-40 flex h-full w-full items-center justify-center">
          <PageLoading />
        </div>
      )}
    </div>
  )
}

export default observer(forwardRef(Tradingview))
