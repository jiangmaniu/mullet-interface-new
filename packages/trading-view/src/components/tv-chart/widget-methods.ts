// @ts-nocheck
import { ChartStyle, IChartingLibraryWidget, TOverrides } from 'public/static/charting_library'

import { ThemeConst } from '@/theme/theme'
import { isPC } from '@/utils/tools'

/** 涨跌色模式：1 = 绿涨红跌，2 = 红涨绿跌 */
export type ColorType = 1 | 2

/**
 * 设置蜡烛图 & 空心蜡烛图的涨跌色
 * 通过 getSeries().setChartStyleProperties 直接修改系列样式
 */
export function setChartStyleProperties(props: { colorType: ColorType; tvWidget: IChartingLibraryWidget }) {
  const { colorType, tvWidget } = props
  const red = ThemeConst.red
  const green = ThemeConst.green

  // 默认绿涨红跌；colorType === 2 时反转
  const upColor = Number(colorType) === 2 ? red : green
  const downColor = Number(colorType) === 2 ? green : red

  const candleColors = {
    upColor,
    downColor,
    wickUpColor: upColor,
    wickDownColor: downColor,
    borderUpColor: upColor,
    borderDownColor: downColor
  }

  const series = tvWidget.chart().getSeries()
  series.setChartStyleProperties(1, candleColors) // 蜡烛图
  series.setChartStyleProperties(9, candleColors) // 空心蜡烛图
}

/**
 * 应用图表全局 overrides（K线类型、背景色、字体大小等）
 */
export function applyOverrides(props: {
  chartType: ChartStyle
  bgGradientStartColor?: string
  bgGradientEndColor?: string
  bgColor?: string
  tvWidget: IChartingLibraryWidget
}) {
  const overrides: TOverrides = {
    'mainSeriesProperties.style': props.chartType, // 默认K线：蜡烛图 1
    'mainSeriesProperties.showPriceLine': true, // 当前价格水平线
    'scalesProperties.showSeriesLastValue': true, // 右侧价格刻度显示当前价格
    'scalesProperties.fontSize': 10 // 右侧价格刻度字体大小
  }

  if (props.bgGradientStartColor) {
    overrides['paneProperties.backgroundGradientStartColor'] = props.bgGradientStartColor
    overrides['paneProperties.backgroundGradientEndColor'] = props.bgGradientEndColor
  } else if (props.bgColor) {
    // changeTheme 会重置 backgroundType 为 gradient，需要强制设回 solid
    overrides['paneProperties.backgroundType'] = 'solid'
    overrides['paneProperties.background'] = props.bgColor
  }

  props.tvWidget.applyOverrides(overrides)
}
