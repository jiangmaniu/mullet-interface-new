import { ThemeName } from 'public/static/charting_library/charting_library'

import { ThemeConst } from './theme'

/**
 * mullet项目主题色
 * tradingview主题颜色变量
 * // https://www.tradingview.com/charting-library-docs/latest/customization/styles/CSS-Color-Themes/
 */
export const MULLET_TradingviewThemeCssVar = (theme: ThemeName) => {
  const primary = ThemeConst.primary // #eed94c 品牌黄色
  const isDark = theme === 'dark'

  const commonThemeConfig = {
    /* ---- 工具栏按钮 ---- */
    '--tv-color-toolbar-button-text': ThemeConst.textContent3,
    '--tv-color-toolbar-button-text-hover': ThemeConst.textContent1,
    '--tv-color-toolbar-button-text-active': primary,
    '--tv-color-toolbar-button-text-active-hover': primary,

    /* ---- 切换按钮 ---- */
    '--tv-color-toolbar-toggle-button-background-active': primary,
    '--tv-color-toolbar-toggle-button-background-active-hover': primary,

    /* ---- 激活项文本 ---- */
    '--tv-color-item-active-text': ThemeConst.black // 黄底上的深色前景
  }

  return {
    ...commonThemeConfig,
    ...(isDark
      ? {
          /* ---- 背景 ---- */
          '--tv-color-pane-background': ThemeConst.black,
          '--tv-color-platform-background': ThemeConst.black,

          /* ---- 工具栏 ---- */
          '--tv-color-toolbar-button-background-hover': ThemeConst.bgPrimary,
          '--tv-color-toolbar-button-background-expanded': ThemeConst.bgPrimary,
          '--tv-color-toolbar-button-background-active': 'transparent',
          '--tv-color-toolbar-button-background-active-hover': 'transparent',
          '--tv-color-toolbar-divider-background': ThemeConst.separatorColor,
          '--tv-color-toolbar-save-layout-loader': primary,

          /* ---- 弹窗 / 对话框 / 底部弹窗 ---- */
          '--tv-color-popup-background': ThemeConst.bgPrimary,
          '--tv-color-popup-element-text': ThemeConst.textContent2,
          '--tv-color-popup-element-text-hover': ThemeConst.textContent1,
          '--tv-color-popup-element-text-active': ThemeConst.textContent1,
          '--tv-color-popup-element-background-active': 'rgba(101,104,134,0.2)',
          '--tv-color-popup-element-background-hover': 'rgba(101,104,134,0.15)',
          '--tv-color-popup-element-secondary-text': ThemeConst.textContent4,
          '--tv-color-popup-element-hint-text': ThemeConst.textContent4,
          '--tv-color-popup-element-divider-background': ThemeConst.separatorColor,

          /* ---- 弹窗工具箱（侧边栏绘图工具子菜单） ---- */
          '--tv-color-popup-element-toolbox-text': ThemeConst.textContent3,
          '--tv-color-popup-element-toolbox-text-hover': ThemeConst.textContent1,
          '--tv-color-popup-element-toolbox-text-active-hover': primary,
          '--tv-color-popup-element-toolbox-background-hover': 'rgba(101,104,134,0.15)',
          '--tv-color-popup-element-toolbox-background-active-hover': 'rgba(101,104,134,0.2)'
        }
      : {})
  }
}
