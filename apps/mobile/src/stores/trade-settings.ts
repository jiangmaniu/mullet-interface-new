import { mmkv } from '@/lib/storage/mmkv'
import { Uniwind } from 'uniwind'
import { create } from 'zustand'

import { KEY_DIRECTION, KEY_ORDER_CONFIRM_CHECKED, KEY_POSITION_CONFIRM_CHECKED } from '@/v1/constants'

// 涨跌颜色方案
export type ColorScheme = 'green-up' | 'red-up'

// K线位置
export type ChartPosition = 'top' | 'bottom'

// 交易颜色常量（对应 global.css 中的 --color-trade-* 变量）
const TRADE_COLORS = {
  buy: '#2ebc84', // --color-green-500
  sell: '#ff112f', // --color-red-500
  buyForeground: '#060717', // --color-zinc-800
  sellForeground: '#fff', // --color-white
} as const

interface TradeSettingsState {
  // 状态
  colorScheme: ColorScheme
  orderConfirmation: boolean
  closeConfirmation: boolean
  chartPosition: ChartPosition
  isHydrated: boolean

  // Actions
  setColorScheme: (scheme: ColorScheme) => void
  setOrderConfirmation: (value: boolean) => void
  setCloseConfirmation: (value: boolean) => void
  setChartPosition: (position: ChartPosition) => void
  applyColorScheme: () => void
  hydrate: () => Promise<void>
}

/**
 * 根据颜色方案应用 CSS 变量
 * - 绿涨红跌：market-rise = buy(绿), market-fall = sell(红)
 * - 红涨绿跌：market-rise = sell(红), market-fall = buy(绿)
 */
function applyColorSchemeWithColors(scheme: ColorScheme) {
  const isGreenUp = scheme === 'green-up'

  Uniwind.updateCSSVariables('dark', {
    '--color-trade-buy': isGreenUp ? TRADE_COLORS.buy : TRADE_COLORS.sell,
    '--color-trade-sell': isGreenUp ? TRADE_COLORS.sell : TRADE_COLORS.buy,
    '--color-trade-buy-foreground': isGreenUp ? TRADE_COLORS.buyForeground : TRADE_COLORS.sellForeground,
    '--color-trade-sell-foreground': isGreenUp ? TRADE_COLORS.sellForeground : TRADE_COLORS.buyForeground,
  })
}

export const useTradeSettingsStore = create<TradeSettingsState>((set, get) => ({
  colorScheme: 'green-up',
  orderConfirmation: true,
  closeConfirmation: true,
  chartPosition: 'top',
  isHydrated: false,

  setColorScheme: (scheme) => {
    applyColorSchemeWithColors(scheme)
    mmkv.set(KEY_DIRECTION, JSON.stringify(scheme))
    set({ colorScheme: scheme })
  },

  applyColorScheme: () => {
    const { colorScheme } = get()
    applyColorSchemeWithColors(colorScheme)
  },

  setOrderConfirmation: (value) => {
    mmkv.set(KEY_ORDER_CONFIRM_CHECKED, JSON.stringify(value))
    set({ orderConfirmation: value })
  },

  setCloseConfirmation: (value) => {
    mmkv.set(KEY_POSITION_CONFIRM_CHECKED, JSON.stringify(value))
    set({ closeConfirmation: value })
  },

  setChartPosition: (position) => {
    mmkv.set('trade_chart_position', JSON.stringify(position))
    set({ chartPosition: position })
  },

  hydrate: async () => {
    try {
      const directionRaw = mmkv.getString(KEY_DIRECTION)
      const orderRaw = mmkv.getString(KEY_ORDER_CONFIRM_CHECKED)
      const closeRaw = mmkv.getString(KEY_POSITION_CONFIRM_CHECKED)
      const chartRaw = mmkv.getString('trade_chart_position')

      const colorScheme: ColorScheme = directionRaw ? JSON.parse(directionRaw) : 'green-up'
      const orderConfirmation = orderRaw != null ? JSON.parse(orderRaw) : true
      const closeConfirmation = closeRaw != null ? JSON.parse(closeRaw) : true
      const chartPosition: ChartPosition = chartRaw ? JSON.parse(chartRaw) : 'top'

      // 直接应用颜色方案
      applyColorSchemeWithColors(colorScheme)

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
