import Constants from 'expo-constants'

import { EXPO_ENV_CONFIG } from '@/constants/expo'

const appScheme = (Constants.expoConfig?.scheme as string) ?? 'mullet'

/**
 * 生成 universal link 地址
 * @param appPath App 内跳转路径，例如 '/login'、'/trade'
 * @returns 完整的 universal link，例如 'https://client-test.mullet.top/app-redirect/login?__scheme=mullet-dev'
 */
export function getUniversalLink(appPath: string) {
  const path = appPath.startsWith('/') ? appPath : `/${appPath}`
  return `${EXPO_ENV_CONFIG.WEBSITE_URL}/app-redirect${path}?__scheme=${appScheme}`
}
