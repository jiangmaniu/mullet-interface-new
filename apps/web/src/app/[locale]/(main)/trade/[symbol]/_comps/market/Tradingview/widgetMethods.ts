// @ts-nocheck
import { ChartStyle, IChartingLibraryWidget, ThemeName, TOverrides } from '@/v1/libs/charting_library'
import { stores } from '@/v1/provider/mobxProvider'
import { isPC } from '@/v1/utils'
import { cn } from '@mullet/ui/lib/utils'

import { ThemeConst, ThemeDark } from './constant'
import { getTradingviewThemeCssVar } from './theme'

// 动态设置品种
export const setSymbol = (symbol, tvWidget: IChartingLibraryWidget) => {
  if (!symbol) return
  tvWidget?.activeChart?.()?.resetData?.()
  tvWidget?.activeChart?.()?.setSymbol?.(symbol, {
    dataReady: () => {
      console.log('切换品种成功')
      setTimeout(() => {
        stores.kline.setSwitchSymbolLoading(false)
      }, 100)
    },
  })
}

// 设置图表样式
export type ColorType = 1 | 2 // 1绿涨红跌 2红涨绿跌
export function setChartStyleProperties(props: {
  colorType: ColorType
  isDark: any
  tvWidget: IChartingLibraryWidget
}) {
  const { colorType, tvWidget, isDark } = props
  const red = isDark ? ThemeDark.red : ThemeConst.red
  const green = isDark ? ThemeDark.green : ThemeConst.green
  let upColor = green
  let downColor = red

  // 1绿涨红跌 2红涨绿跌
  if (Number(colorType) === 2) {
    upColor = red
    downColor = green
  }
  // 蜡烛图设置红涨绿跌样式
  tvWidget.chart().getSeries().setChartStyleProperties(1, {
    upColor,
    downColor,
    wickUpColor: upColor,
    wickDownColor: downColor,
    borderUpColor: upColor,
    borderDownColor: downColor,
  })

  // 空心蜡烛图设置红涨绿跌样式
  tvWidget.chart().getSeries().setChartStyleProperties(9, {
    upColor,
    downColor,
    wickUpColor: upColor,
    wickDownColor: downColor,
    borderUpColor: upColor,
    borderDownColor: downColor,
  })

  // ======= 不同的图表类型默认值 ===========
  // https://www.tradingview.com/charting-library-docs/latest/customization/overrides/chart-overrides#chart-styles

  // K线图样式
  // 'mainSeriesProperties.candleStyle.upColor': `${upcolor}`,
  // 'mainSeriesProperties.candleStyle.downColor': `${downColor}`,
  // 'mainSeriesProperties.candleStyle.borderUpColor': `${upcolor}`,
  // 'mainSeriesProperties.candleStyle.borderDownColor': `${downColor}`,
  // 'mainSeriesProperties.candleStyle.wickUpColor': `${upcolor}`,
  // 'mainSeriesProperties.candleStyle.wickDownColor': `${downColor}`
  // "mainSeriesProperties.candleStyle.drawWick": true,
  // "mainSeriesProperties.candleStyle.drawBorder": true,
  // "mainSeriesProperties.candleStyle.borderColor": "#3786yarn58",
  // "mainSeriesProperties.candleStyle.barColorsOnPrevClose": false,

  // // 空心K线图样式
  // "mainSeriesProperties.hollowCandleStyle.upColor":  `${upcolor}`,
  // "mainSeriesProperties.hollowCandleStyle.downColor": `${downColor}`,
  // "mainSeriesProperties.hollowCandleStyle.drawWick": true,
  // "mainSeriesProperties.hollowCandleStyle.drawBorder": true,
  // "mainSeriesProperties.hollowCandleStyle.borderColor": "#378658",
  // "mainSeriesProperties.hollowCandleStyle.borderUpColor":  `${upcolor}`,
  // "mainSeriesProperties.hollowCandleStyle.borderDownColor": `${downColor}`,
  // "mainSeriesProperties.hollowCandleStyle.wickColor": "#737375",

  // // 平均K线图样式
  // "mainSeriesProperties.haStyle.upColor":  `${upcolor}`,
  // "mainSeriesProperties.haStyle.downColor": `${downColor}`,
  // "mainSeriesProperties.haStyle.drawWick": true,
  // "mainSeriesProperties.haStyle.drawBorder": true,
  // "mainSeriesProperties.haStyle.borderColor": "#378658",
  // "mainSeriesProperties.haStyle.borderUpColor":  `${upcolor}`,
  // "mainSeriesProperties.haStyle.borderDownColor": `${downColor}`,
  // "mainSeriesProperties.haStyle.wickColor": "#737375",
  // "mainSeriesProperties.haStyle.barColorsOnPrevClose": false,

  // // 美国线样式
  // "mainSeriesProperties.barStyle.upColor":  `${upcolor}`,
  // "mainSeriesProperties.barStyle.downColor": `${downColor}`,
  // "mainSeriesProperties.barStyle.barColorsOnPrevClose": false,
  // "mainSeriesProperties.barStyle.dontDrawOpen": false,

  // // 线形图样式
  // "mainSeriesProperties.lineStyle.color":  `${downColor}`,
  // // "mainSeriesProperties.lineStyle.linestyle": "LINESTYLE_SOLID",
  // "mainSeriesProperties.lineStyle.linewidth": 1,
  // "mainSeriesProperties.lineStyle.priceSource": "close",

  // // 面积图样式
  // "mainSeriesProperties.areaStyle.color1": "#606090",
  // "mainSeriesProperties.areaStyle.color2": "#01F6F5",
  // "mainSeriesProperties.areaStyle.linecolor": "#0094FF",
  // // "mainSeriesProperties.areaStyle.linestyle": "LINESTYLE_SOLID",
  // "mainSeriesProperties.areaStyle.linewidth": 1,
  // "mainSeriesProperties.areaStyle.priceSource": "close",

  // 基准线样式
  // 'mainSeriesProperties.baselineStyle.baselineColor': 'rgba( 117, 134, 150, 1)',
  // 'mainSeriesProperties.baselineStyle.topFillColor1': 'rgba( 83, 185, 135, 0.1)',
  // 'mainSeriesProperties.baselineStyle.topFillColor2': 'rgba( 83, 185, 135, 0.1)',
  // 'mainSeriesProperties.baselineStyle.bottomFillColor1': 'rgba( 235, 77, 92, 0.1)',
  // 'mainSeriesProperties.baselineStyle.bottomFillColor2': 'rgba( 235, 77, 92, 0.1)',
  // 'mainSeriesProperties.baselineStyle.topLineColor': 'rgba( 83, 185, 135, 1)',
  // 'mainSeriesProperties.baselineStyle.bottomLineColor': 'rgba( 235, 77, 92, 1)',
  // 'mainSeriesProperties.baselineStyle.topLineWidth': 1,
  // 'mainSeriesProperties.baselineStyle.bottomLineWidth': 1,
  // 'mainSeriesProperties.baselineStyle.priceSource': 'close',
  // 'mainSeriesProperties.baselineStyle.transparency': 50,
  // 'mainSeriesProperties.baselineStyle.baseLevelPercentage': 50

  // // Hi-Lo style
  // "mainSeriesProperties.hiloStyle.color": "#2196f3",
  // "mainSeriesProperties.hiloStyle.showBorders": true,
  // "mainSeriesProperties.hiloStyle.borderColor": "#2196f3",
  // "mainSeriesProperties.hiloStyle.showLabels": true,
  // "mainSeriesProperties.hiloStyle.labelColor": "#2196f3",
  // // "mainSeriesProperties.hiloStyle.fontFamily": 'Trebuchet MS',
  // "mainSeriesProperties.hiloStyle.fontSize": 7,
}

// 通过api设置overview样式
export function applyOverrides(props: {
  chartType: ChartStyle
  bgGradientStartColor?: string
  bgGradientEndColor?: string
  tvWidget: IChartingLibraryWidget
}) {
  // 修改override样式
  const overrides: TOverrides = {
    'mainSeriesProperties.style': props.chartType, // 默认k线：蜡烛图 1
    'scalesProperties.fontSize': isPC() ? 12 : 10, // 右侧价格刻度字体大小
  }
  // if (props.bgGradientStartColor) {
  //   overrides['paneProperties.backgroundGradientStartColor'] = props.bgGradientStartColor
  //   overrides['paneProperties.backgroundGradientEndColor'] = props.bgGradientEndColor
  // }
  props.tvWidget.applyOverrides(overrides)
}

// 设置自定义颜色-主题色
export function setCSSCustomProperty(props: { tvWidget: IChartingLibraryWidget; theme: ThemeName }) {
  const { tvWidget, theme } = props
  const conf = getTradingviewThemeCssVar(theme)
  const keys = Object.keys(conf)
  if (keys.length) {
    keys.forEach((key) => {
      tvWidget.setCSSCustomProperty(key, conf[key])
    })
  }
}

// 创建水印LOGO
export function createWatermarkLogo(isDark?: boolean) {
  const chartContainer = document.getElementById('tradingview')
  const logo = document.createElement('img')
  logo.src = isDark ? '/platform/img/kline-water-logo.svg' : '/platform/img/kline-water-logo.svg' // 替换为您的 LOGO 路径
  logo.style.width = '560px'
  logo.style.opacity = 0.05
  logo.className = cn('absolute select-none left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2')

  // 将 LOGO 元素添加到图表容器中
  chartContainer.appendChild(logo)
}

// 移动端自定义全屏按钮
export function createFullScreenButton(props) {
  const { tvWidget, changeToast, imgsrc } = props
  let { fullscreen } = props
  if (!isPC()) {
    const button = tvWidget.createButton({ align: 'right' })
    button.setAttribute('title', '全屏/退出')
    button.innerHTML = `<img src=${imgsrc} style="height:20px" />`
    // button.textContent = 'screen'
    button.addEventListener('click', function () {
      // const tvDom = document.getElementById('tv_chart_container')
      // const clientWidth = window.screen.availWidth
      // const clientHeight = window.screen.availHeight
      // const translateWidth = (clientHeight - clientWidth) / 2

      // tvDom.style.height = `${clientWidth}px`
      // tvDom.style.width = `${clientHeight}px`
      // tvDom.style.transform = `rotate(90deg) translate(${translateWidth}px,${translateWidth}px)`

      const element = document.getElementById('tvcontainer')
      if (fullscreen) {
        // fullscreen = false
        // showToast = false
        // tvDom.style.height = `100%`
        // tvDom.style.width = `auto`
        // tvDom.style.transform = ``
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen()
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen()
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        }
        fullscreen = false
        // setTimeout(()=>{fullscreen = false},2000)
      } else {
        changeToast(true)
        // tvDom.style.height = `${clientWidth}px`
        // tvDom.style.width = `${clientHeight}px`
        // tvDom.style.transform = `rotate(90deg) translate(${translateWidth}px,${translateWidth}px)`
        if (element.requestFullscreen) {
          element.requestFullscreen()
        } else if (element.webkitRequestFullScreen) {
          element.webkitRequestFullScreen()
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen()
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen()
        }
        fullscreen = true
        setTimeout(() => {
          changeToast(false)
        }, 2000)
      }
    })
  }
}

// 品种信息按钮
export function createInfoButton(props) {
  const { tvWidget, symbol } = props
  const button = tvWidget.createButton({ align: 'left' })
  button.setAttribute('title', '信息')
  // button.innerHTML = `
  // <div style="display:flex;align-items:center;">
  //     <img src=${imgsrc} style="height:20px" />
  //     <span id="customerInfoButton" style="margin-left:4px;color:#191919">${symbol}</span>
  // </div>`
  button.innerHTML = `
    <div style="display:flex;align-items:center;">
        <span id="customerInfoButton" style="margin-left:4px;font-weight: 700;">${symbol}</span>
    </div>`
  // button.addEventListener('click',function(){
  //     cb()
  // })
}

//指标按钮
export function createIndicatorsButton(props) {
  const { tvWidget, imgsrc, tvdom } = props
  const button = tvWidget.createButton({ align: 'left' })
  button.setAttribute('title', '指标')
  button.innerHTML = `
        <img src=${imgsrc} style="height:16px" />
    `
  // button.innerHTML = `
  //     <span>指标</span>
  // `
  button.addEventListener('click', function () {
    tvdom.getElementById('header-toolbar-indicators').click()
  })
}

// 图表类型按钮
export function createChartTypeButton(props) {
  const { tvWidget, imgsrc, tvdom } = props
  const button = tvWidget.createButton({ align: 'left' })
  button.setAttribute('title', '图表类型')
  button.innerHTML = `
        <img src=${imgsrc} style="height:18px" />
    `
  //  button.innerHTML = `
  //     <span>类型</span>
  // `
  button.addEventListener('click', function () {
    tvdom.getElementById('header-toolbar-chart-styles').getElementsByTagName('div')[0].click()
  })
}

// 波动频率 按钮
export function createFrequencyButton(props) {
  const { tvWidget, imgsrc, tvdom } = props
  const button = tvWidget.createButton({ align: 'right' })
  button.setAttribute('title', '频率')
  button.innerHTML = `
        <div style="display:flex;align-items:baseline">
            <span style="margin-right:6px" id="tv_custom_Interval_btn">1分钟</span>
            <img src=${imgsrc} style="width:12px" />
        </div>
    `
  button.addEventListener('click', function () {
    tvdom.getElementById('header-toolbar-intervals').getElementsByTagName('div')[0].click()
    tvdom.getElementsByClassName('menuWrap-1gEtmoET-')[0].style.right = '5px'
    tvdom.getElementsByClassName('menuWrap-1gEtmoET-')[0].style.left = 'auto'
  })
}

// 侧边栏工具 按钮
export function createToolButton(props) {
  const { tvWidget, imgsrc } = props
  const button = tvWidget.createButton()
  button.setAttribute('title', '工具')
  button.innerHTML = `
        <img src=${imgsrc} style="width:20px" />
    `
  //     button.innerHTML = `
  //     <span>工具</span>
  // `
  button.addEventListener('click', function () {
    tvWidget.chart().executeActionById('drawingToolbarAction')
  })
}

//1分按钮
export function create1Mbutton(props) {
  const { tvWidget, symbol } = props
  const button = tvWidget.createButton()
  button.setAttribute('title', '1分钟')
  button.innerHTML = `
        <span style="margin-right:6px" id="tv_custom_Interval_btn">1</span>
    `
  button.addEventListener('click', function () {
    tvWidget.setSymbol(symbol, '1')
  })
}

//5分按钮
export function create5Mbutton(props) {
  const { tvWidget, symbol } = props
  const button = tvWidget.createButton()
  button.setAttribute('title', '5分钟')
  button.innerHTML = `
        <span style="margin-right:6px" id="tv_custom_Interval_btn">5</span>
    `
  button.addEventListener('click', function () {
    console.log(symbol)
    tvWidget.setSymbol(symbol, '5')
  })
}

//15分按钮
export function create15Mbutton(props) {
  const { tvWidget, symbol } = props
  const button = tvWidget.createButton()
  button.setAttribute('title', '15分钟')
  button.innerHTML = `
        <span style="margin-right:6px" id="tv_custom_Interval_btn">15</span>
    `
  button.addEventListener('click', function () {
    tvWidget.setSymbol(symbol, '15')
  })
}

//30分按钮
export function create30Mbutton(props) {
  const { tvWidget, symbol } = props
  const button = tvWidget.createButton()
  button.setAttribute('title', '30分钟')
  button.innerHTML = `
        <span style="margin-right:6px" id="tv_custom_Interval_btn">30</span>
    `
  button.addEventListener('click', function () {
    tvWidget.setSymbol(symbol, '30')
  })
}

//分时按钮
export function create1hbutton(props) {
  const { tvWidget, symbol } = props
  const button = tvWidget.createButton()
  button.setAttribute('title', '1小时')
  button.innerHTML = `
        <span style="margin-right:6px" id="tv_custom_Interval_btn">60</span>
    `
  button.addEventListener('click', function () {
    tvWidget.setSymbol(symbol, '60')
  })
}

//创建指标按钮
//ma
export function createmabutton(props) {
  const { tvWidget } = props
  const button = tvWidget.createButton()
  button.setAttribute('title', 'MA指标')
  button.innerHTML = `
        <span>MA</span>
    `
  button.addEventListener('click', function () {
    tvWidget
      .activeChart()
      .createStudy('Moving Average', false, false, [26])
      .then(() => {
        const allStudy = tvWidget.activeChart().getAllStudies()
        for (const item of allStudy) {
          const target = allStudy.filter((li) => li.name === item.name)
          if (target.length > 1) {
            target.forEach((i, index) => {
              if (index > 0) {
                tvWidget.activeChart().removeEntity(i.id)
              }
            })
            return
          }
        }
      })
  })
}
//macd
export function createmacdbutton(props) {
  const { tvWidget } = props
  const button = tvWidget.createButton()
  button.setAttribute('title', 'MACD指标')
  button.innerHTML = `
        <span>MACD</span>
    `
  button.addEventListener('click', function () {
    tvWidget
      .chart()
      .createStudy('MACD', false, false, [14, 30, 'close', 9])
      .then(() => {
        const allStudy = tvWidget.activeChart().getAllStudies()
        for (const item of allStudy) {
          const target = allStudy.filter((li) => li.name === item.name)
          if (target.length > 1) {
            target.forEach((i, index) => {
              if (index > 0) {
                tvWidget.activeChart().removeEntity(i.id)
              }
            })
            return
          }
        }
      })
  })
}
