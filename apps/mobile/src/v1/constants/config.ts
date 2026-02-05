import { Config } from '@/v1/platform/config'

export const NAMESPACE = Config.NAMESPACE

export const SOURCE_CURRENCY = 'USD' // 源货币
export const DEFAULT_CURRENCY_DECIMAL = 2 // 默认货币精度
export const FIXED_ZERO_VALUE = '0.00' // 固定 0 值
export const DEFAULT_AREA_CODE = '86' // 默认区域码
export const DEFAULT_LEVERAGE_MULTIPLE = 1 // 默认杠杆倍数

// 接口防重放appKey
export const REPLAY_PROTECTION_APP_KEY = 'KblZBTQ5t7TLYsif5SVs7fcJbpUj7igu'

export const WEBVIEW_AUTHRORIZATION_URI = '/app/authorization'

// 渠道配置
export const CHANNEL_CONFIG = {
  CHANNEL_NAME: 'Google', // 渠道名称 例如oppo huawei vivo
  CHANNEL_ID: '123456' // 渠道号

  // 1010 ~1014 渠道包
  // CHANNEL_NAME: '1010',
  // CHANNEL_ID: '1010'

  // CHANNEL_NAME: '1011',
  // CHANNEL_ID: '1011'

  // CHANNEL_NAME: '1012',
  // CHANNEL_ID: '1012'

  // CHANNEL_NAME: '1013',
  // CHANNEL_ID: '1013'

  // CHANNEL_NAME: '1014',
  // CHANNEL_ID: '1014'
}
