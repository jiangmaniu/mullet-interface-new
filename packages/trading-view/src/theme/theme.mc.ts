import { ThemeName } from 'public/static/charting_library/charting_library'

import { ThemeConst } from './theme'

/**
 * mc项目主题色
 * tradingview主题颜色变量
 * // https://www.tradingview.com/charting-library-docs/latest/customization/styles/CSS-Color-Themes/
 */
export const MC_TradingviewThemeCssVar = (theme: ThemeName) => {
  const primary = ThemeConst.primary
  const isDark = theme === 'dark'
  const commonThemeConfig = {
    /* 放置所有元素的页面的主颜色 */
    // '--tv-color-platform-background': primary,
    // /* 工具栏背景颜色 */
    // '--tv-color-pane-background': isDark ? ThemeConst.black : ThemeConst.white
    // /* 工具栏按钮的悬停效果颜色 */
    // '--tv-color-toolbar-button-background-hover': primary,
    // /* 右侧工具栏上活动按钮的悬停效果颜色 */
    // '--tv-color-toolbar-button-background-expanded': primary,
    // /* 右侧工具栏上活动按钮的背景颜色 */
    // '--tv-color-toolbar-button-background-active': 'rgb(249, 185, 233)',
    // /* 将鼠标悬停在右侧工具栏上的活动按钮上时的背景颜色 */
    // '--tv-color-toolbar-button-background-active-hover': primary,
    // /* 工具栏按钮的文本和图标颜色 */
    // '--tv-color-toolbar-button-text': primary,
    // /* 将鼠标悬停在工具栏按钮上时的文本和图标颜色 */
    // '--tv-color-toolbar-button-text-hover': 'rgb(74, 20, 140)',
    /* 活动工具栏按钮的文本和图标颜色 */
    // '--tv-color-toolbar-button-text-active': primary,
    // /* 将鼠标悬停在工具栏按钮上时处于活动状态的文本和图标颜色 */
    // '--tv-color-toolbar-button-text-active-hover': primary
    /* 切换工具栏按钮的文本颜色（例如磁铁模式、锁定所有绘图） */
    // '--tv-color-item-active-text': primary,
    // /* 切换工具栏按钮的填充颜色（例如磁铁模式、锁定所有绘图） */
    // '--tv-color-toolbar-toggle-button-background-active': primary,
    // /* 将鼠标悬停在切换工具栏按钮上时的填充颜色（例如磁铁模式、锁定所有绘图） */
    // '--tv-color-toolbar-toggle-button-background-active-hover': primary,
    // /* 工具栏分隔线颜色 */
    // '--tv-color-toolbar-divider-background': 'rgb(251, 223, 244)',
    // /* 工具栏保存布局按钮的加载器颜色 */
    // '--tv-color-toolbar-save-layout-loader': 'rgb(106, 109, 120)',
    /*
      弹出菜单变量
      当用户单击工具栏图标时会出现弹出/弹出菜单，并且通常是锚定到该图标的菜单。
      弹出菜单通常呈现与图标上下文或用户正在执行的当前任务相关的工具、选项或命令的列表。这些样式选项也适用于上下文菜单。
    */
    // '--tv-color-popup-background': 'rgb(241, 188, 225)',
    // '--tv-color-popup-element-text': '#fff',
    // '--tv-color-popup-element-text-hover': 'rgb(74, 20, 140)',
    // '--tv-color-popup-element-background-hover': primary,
    // '--tv-color-popup-element-divider-background': 'rgb(251, 223, 244)',
    // '--tv-color-popup-element-secondary-text': 'rgb(74, 20, 140)',
    // '--tv-color-popup-element-hint-text': 'rgb(74, 20, 140)',
    // '--tv-color-popup-element-text-active': 'rgb(6, 6, 255)',
    // '--tv-color-popup-element-background-active': 'red',
    // '--tv-color-popup-element-toolbox-text': 'rgb(136, 24, 79)',
    // '--tv-color-popup-element-toolbox-text-hover': 'rgb(74, 20, 140)',
    // '--tv-color-popup-element-toolbox-text-active-hover': 'rgb(74, 20, 140)',
    // '--tv-color-popup-element-toolbox-background-hover': 'rgb(222, 89, 132)',
    // '--tv-color-popup-element-toolbox-background-active-hover': 'magenta'
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
