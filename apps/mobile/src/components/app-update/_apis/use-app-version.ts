import { useQuery } from '@tanstack/react-query'
import { Platform } from 'react-native'
import DeviceInfo from 'react-native-device-info'

import { EXPO_ENV_CONFIG } from '@/constants/expo'
import { request } from '@/v1/utils/request'

/** Android 架构类型 */
export type AndroidArch = 'arm64-v8a' | 'armeabi-v7a' | 'x86' | 'x86_64'

/** 版本检查请求参数 */
export interface VersionCheckRequest {
  /** 平台 */
  platform: 'ios' | 'android'
  /** App 版本号 (如 "1.2.0") */
  appVersion: string
  /** Android 设备架构（可选，不传时服务端默认返回 arm64-v8a） */
  deviceArch?: AndroidArch
  /** 渠道 ID（可选） */
  channelId?: string
}

/** 版本检查响应 */
export interface VersionCheckResponse {
  /** 是否有更新 */
  hasUpdate: boolean
  /** 最新版本号 */
  latestVersion: string
  /** 是否强制更新 */
  isForceUpdate: boolean
  /** 最低支持版本（低于此版本强制更新） */
  minSupportVersion: string
  /** 更新日志 */
  releaseNotes: string
  /** 下载地址（服务端根据 platform + deviceArch 返回对应的单个 URL） */
  downloadUrl: string
}

/**
 * 获取当前设备的 CPU 架构
 * 使用 react-native-device-info 的 supportedAbis
 */
async function getDeviceArch(): Promise<AndroidArch> {
  if (Platform.OS !== 'android') return 'arm64-v8a'

  try {
    const abis = await DeviceInfo.supportedAbis()
    // console.log('🚀 ~ file: use-app-version.ts:48 ~ abis:', abis)
    // supportedAbis 返回按优先级排序的数组，第一个就是首选架构
    const primaryAbi = abis[0]

    if (primaryAbi?.includes('arm64')) return 'arm64-v8a'
    if (primaryAbi?.includes('armeabi')) return 'armeabi-v7a'
    if (primaryAbi?.includes('x86_64')) return 'x86_64'
    if (primaryAbi?.includes('x86')) return 'x86'
  } catch {}

  return 'arm64-v8a'
}

/**
 * 版本检查 API
 * GET /api/trade-node/app/version/check
 */
export function useVersionCheckApi() {
  const platform = Platform.OS as 'ios' | 'android'
  const appVersion = EXPO_ENV_CONFIG.APP_VERSION

  return useQuery({
    queryKey: ['app-version-check', platform, appVersion],
    queryFn: async () => {
      const params: VersionCheckRequest = {
        platform,
        appVersion,
        ...(platform === 'android' && { deviceArch: await getDeviceArch() }),
      }

      const result = await request<API.Response<VersionCheckResponse>>('/api/trade-node/app/version/check', {
        method: 'GET',
        params,
        skipAllErrorHandler: true,
        needToken: false,
      })

      return result.data ?? null
    },
    enabled: false,
  })
}
