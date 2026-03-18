import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AppState, InteractionManager } from 'react-native'
import type { AppStateStatus } from 'react-native'

import { useVersionCheck } from '@/hooks/use-version-check'
import { useAppUpdateStore } from '@/stores/app-update'

import { performNativeUpdate } from './_utils/native-update'
import { UpgradeModal } from './upgrade-modal'

const CHECK_INTERVAL = 30 * 60 * 1000 // 30 分钟

export function VersionCheckProvider({ children }: { children: React.ReactNode }) {
  const { checkUpdate } = useVersionCheck()
  const hasUpdate = useAppUpdateStore((s) => s.hasUpdate)
  const isForceUpdate = useAppUpdateStore((s) => s.isForceUpdate)
  const latestVersion = useAppUpdateStore((s) => s.latestVersion)
  const updateContent = useAppUpdateStore((s) => s.updateContent)
  const downloadUrl = useAppUpdateStore((s) => s.downloadUrl)
  const skippedVersion = useAppUpdateStore((s) => s.skippedVersion)
  const skipVersion = useAppUpdateStore((s) => s.skipVersion)

  const [showModal, setShowModal] = useState(false)
  const lastCheckRef = useRef(0)

  // 启动时延迟检查
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      checkUpdate()
      lastCheckRef.current = Date.now()
    })
    return () => task.cancel()
  }, [checkUpdate])

  // 前后台切换时检查（限制频率）
  useEffect(() => {
    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active' && Date.now() - lastCheckRef.current > CHECK_INTERVAL) {
        lastCheckRef.current = Date.now()
        checkUpdate()
      }
    }

    const sub = AppState.addEventListener('change', handleAppState)
    return () => sub.remove()
  }, [checkUpdate])

  // 有更新时决定是否弹窗
  useEffect(() => {
    if (!hasUpdate) {
      setShowModal(false)
      return
    }
    if (isForceUpdate) {
      setShowModal(true)
      return
    }
    // 非强制 + 跳过此版本 → 不显示
    if (skippedVersion === latestVersion) return
    setShowModal(true)
  }, [hasUpdate, isForceUpdate, latestVersion, skippedVersion])

  const handleUpdate = useCallback(() => {
    if (downloadUrl) {
      performNativeUpdate(downloadUrl)
    }
  }, [downloadUrl])

  const handleSkip = useCallback(() => {
    if (latestVersion) {
      skipVersion(latestVersion)
    }
    setShowModal(false)
  }, [latestVersion, skipVersion])

  return (
    <>
      {children}

      <UpgradeModal
        visible={showModal}
        onClose={handleSkip}
        onConfirm={handleUpdate}
        latestVersion={latestVersion ?? undefined}
        updateContent={updateContent}
        isForceUpdate={isForceUpdate}
      />
    </>
  )
}
