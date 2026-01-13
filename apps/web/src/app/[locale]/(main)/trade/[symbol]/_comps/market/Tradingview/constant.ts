// tradingview常量
import { ResolutionString } from '@/v1/libs/charting_library'
import { genStorageGet, genStorageSet, storageRemove } from '@/v1/utils/storage'

// tradingview图表配置
export const KEY_TRADINGVIEW_CHART_PROPS = 'tradingview.chartproperties'

// 本地存储-tradingview图表设置
export const STORAGE_GET_CHART_PROPS = genStorageGet(KEY_TRADINGVIEW_CHART_PROPS)
export const STORAGE_SET_CHART_PROPS = genStorageSet(KEY_TRADINGVIEW_CHART_PROPS)
export const STORAGE_REMOVE_CHART_PROPS = storageRemove(KEY_TRADINGVIEW_CHART_PROPS)

// 主题色配置
export const ThemeConst = {
  primary: '#183EFC',
  textPrimary: '#222',
  white: '#fff',
  black: '#161A1E', // 黑色主题背景色
  red: '#C54747',
  green: '#45A48A',
}

export const ThemeDark = {
  primary: '#f4f4f4',
  textPrimary: '#f4f4f4',
  red: '#F95050',
  green: '#29BE95',
}

// 默认展示的分辨率
export const defaultInterval = '15' as ResolutionString // 分辨率，时间间隔，例如1W代表每个条形1周的 默认周期  1/5/15/30/60/240-> 1/5/15/30/60/240分钟  D->一天   W->一周   M->一月
