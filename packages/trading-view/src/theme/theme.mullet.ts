import { ThemeName } from 'public/static/charting_library/charting_library'

import { ThemeConst } from './theme'

/**
 * mullet项目主题色
 * tradingview主题颜色变量
 * // https://www.tradingview.com/charting-library-docs/latest/customization/styles/CSS-Color-Themes/
 */
export const MULLET_TradingviewThemeCssVar = (theme: ThemeName) => {
  const primary = ThemeConst.primary
  const isDark = theme === 'dark'
  const commonThemeConfig = {
    /* 活动工具栏按钮的文本和图标颜色 */
    // '--tv-color-toolbar-button-text-active': primary,
    // /* 将鼠标悬停在工具栏按钮上时处于活动状态的文本和图标颜色 */
    // '--tv-color-toolbar-button-text-active-hover': primary,
    /* 切换工具栏按钮的填充颜色 */
    // '--tv-color-toolbar-toggle-button-background-active': primary,
    // '--tv-color-toolbar-toggle-button-background-active-hover': primary,
  }
  return {
    ...commonThemeConfig,
    ...(isDark
      ? {
          '--tv-color-pane-background': ThemeConst.black
        }
      : {})
  }
}
