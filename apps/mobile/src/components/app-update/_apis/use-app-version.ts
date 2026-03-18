import { useQuery } from '@tanstack/react-query'
import { Platform } from 'react-native'

import { EXPO_ENV_CONFIG } from '@/constants/expo'
import { request } from '@/v1/utils/request'

/** 版本检查请求参数 */
export interface VersionCheckRequest {
  /** 平台 */
  platform: 'ios' | 'android'
  /** App 版本号 (如 "1.2.0") */
  appVersion: string
}

/** Android 架构类型 */
export type AndroidArch = 'arm64-v8a' | 'armeabi-v7a' | 'x86' | 'x86_64'

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
  /** 下载地址（按平台区分） */
  downloadUrl: {
    ios?: string
    /** Android 多架构下载链接（可以是单个 URL 或按架构分发的对象） */
    android?: Partial<Record<AndroidArch, string>> | string
  }
  /** 文件大小（字节，Android 多架构时为 arm64-v8a 的大小） */
  fileSize?: number
}

/**
 * 版本检查 API
 * POST /api/app/version/check
 */
export function useVersionCheckApi() {
  const platform = Platform.OS as 'ios' | 'android'
  const appVersion = EXPO_ENV_CONFIG.APP_VERSION

  return useQuery({
    queryKey: ['app-version-check', platform, appVersion],
    queryFn: async () => {
      const body: VersionCheckRequest = {
        platform,
        appVersion,
      }

      // Mock Data
      // const mockData: VersionCheckResponse = {
      //   hasUpdate: true,
      //   latestVersion: '0.0.2',
      //   isForceUpdate: false,
      //   minSupportVersion: '0.0.1',
      //   releaseNotes: '1. 新增钱包连接功能\n2. 修复交易页闪退问题\n3. 优化K线图表性能',
      //   downloadUrl: {
      //     ios: 'https://testflight.apple.com/join/ABCD1234',
      //     android: {
      //       'arm64-v8a':
      //         'https://client.mullet.top/app/test/download/android/Mullet-android-0.0.2-test-202603171836/Mullet-android-arm64-v8a-0.0.2-test-202603171836.apk',
      //       'armeabi-v7a':
      //         'https://client.mullet.top/app/test/download/android/Mullet-android-0.0.2-test-202603171836/Mullet-android-arm64-v8a-0.0.2-test-202603171836.apk',
      //     },
      //   },
      //   fileSize: 35 * 1024 * 1024, // 35MB (arm64-v8a)
      // }

      // return mockData

      const result = await request<API.Response<VersionCheckResponse>>('/api/app/version/check', {
        method: 'POST',
        data: body,
        skipAllErrorHandler: true,
        needToken: false,
      })

      return result.data ?? null
    },
    enabled: false,
  })
}
