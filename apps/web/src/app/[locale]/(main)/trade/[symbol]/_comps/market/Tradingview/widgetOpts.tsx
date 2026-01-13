import { isChrome, isChromium, isEdge, isFirefox, isSafari } from 'react-device-detect'

import { getEnv } from '@/v1/env'
import {
  ChartingLibraryFeatureset,
  ChartingLibraryWidgetOptions,
  LanguageCode,
  ResolutionString,
} from '@/v1/libs/charting_library'
import { isPCByWidth } from '@/v1/utils'
import { STORAGE_GET_TRADINGVIEW_RESOLUTION } from '@/v1/utils/storage'

import { defaultInterval, ThemeConst } from './constant'
import ma from './customIndicators/ma'
import DataFeedBase from './datafeed'

const fullZero = (value: number | string) => String(value).padStart(2, '0')

const bgPrimary = '#0e123a'

// https://www.tradingview.com/charting-library-docs/latest/api/interfaces/Charting_Library.ChartingLibraryWidgetOptions
export default function getWidgetOpts(
  props: Partial<
    ChartingLibraryWidgetOptions & {
      colorType?: number
      isMobile?: boolean
    }
  >,
  containerRef: any,
  datafeedParams: any,
): ChartingLibraryWidgetOptions {
  const ENV = getEnv()
  const theme = props.theme
  const isDark = theme === 'dark'
  const bgColor = theme === 'dark' ? ThemeConst.black : ThemeConst.white // 自定义背景颜色
  // const toolbar_bg = theme === 'dark' ? ThemeConst.black : '#f4f7f9' // 侧边工具栏和底部工具栏背景颜色
  // const toolbar_bg = theme === 'dark' ? ThemeConst.black : '#fff' // 侧边工具栏和底部工具栏背景颜色
  const isPopularBrowser = isSafari || isChrome || isChromium || isFirefox || isEdge // 主流浏览器

  /**
   * 关于移动端 https://www.tradingview.com/charting-library-docs/latest/mobile_specifics/
   * - 图表图例显示收盘价和百分比变化。开盘价、最高价、最低价以及指标值仅在跟踪模式下显示。要激活此模式，用户应长按栏并单击图表即可退出
   * - 价格的百分比变化是根据盘中报价计算的，而不是前一根柱线
   */

  // https://www.tradingview.com/charting-library-docs/latest/customization/Featuresets
  // 注意：在我们调样式的时候，需要禁用本地配置，因为tradingview会优先使用本地配置的颜色，只要运行加载过一次k线图，那么tradingview就会保存相关的配置，下次加载就会使用本地的配置，所以我们改不动
  const disabled_features: ChartingLibraryFeatureset[] = [
    // 'header_widget', // 隐藏头部工具栏
    // 'left_toolbar', // 隐藏侧边工具栏
    'header_compare', // 隐藏头部添加比较品种入口
    'symbol_search_hot_key',
    'study_templates', // 指标模板
    'header_saveload', // 保存
    'save_shortcut',
    'header_undo_redo', //撤销
    // 'legend_widget', // 隐藏图例
    'symbol_info', // 隐藏图例中点击的商品信息
    'timeframes_toolbar', // 隐藏底部工具条 时间栏
    'scales_date_format',
    'header_fullscreen_button', // 全屏
    'display_market_status', // 隐藏图例旁边的市场状态
    // 在标题面板上显示符号搜索按钮，展示在顶部的最左侧，移动端展示品种名称
    'header_symbol_search',
    // 'use_localstorage_for_settings' // 背景色改不动，配置不生效的原因，需要禁用本地配置、背景色改不动，也跟主题色属性有关，不能存在主题色属性 theme: "dark",//"light"
    // 'main_series_scale_menu', // 隐藏右下角设置按钮
    // 'header_settings',    // 设置
    // 'header_resolutions' // 时间
    // 'header_chart_type',  // 图表类型
    // 'header_indicators',  // 指标
    // 'legend_context_menu',
  ]

  // 启动打开配置
  const enabled_features: ChartingLibraryFeatureset[] = [
    // 'seconds_resolution', // 分辨率（以秒为单位）​ 将 has_seconds 设置为 true
    'hide_resolution_in_legend', // 隐藏分钟线和小时线等这些在图例中展示
    'display_legend_on_all_charts',
    // 在图例中显示符号的徽标，提供 LibrarySymbolInfo 对象的 logo_urls 属性中符号的 URL。将对象作为参数传递给 resolveSymbol 方法的回调
    // 'show_symbol_logos',
    // 'show_symbol_logo_in_legend',
    // "side_toolbar_in_fullscreen_mode",//全屏模式启动绘图功能
  ]

  if (props.isMobile) {
    disabled_features.push(
      'context_menus', // 隐藏鼠标右键按钮
      'show_chart_property_page', // 隐藏右上角设置按钮
      'header_screenshot', // 截图
      'adaptive_logo', // 隐藏logo后面文字
      'left_toolbar', // 隐藏侧边工具栏
      // 'popup_hints' //显示有关可能的鼠标/快捷方式/UI 操作的弹出提示
    )
    enabled_features.push(
      // 'always_show_legend_values_on_mobile', // 在移动设备上显示图例值
      'hide_left_toolbar_by_default', // 当用第一次进入隐藏左部工具栏
    )
    // 非主流浏览器使用兼容模式
    if (!isPopularBrowser) {
      enabled_features.push(
        // https://www.tradingview.com/charting-library-docs/latest/customization/Featuresets/#behavior
        // 兼容低版本浏览器 Enables alternative loading mode for the library, which can be used to support older browsers and a few non-standard browsers.
        'iframe_loading_compatibility_mode',
      )
    }
  } else {
    // disabled_features.push(
    // )
  }

  const interval = STORAGE_GET_TRADINGVIEW_RESOLUTION() || (isPCByWidth() ? defaultInterval : '1')

  const widgetOptions: ChartingLibraryWidgetOptions = {
    // debug: process.env.NODE_ENV === 'development', // 调试模式
    fullscreen: true, // 全屏
    autosize: true, // 自动调整大小
    // width: 400,// 设置图标宽高，与fullscreen autosize互斥
    // height: 400,// 设置图标宽高，与fullscreen autosize互斥
    // 您的后端的一个版本。支持的值为： '1.0' | “1.1”。
    // charts_storage_api_version: '1.1',
    // 设置图表的初始时间范围。时间范围是加载并显示在屏幕上的K线范围。有效的时间范围是一个数字加一个字母，D为数天，M为数月
    // timeframe: '1D', // 图表展示的时间范围数据 -- 避免多次请求历史数据，默认展示1天数据 将会触发getBars请求数据的范围 frm to
    timezone: 'exchange', // 使用交易所的时区 即resolveSymbol那里currentSymbolInfo设置的品种的时区，这样更合理，因为不同品种的时区不同
    library_path: '/static/charting_library/', // 核心库位置
    // @ts-ignore
    datafeed: new DataFeedBase(datafeedParams),
    // BEWARE: no trailing slash is expected in feed URL
    // datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(
    // 	"https://demo_feed.tradingview.com",
    // 	undefined,
    // 	{
    // 		maxResponseLength: 1000,
    // 		expectedOrder: "latestFirst",
    // 	}
    // ),

    symbol: props.symbol || 'XAUUSD', // 品种，提供默认值
    client_id: ENV.name, // 设置高级保存/加载图表 API 的客户端 ID
    user_id: 'public_user_id', // 设置高级保存/加载图表 API 的用户 ID。
    locale: props.locale as LanguageCode, // 设置语言
    interval: interval as ResolutionString, // 分辨率，时间间隔，例如1W代表每个条形1周的 默认周期  1/5/15/30/60/240-> 1/5/15/30/60/240分钟  D->一天   W->一周   M->一月
    theme: 'dark', // 设置主题颜色
    // toolbar_bg, // 侧边工具栏和底部工具栏背景颜色
    container: containerRef, // dom的引用

    symbol_search_request_delay: 1000, // 防抖：搜索symbol延迟的时间，默认1000
    auto_save_delay: 5, // 防抖：两次自动保存之间的时间，默认5
    study_count_limit: 5, // 最多在顶部下方区域显示的研究数量(点击Indicators添加)，超过会弹窗提示用户
    allow_symbol_change: true,
    // studies_access: { // 设置Indicators品种给用户的访问权限，显示或隐藏
    // 	// 设置为white，只显示tools设置的name，其他的都隐藏，相当于只给这个开放白名单
    // 	// 设置为black，tools设置的name隐藏，其他都显示，grayed:true，tools下的name都置灰显示，不能点击
    // 	type: 'black',
    // 	tools: [
    // 		{
    // 			name: 'Aroon', // 品种名称
    // 			grayed:true, // 置灰显示，不能点击
    // 		}
    // 	]
    // },
    // drawings_access: { // 设置侧边栏工具箱权限：删除或置灰某些功能，与studies_access类型，此选项可自定义用户可用或不可用的内容
    // 	// 设置为white，只显示tools设置的name，其他的都隐藏，相当于只给这个开放白名单
    // 	// 设置为black，tools设置的name隐藏，其他都显示，grayed:true，tools下的name都置灰显示，不能点击
    // 	type: 'black',
    // 	tools: [
    // 		{
    // 			name: 'Trend Line', // 侧边栏菜单Trend Line置灰，不能点击
    // 			grayed:true, // 置灰显示，不能点击，如果关闭置灰，改项不会出现在列表中
    // 		}
    // 	]
    // },
    // saved_data:{}, // 保存图表改动，比如设置了图表的标题，图例等，会保存到saved_data中，下次打开时会读取saved_data中的数据，显示图表 tvWidget.save(console.log)
    // numeric_formatting: {decimal_sign:'.'}, //数字格式化， 价格刻度或图例，分割符号
    custom_formatters: {
      // 自定义格式化
      // 右下角显示的时间格式化，默认以小时:分钟:秒显示
      // timeFormatter: {
      // 	// utc时间
      // 	format(date: Date) {
      // 		return `${date.getUTCHours()}:${fullZero(date.getUTCMinutes())}:${date.getUTCSeconds()}`
      // 	},
      // 	// 转为本地时区时间
      // 	formatLocal(date: Date) {
      // 		return `${date.getHours()}:${fullZero(date.getMinutes())}:${date.getSeconds()}`
      // 	}
      // },
      // 鼠标悬浮在柱子上显示的日期
      // @ts-ignore
      dateFormatter: {
        // utc时间
        format(date: Date) {
          const hour = date.getUTCHours()
          return `${date.getUTCFullYear()}-${fullZero(date.getUTCMonth() + 1)}-${fullZero(date.getUTCDate())}`
        },
        // 转为本地时区时间
        formatLocal(date: Date) {
          return `${date.getFullYear()}-${fullZero(date.getMonth() + 1)}-${fullZero(date.getDate())}`
        },
      },
      // x轴坐标日期格式化
      // tickMarkFormatter: (date: Date, tickMarkType: TickMarkType) => {
      //   switch (tickMarkType) {
      //     case 'Year':
      //       return 'Y' + date.getUTCFullYear()
      //     case 'Month':
      //       return 'M' + (date.getUTCMonth() + 1)
      //     case 'DayOfMonth':
      //       return 'D' + date.getUTCDate()
      //     case 'Time':
      //       return 'T' + date.getUTCHours() + ':' + date.getUTCMinutes()
      //     case 'TimeWithSeconds':
      //       return 'S' + date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCSeconds()
      //   }
      // }
      // 可以被视为numeric_formatting的拓展
      // 格式化右边数字Y轴刻度数字，在设置里修改 symbol > precision 可以看到
      // priceFormatterFactory: (symbolInfo: LibrarySymbolInfo | null, minTick: string) => {
      //   if (symbolInfo === null) {
      //     return null
      //   }
      //   if (symbolInfo.format === 'price') {
      //     return {
      //       format: (price, signPositive) => {
      //         console.log('minTick', minTick)
      //         console.log('price====', price)
      //         if (price >= 1000000000) {
      //           return `${(price / 1000000000).toFixed(3)}B`
      //         }

      //         if (price >= 1000000) {
      //           return `${(price / 1000000).toFixed(3)}M`
      //         }

      //         if (price >= 1000) {
      //           return `${(price / 1000).toFixed(3)}K`
      //         }

      //         return price.toFixed(2)
      //       }
      //     }
      //   }
      //   return null // The default formatter will be used.
      // }
    },
    // 可以通过api来动态设置 applyOverrides
    // https://www.tradingview.com/charting-library-docs/latest/customization/overrides/
    overrides: {
      'paneProperties.background': bgPrimary,
      'paneProperties.backgroundType': 'solid',

      'paneProperties.vertGridProperties.style': 1,
      'paneProperties.vertGridProperties.color': 'rgba(255, 255, 255, 0.1)',
      'paneProperties.horzGridProperties.style': 1,
      'paneProperties.horzGridProperties.color': 'rgba(255, 255, 255, 0.1)',

      // 刻度文字颜色
      'scalesProperties.textColor': 'rgba(118, 119, 131, 1)',
      // 刻度线颜色
      'scalesProperties.lineColor': 'rgba(255, 255, 255, 0.1)',
      'scalesProperties.fontSize': 10,
      'MACD.zeroLine.color': '#666666',
    },
    // 可用于自定义指标参数的属性，例如颜色、线宽、绘图类型等
    // https://www.tradingview.com/charting-library-docs/latest/customization/overrides/Studies-Overrides?_highlight=studies_overrides
    studies_overrides: {
      // 'MACD.Signal.color': '#00ff00',
      // 'MACD.Histogram.color.0': '#ff0000'
      // 外国股市都是绿涨红跌，但中国却相反
      // 'volume.color.0': green,
      // 'volume.color.1': red
    },
    // 禁用关闭的配置
    disabled_features,
    // 启动打开的配置
    enabled_features,
    // time_frames: [],// 设置底部右下角时间选择
    custom_css_url: '/static/charting_library/style.css', // 自定义颜色配置
    // 允许用户在本地存储中存储一些存储项，例如分辨率1D 1W 和图标类型，其旁边会有一个星号
    favorites: {
      // @ts-ignore
      intervals: ['1', '5', '15', '30', '60'],
      // indicators: ["MACD"],
      // drawingTools: ['LineToolBrush', 'LineToolCallout', 'LineToolCircle'],  // 选择的工具旁边有星号
      // chartTypes: ['Area', 'Candles'], // 选择的图标旁边有星号
    },
    // 自定义指标 https://www.tradingview.com/charting-library-docs/latest/custom_studies/
    // @ts-ignore
    custom_indicators_getter: function (PineJS) {
      return Promise.resolve([ma(PineJS)])
    },
    loading_screen: {
      backgroundColor: bgPrimary,
      foregroundColor: '#eed94c',
    },
    // 加载背景 加载图标背景颜色  没找到隐藏方式，这样隐藏
    // charts_storage_url: "https://saveload.tradingview.com", // 点击图标保存按钮会把配置保存到服务器
    // settings_adapter: {
    // 	initialSettings: { ... },
    // 	setValue: function(key, value) { ... },
    // 	removeValue: function(key) { ... },
    // }
    // compare_symbols: [ // 永久添加到比较窗口中默认的值，点击顶部compare
    // 	{
    // 		symbol: 'AAPL',
    // 		title: 'Apple',
    // 	},
    // 	{
    // 		symbol: 'GOOGL',
    // 		title: 'Google',
    // 	},
    // ],
    // 点击legend弹窗的symbol信息，额外展示在底部的
    // additional_symbol_info_fields: [
    // 	{title: '',propertyName:''}
    // ],
    // header_widget_buttons_mode: 'fullsize',
    // time_scale: {
    //   min_bar_spacing: 0 // 控制k线bar的宽度
    // }
    // custom_translate_function:(key,options) => { // 转化函数，可以修改一些按钮文字
    // 	if(key === 'Indicator') {
    // 		return 'Test'
    // 	}
    // 	return null
    // },
    // https://www.tradingview.com/charting-library-docs/latest/saving_loading/Save-Load-Adapter-Example
    // save_load_adapter: {},
  }

  return widgetOptions
}
