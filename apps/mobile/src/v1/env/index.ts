import { STORAGE_GET_ENV, STORAGE_SET_ENV } from '@/v1/utils/storage'
import { Config } from '@/v1/platform/config'
import { EXPO_ENV_CONFIG } from '@/constants/expo'
import { isDomainAvailable } from '@/v1/utils/dns'

export type IEnv = typeof Config & {
  baseURL: string
  ws: string
  imgDomain: string
  websiteURL: string
  IMG_ENV: {
    LogoSmall: string
    LogoText: string
    LogoGray: string
    LogoHomeHeader: string
  }
}

// 读取缓存的env
export const getEnv = async (): Promise<IEnv> => {
  // 从环境变量获取基础配置
  const envConfig = {
    baseURL: EXPO_ENV_CONFIG.API_BASE_URL,
    ws: EXPO_ENV_CONFIG.WS_URL,
    imgDomain: EXPO_ENV_CONFIG.IMG_DOMAIN,
    websiteURL: EXPO_ENV_CONFIG.WEBSITE_URL,
  }

  let env: IEnv = {
    ...Config,
    ...envConfig,
    IMG_ENV: {
      LogoSmall: `${envConfig.websiteURL}/platform/img/app/logo-small.png`,
      LogoText: `${envConfig.websiteURL}/platform/img/app/logo-text.png`,
      LogoGray: `${envConfig.websiteURL}/platform/img/app/logo-gray.png`,
      LogoHomeHeader: `${envConfig.websiteURL}/platform/img/app/logo-home-header.png`
    }
  }

  try {
    // 尝试从本地存储获取覆盖配置
    const data = (await STORAGE_GET_ENV()) || {}
    env = {
      ...env,
      ...data,
      // 始终使用当前环境的 websiteURL，不使用缓存中的值
      websiteURL: envConfig.websiteURL,
      IMG_ENV: {
        LogoSmall: `${envConfig.websiteURL}/platform/img/app/logo-small.png`,
        LogoText: `${envConfig.websiteURL}/platform/img/app/logo-text.png`,
        LogoGray: `${envConfig.websiteURL}/platform/img/app/logo-gray.png`,
        LogoHomeHeader: `${envConfig.websiteURL}/platform/img/app/logo-home-header.png`
      }
    }
  } catch (e) {
    console.log('getEnv error:', e)
  }

  return env
}

// 环境配置文件到本地
export const setEnv = async (data: any) => {
  try {
    const env = {
      ...Config,
      baseURL: EXPO_ENV_CONFIG.API_BASE_URL,
      ws: EXPO_ENV_CONFIG.WS_URL,
      imgDomain: EXPO_ENV_CONFIG.IMG_DOMAIN,
      websiteURL: EXPO_ENV_CONFIG.WEBSITE_URL,
      ...data,
      updateTime: Date.now()
    }
    await STORAGE_SET_ENV(env)
  } catch (e) {
    console.log('setEnv error:', e)
  }
}

// 检查域名是否可用，如果不可用，则切换到备用域名
export const checkBaseURL = async (env: any) => {
  const ENVS = await getEnv()
  if (await checkHost(env.baseURL)) {
    return env.baseURL
  } else {
    if (await checkHost(env.bakURL)) {
      // 切换到备用域名
      return env.bakURL
    }
    // 如果都不可用，则返回默认域名
    return ENVS.baseURL
  }
}

// 检查域名是否可用
export const checkHost = async (domain: string) => {
  const ok = await isDomainAvailable(domain)
  console.log(`==== 检查域名${domain} 是否可用 ==== ${ok}`)
  return ok
}

// 获取远程配置
export const fetchRemoteConfig = async () => {
  try {
    const ENVS = await getEnv()

    // 开发环境不获取远程配置
    if (__DEV__) return

    const remoteConfigUrl = '/platform/app.json'
    const url = `${ENVS.baseURL}${remoteConfigUrl}`
    console.log('fetchRemoteConfig:', url)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      console.log('fetchRemoteConfig error: HTTP', response.status)
      return
    }

    const config = await response.json()

    if (typeof config === 'object') {
      // 检查域名是否可用: 主域名不可用时，切换到备用域名
      const availableBaseURL = await checkBaseURL(config)
      await setEnv({
        ...config,
        baseURL: availableBaseURL
      })
    }
  } catch (error: any) {
    console.log('fetchRemoteConfig error', error)
  }
}
