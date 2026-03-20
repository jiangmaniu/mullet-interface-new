import { useCallback } from 'react'
import semver from 'semver'

import { useVersionCheckApi } from '@/components/app-update/_apis/use-app-version'
import { EXPO_ENV_CONFIG } from '@/constants/expo'
import { useAppUpdateStore } from '@/stores/app-update'

export function useVersionCheck() {
  const setUpdateInfo = useAppUpdateStore((s) => s.setUpdateInfo)
  const clearUpdate = useAppUpdateStore((s) => s.clearUpdate)
  const { refetch } = useVersionCheckApi()

  const checkUpdate = useCallback(async () => {
    try {
      const currentVersion = EXPO_ENV_CONFIG.APP_VERSION

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

      setUpdateInfo({
        latestVersion: serverVersion,
        updateContent: update.releaseNotes || null,
        downloadUrl: update.downloadUrl || null,
        isForceUpdate: !!isForce,
      })

      return { hasUpdate: true, isForce: !!isForce, version: serverVersion }
    } catch {
      clearUpdate()
      return { hasUpdate: false }
    }
  }, [setUpdateInfo, clearUpdate, refetch])

  return { checkUpdate }
}
