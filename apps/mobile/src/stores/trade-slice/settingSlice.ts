import { Uniwind } from 'uniwind'

import type { RootStoreState } from '../index'

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
}

export interface SettingSliceActions {
  setSetting: (partial: Partial<SettingSliceState>) => void
  applyColorScheme: () => void
  setColorScheme: (scheme: ColorScheme) => void
  setOrderConfirmation: (value: boolean) => void
  setCloseConfirmation: (value: boolean) => void
  setChartPosition: (position: ChartPosition) => void
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
export function createTradeSettingSlice(
  setRoot: (fn: (state: RootStoreState) => void) => void,
  getRoot: () => RootStoreState,
): SettingSlice {
  return {
    colorScheme: 'green-up',
    orderConfirmation: true,
    closeConfirmation: true,
    chartPosition: 'top',

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
  }
}

// ============ Selectors ============

export const tradeSettingSelector = (state: RootStoreState) => state.trade.setting
export const tradeSettingColorSchemeSelector = (state: RootStoreState) => state.trade.setting.colorScheme
export const tradeSettingOrderConfirmationSelector = (state: RootStoreState) => state.trade.setting.orderConfirmation
export const tradeSettingCloseConfirmationSelector = (state: RootStoreState) => state.trade.setting.closeConfirmation
export const tradeSettingChartPositionSelector = (state: RootStoreState) => state.trade.setting.chartPosition
