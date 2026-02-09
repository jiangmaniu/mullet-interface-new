import AsyncStorage from '@react-native-async-storage/async-storage'
import { Uniwind } from 'uniwind'
import { create } from 'zustand'

import { KEY_DIRECTION, KEY_ORDER_CONFIRM_CHECKED, KEY_POSITION_CONFIRM_CHECKED } from '@/v1/constants'

// 涨跌颜色方案
export type ColorScheme = 'green-up' | 'red-up'

// K线位置
export type ChartPosition = 'top' | 'bottom'

// 颜色参数，由外部组件通过 useCSSVariable 获取后传入
export interface TradeColors {
  tradeBuy: string   // --color-trade-buy 的值
  tradeSell: string  // --color-trade-sell 的值
}

interface TradeSettingsState {
  // 状态
  colorScheme: ColorScheme
  orderConfirmation: boolean
  closeConfirmation: boolean
  chartPosition: ChartPosition
  isHydrated: boolean

  // Actions
  setColorScheme: (scheme: ColorScheme, colors: TradeColors) => void
  setOrderConfirmation: (value: boolean) => void
  setCloseConfirmation: (value: boolean) => void
  setChartPosition: (position: ChartPosition) => void
  applyColorScheme: (colors: TradeColors) => void
  hydrate: () => Promise<void>
}

/**
 * 根据颜色方案应用 CSS 变量
 * 颜色值由外部组件通过 useCSSVariable 获取 --color-trade-buy / --color-trade-sell 后传入
 * - 绿涨红跌：market-rise = trade-buy, market-fall = trade-sell
 * - 红涨绿跌：market-rise = trade-sell, market-fall = trade-buy
 */
function applyColorSchemeWithColors(scheme: ColorScheme, colors: TradeColors) {
  const isGreenUp = scheme === 'green-up'
  Uniwind.updateCSSVariables('dark', {
    '--color-market-rise': isGreenUp ? colors.tradeBuy : colors.tradeSell,
    '--color-market-fall': isGreenUp ? colors.tradeSell : colors.tradeBuy,
  })
}

export const useTradeSettingsStore = create<TradeSettingsState>((set, get) => ({
  colorScheme: 'green-up',
  orderConfirmation: true,
  closeConfirmation: true,
  chartPosition: 'top',
  isHydrated: false,

  setColorScheme: (scheme, colors) => {
    applyColorSchemeWithColors(scheme, colors)
    AsyncStorage.setItem(KEY_DIRECTION, JSON.stringify(scheme))
    set({ colorScheme: scheme })
  },

  applyColorScheme: (colors) => {
    const { colorScheme } = get()
    applyColorSchemeWithColors(colorScheme, colors)
  },

  setOrderConfirmation: (value) => {
    AsyncStorage.setItem(KEY_ORDER_CONFIRM_CHECKED, JSON.stringify(value))
    set({ orderConfirmation: value })
  },

  setCloseConfirmation: (value) => {
    AsyncStorage.setItem(KEY_POSITION_CONFIRM_CHECKED, JSON.stringify(value))
    set({ closeConfirmation: value })
  },

  setChartPosition: (position) => {
    AsyncStorage.setItem('trade_chart_position', JSON.stringify(position))
    set({ chartPosition: position })
  },

  hydrate: async () => {
    try {
      const [directionRaw, orderRaw, closeRaw, chartRaw] = await Promise.all([
        AsyncStorage.getItem(KEY_DIRECTION),
        AsyncStorage.getItem(KEY_ORDER_CONFIRM_CHECKED),
        AsyncStorage.getItem(KEY_POSITION_CONFIRM_CHECKED),
        AsyncStorage.getItem('trade_chart_position'),
      ])

      const colorScheme: ColorScheme = directionRaw ? JSON.parse(directionRaw) : 'green-up'

      const orderConfirmation = orderRaw !== null ? JSON.parse(orderRaw) : true

      const closeConfirmation = closeRaw !== null ? JSON.parse(closeRaw) : true

      const chartPosition: ChartPosition = chartRaw ? JSON.parse(chartRaw) : 'top'

      // 注意：颜色方案的应用延迟到外部组件调用 applyColorScheme 时
      // 因为需要通过 useCSSVariable hook 获取颜色值

      set({
        colorScheme,
        orderConfirmation,
        closeConfirmation,
        chartPosition,
        isHydrated: true,
      })
    } catch (error) {
      console.error('Failed to hydrate trade settings:', error)
      set({ isHydrated: true })
    }
  },
}))
