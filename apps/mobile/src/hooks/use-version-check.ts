import { useCallback } from 'react'
import { Platform } from 'react-native'
import semver from 'semver'

import { type AndroidArch, useVersionCheckApi } from '@/components/app-update/_apis/use-app-version'
import { EXPO_ENV_CONFIG } from '@/constants/expo'
import { useAppUpdateStore } from '@/stores/app-update'

/**
 * 获取当前设备的 CPU 架构
 */
function getDeviceArch(): AndroidArch {
  if (Platform.OS !== 'android') return 'arm64-v8a'

  // @ts-expect-error - Platform.constants.CPU_ABI 在 Android 上存在
  const cpuAbi = Platform.constants.CPU_ABI as string | undefined

  // 匹配架构
  if (cpuAbi?.includes('arm64')) return 'arm64-v8a'
  if (cpuAbi?.includes('armeabi')) return 'armeabi-v7a'
  if (cpuAbi?.includes('x86_64')) return 'x86_64'
  if (cpuAbi?.includes('x86')) return 'x86'

  // 默认降级到 arm64-v8a（覆盖 95% 设备）
  return 'arm64-v8a'
}

/**
 * 从服务端返回的下载链接中选择合适的架构
 */
function selectDownloadUrl(androidUrl: string | Record<string, string> | undefined): string | null {
  if (!androidUrl) return null

  // 如果是字符串，直接返回（通用 APK）
  if (typeof androidUrl === 'string') return androidUrl

  // 如果是对象，根据设备架构选择
  const arch = getDeviceArch()
  const url = androidUrl[arch]

  // 如果当前架构没有对应的 APK，降级到 arm64-v8a
  return url || androidUrl['arm64-v8a'] || null
}

export function useVersionCheck() {
  const setUpdateInfo = useAppUpdateStore((s) => s.setUpdateInfo)
  const clearUpdate = useAppUpdateStore((s) => s.clearUpdate)
  const { refetch } = useVersionCheckApi()

  const checkUpdate = useCallback(async () => {
    try {
      const currentVersion = EXPO_ENV_CONFIG.APP_VERSION
      const platform = Platform.OS as 'ios' | 'android'

      const { data: update } = await refetch()

      if (!update?.hasUpdate) {
        clearUpdate()
        return { hasUpdate: false }
      }

      const serverVersion = update.latestVersion

      // semver 校验
      if (
        !serverVersion ||
        !semver.valid(serverVersion) ||
        !semver.valid(currentVersion) ||
        !semver.gt(serverVersion, currentVersion)
      ) {
        clearUpdate()
        return { hasUpdate: false }
      }

      // 判断强制更新：服务端标记 或 低于最低支持版本
      const isForce =
        update.isForceUpdate ||
        (update.minSupportVersion &&
          semver.valid(update.minSupportVersion) &&
          semver.lt(currentVersion, update.minSupportVersion)) ||
        false

      // 根据平台和架构选择下载链接
      const downloadUrl =
        platform === 'ios' ? update.downloadUrl.ios : selectDownloadUrl(update.downloadUrl.android)

      if (!downloadUrl) {
        clearUpdate()
        return { hasUpdate: false }
      }

      setUpdateInfo({
        latestVersion: serverVersion,
        updateContent: update.releaseNotes || null,
        downloadUrl,
        isForceUpdate: !!isForce,
        fileSize: update.fileSize,
      })

      return { hasUpdate: true, isForce: !!isForce, version: serverVersion }
    } catch {
      clearUpdate()
      return { hasUpdate: false }
    }
  }, [setUpdateInfo, clearUpdate, refetch])

  return { checkUpdate }
}
