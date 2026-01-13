import { isPCByWidth } from '@/v1/utils'

import { STORAGE_GET_PLATFORM_CONFIG } from '../utils/storage'
import serverConf from './server'

export const PLATFORM_DEFAULT_CONFIG = {
  name: 'Mullet',
  websiteUrl: 'www.mullet.top',
  CLIENT_ID_PC: 'trade-pc-client',
  CLIENT_SECRET_PC: 'trade-pc-client-secret',
  CLIENT_ID_H5: 'trade-h5-client',
  CLIENT_SECRET_H5: 'trade-h5-client-secret',
  ws: 'wss://websocket-test.mullet.top/websocketServer',
  imgDomain: 'https://file-test.mullet.top/trade/',
  domain: 'https://client-test.mullet.top',
  REGISTER_MODULE: true,
  SKIP_KYC_STEP_ONE: true,
  ID_CARD_ONLY: true,
  SHOW_QUOTE_CATEGORY_ALL_TAB: true,
  HIDE_ACCOUNT_TRANSFER: false,
  HIDE_CREATE_ACCOUNT: false,
  HIDE_ACCOUNT_RENAME: false,
  DEBUG: false,
  HIDE_SWITCH_LANGUAGE: false,
  salesmartlyJSUrl: 'https://plugin-code.salesmartly.com/js/project_247867_254558_1739880055.js',
  KYC_FACE: false,
}

export type IPlatformConfig = Partial<typeof PLATFORM_DEFAULT_CONFIG> & {
  // 客户端ID
  CLIENT_ID: string
  // 秘钥
  CLIENT_SECRET: string
}

export const getEnv = () => {
  // 客户端环境变量-通过请求public/platform/config.json动态获取的配置
  const clientConf = STORAGE_GET_PLATFORM_CONFIG() || {}

  const env = {
    ...clientConf,
    // 优先使用构建时传入的变量覆盖
    ...serverConf,
  }

  // 区分pc和h5秘钥
  env.CLIENT_ID = isPCByWidth() ? env.CLIENT_ID_PC : env.CLIENT_ID_H5
  env.CLIENT_SECRET = isPCByWidth() ? env.CLIENT_SECRET_PC : env.CLIENT_SECRET_H5

  return env as IPlatformConfig
}
