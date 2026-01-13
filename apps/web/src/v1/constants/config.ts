// 不区分平台的配置变量

import { STORAGE_GET_REGISTER_CODE } from '@/v1/utils/storage'

// 配置文件地址
export const CONFIG_URL = '/platform/config.js'

// https://dashboard.privy.io 聚合钱包配置
// 正式
export const PRIVY_APP_ID = 'cmbzwhjss024vl80oyqt6ege9'
export const PRIVY_CLIENT_ID = 'client-WY6ME6viJ5LPg8qjzwjdh7MzPpZWJfPv1yBeGEmz9o1Qk'
// Session Signer ID for server-side TRON transaction signing
export const PRIVY_SESSION_SIGNER_ID = 'fdfl30hvw9b8uybjukk3nawh'

export const getAppRegisterCode = () => {
  const code = STORAGE_GET_REGISTER_CODE()

  return code || '123456'
}
