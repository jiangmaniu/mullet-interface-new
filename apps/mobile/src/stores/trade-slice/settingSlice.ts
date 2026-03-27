import { Uniwind } from 'uniwind'
import type { RootStoreState } from '../index'

import { SliceCreator } from '../_helpers/types'

// 涨跌颜色方案
export type ColorScheme = 'green-up' | 'red-up'

// K线位置
export type ChartPosition = 'top' | 'bottom'

// 交易颜色常量
const TRADE_COLORS = {
  buy: '#2ebc84',
  sell: '#ff112f',
  buyForeground: '#060717',
  sellForeground: '#fff',
} as const

export interface SettingSliceState {
  colorScheme: ColorScheme
  orderConfirmation: boolean
  closeConfirmation: boolean
  chartPosition: ChartPosition
  chartResolution: string
}

export interface SettingSliceActions {
  setSetting: (partial: Partial<SettingSliceState>) => void
  applyColorScheme: () => void
  setColorScheme: (scheme: ColorScheme) => void
  setOrderConfirmation: (value: boolean) => void
  setCloseConfirmation: (value: boolean) => void
  setChartPosition: (position: ChartPosition) => void
  setChartResolution: (resolution: string) => void
}

/** setting 命名空间（状态 + actions 扁平化） */
export type SettingSlice = SettingSliceState & SettingSliceActions

/** 根据颜色方案应用 CSS 变量 */
function applyColorSchemeWithColors(scheme: ColorScheme) {
  const isGreenUp = scheme === 'green-up'

  Uniwind.updateCSSVariables('dark', {
    '--color-trade-buy': isGreenUp ? TRADE_COLORS.buy : TRADE_COLORS.sell,
    '--color-trade-sell': isGreenUp ? TRADE_COLORS.sell : TRADE_COLORS.buy,
    '--color-trade-buy-foreground': isGreenUp ? TRADE_COLORS.buyForeground : TRADE_COLORS.sellForeground,
    '--color-trade-sell-foreground': isGreenUp ? TRADE_COLORS.sellForeground : TRADE_COLORS.buyForeground,
  })
}

/**
 * 创建 setting 命名空间切片（状态 + actions）
 * 访问路径: state.trade.setting.xxx
 */
export const createTradeSettingSlice: SliceCreator<RootStoreState, SettingSlice> = (setRoot, getRoot) => {
  return {
    colorScheme: 'green-up',
    orderConfirmation: true,
    closeConfirmation: true,
    chartPosition: 'top',
    chartResolution: '15分',

    setSetting: (partial) =>
      setRoot((state) => {
        Object.assign(state.trade.setting, partial)
      }),

    applyColorScheme: () => {
      applyColorSchemeWithColors(getRoot().trade.setting.colorScheme)
    },

    setColorScheme: (scheme) => {
      applyColorSchemeWithColors(scheme)
      setRoot((state) => {
        state.trade.setting.colorScheme = scheme
      })
    },

    setOrderConfirmation: (value) =>
      setRoot((state) => {
        state.trade.setting.orderConfirmation = value
      }),

    setCloseConfirmation: (value) =>
      setRoot((state) => {
        state.trade.setting.closeConfirmation = value
      }),

    setChartPosition: (position) =>
      setRoot((state) => {
        state.trade.setting.chartPosition = position
      }),

    setChartResolution: (resolution) =>
      setRoot((state) => {
        state.trade.setting.chartResolution = resolution
      }),
  }
}

// ============ Selectors ============

/** 周期中文标签 → TradingView resolution 格式映射 */
export const PERIOD_TO_RESOLUTION: Record<string, string> = {
  '1分': '1',
  '5分': '5',
  '15分': '15',
  '30分': '30',
  '1小时': '60',
  '4小时': '240',
  '1天': '1D',
  '1周': '1W',
  '1月': '1M',
}

/** TradingView resolution → 中文标签反向映射 */
export const RESOLUTION_TO_PERIOD: Record<string, string> = Object.fromEntries(
  Object.entries(PERIOD_TO_RESOLUTION).map(([k, v]) => [v, k]),
)

export const tradeSettingSelector = (state: RootStoreState) => state.trade.setting
export const tradeSettingColorSchemeSelector = (state: RootStoreState) => state.trade.setting.colorScheme
export const tradeSettingOrderConfirmationSelector = (state: RootStoreState) => state.trade.setting.orderConfirmation
export const tradeSettingCloseConfirmationSelector = (state: RootStoreState) => state.trade.setting.closeConfirmation
export const tradeSettingChartPositionSelector = (state: RootStoreState) => state.trade.setting.chartPosition
/** 返回中文标签格式的周期，如 '15分'、'4小时' */
export const tradeSettingChartResolutionSelector = (state: RootStoreState) => state.trade.setting.chartResolution
/** 返回 TradingView 格式的 resolution，如 '15'、'240'、'1D' */
export const tradeSettingChartTvResolutionSelector = (state: RootStoreState) =>
  PERIOD_TO_RESOLUTION[state.trade.setting.chartResolution] ?? '15'
