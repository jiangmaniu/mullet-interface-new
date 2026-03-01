import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

/** 项目根路径，用于静态资源 */
export const BASE_PATH = (publicRuntimeConfig.BASE_PATH as string) || undefined

/** K 线历史数据 API 基地址，可通过 env KLINE_API_BASE 或 next.config publicRuntimeConfig 覆盖 */
export const KLINE_API_BASE =
  (publicRuntimeConfig.KLINE_API_BASE as string) || 'https://mt.cd-ex.io'
