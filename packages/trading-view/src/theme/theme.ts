import { PLATFORM } from '../constants'
import { CC_TradingviewThemeCssVar } from './theme.cc'
import { CDEX_TradingviewThemeCssVar } from './theme.cdex'
import { MC_TradingviewThemeCssVar } from './theme.mc'

// 各个项目的主色
export const PLATFORMThemeConst = {
  cdex: {
    primary: '#FFC238', // 按钮主色按钮
    textPrimary: '#C49002' // 文字主色按钮
  },
  mc: {},
  cc: {}
}[PLATFORM]

export const DEFAULT_COLOR = '#2962ff'
export const ThemeConst = {
  ...PLATFORMThemeConst,
  primary: PLATFORMThemeConst.primary || DEFAULT_COLOR,
  textPrimary: PLATFORMThemeConst.textPrimary || DEFAULT_COLOR,
  white: '#fff',
  black: '#1C192F', // 黑色主题背景色
  red: '#C54747',
  green: '#45A48A'
}

// 各个项目的tradingview主题css变量
export const getTradingviewThemeCssVar = {
  cdex: CDEX_TradingviewThemeCssVar,
  cc: CC_TradingviewThemeCssVar,
  mc: MC_TradingviewThemeCssVar
}[PLATFORM]
