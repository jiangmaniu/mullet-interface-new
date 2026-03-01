import type { IChartingLibraryWidget } from 'public/static/charting_library'

let currentWidget: IChartingLibraryWidget | null = null

/**
 * 注册当前图表 Widget 实例
 * Bridge 通过 getWidget 获取实例，不长期持有引用
 */
export function registerWidget(widget: IChartingLibraryWidget): void {
  currentWidget = widget
}

/**
 * 注销 Widget 实例
 */
export function unregisterWidget(): void {
  currentWidget = null
}

/**
 * 获取当前注册的 Widget 实例
 */
export function getWidget(): IChartingLibraryWidget | null {
  return currentWidget
}
