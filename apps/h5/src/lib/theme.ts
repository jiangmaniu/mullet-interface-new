import { getThemeSync, isInAppSync, on } from '@mullet/js-bridge/h5'
import { AppEvent } from '@mullet/js-bridge/types'

const DEFAULT_THEME = 'dark'

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

/** 初始化主题并监听变化，返回取消监听函数 */
export function initTheme(): () => void {
  const theme = isInAppSync() ? getThemeSync() : DEFAULT_THEME
  applyTheme(theme)

  if (!isInAppSync()) return () => {}
  return on(AppEvent.ThemeChanged, ({ theme }) => applyTheme(theme))
}
