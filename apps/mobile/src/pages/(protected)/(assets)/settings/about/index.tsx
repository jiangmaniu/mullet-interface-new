import { Trans } from '@lingui/react/macro'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'

import { performNativeUpdate } from '@/components/app-update/_utils/native-update'
import { UpgradeModal } from '@/components/app-update/upgrade-modal'
import { IconifyNavArrowRight } from '@/components/ui/icons'
import { IconAppLogoCircle } from '@/components/ui/icons/set/app-logo-circle'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Text } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'
import { EXPO_ENV_CONFIG } from '@/constants/expo'
import { useVersionCheck } from '@/hooks/use-version-check'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { useAppUpdateStore } from '@/stores/app-update'
import { clearAppCache, getCacheSize } from '@/lib/storage/cache'

import { ClearCacheModal } from './_comps/clear-cache-modal'

export default function AboutScreen() {
  const router = useRouter()
  const { textColorContent4 } = useThemeColors()
  const [cacheSize, setCacheSize] = useState('-')
  const [clearCacheVisible, setClearCacheVisible] = useState(false)
  const [updateVisible, setUpdateVisible] = useState(false)

  // 页面加载时读取真实缓存大小
  useEffect(() => {
    getCacheSize().then(setCacheSize)
  }, [])

  const { checkUpdate } = useVersionCheck()
  const hasUpdate = useAppUpdateStore((s) => s.hasUpdate)
  const latestVersion = useAppUpdateStore((s) => s.latestVersion)
  const updateContent = useAppUpdateStore((s) => s.updateContent)
  const downloadUrl = useAppUpdateStore((s) => s.downloadUrl)
  const isForceUpdate = useAppUpdateStore((s) => s.isForceUpdate)

  // 根据环境生成完整版本号：v{version}-{env} ({buildTime})
  const APP_VERSION = useMemo(() => {
    const { APP_VERSION: version, APP_ENV: env, BUILD_TIME: buildTime } = EXPO_ENV_CONFIG
    const versionStr = env === 'prod' ? `v${version}` : `v${version}-${env}`
    return `${versionStr} (${buildTime})`
  }, [])

  const handleCheckUpdate = useCallback(async () => {
    const result = await checkUpdate()
    if (result.hasUpdate) {
      setUpdateVisible(true)
    } else {
      toast.success('当前已是最新版本')
    }
  }, [checkUpdate])

  const handleClearCache = useCallback(async () => {
    setClearCacheVisible(false)
    try {
      await clearAppCache()
      setCacheSize('0.00 B')
      toast.success('成功清除缓存')
    } catch {
      toast.error('清除缓存失败')
    }
  }, [])

  const handleConfirmUpdate = useCallback(() => {
    setUpdateVisible(false)
    if (downloadUrl) {
      performNativeUpdate(downloadUrl)
    }
  }, [downloadUrl])

  return (
    <View className="bg-secondary flex-1">
      <ScreenHeader content={<Trans>关于Mullet</Trans>} />

      {/* Logo 区域 */}
      <View className="gap-medium mt-xl items-center py-[32px]">
        <IconAppLogoCircle width={80} height={80} />
        <View className="items-center">
          <Text className="text-title-h4 text-content-1">Mullet</Text>
          <Text className="text-paragraph-p1 text-content-4">{APP_VERSION}</Text>
        </View>
      </View>

      {/* 菜单项 */}
      <View className="gap-xl">
        {/* 服务条款 */}
        <Pressable onPress={() => router.push({ pathname: '/webview', params: { url: 'https://client.mullet.top/privacy/terms.html', title: '服务条款' } })}>
          <View className="h-[48px] flex-row items-center justify-between px-[32px]">
            <Text className="text-paragraph-p2 text-content-1">
              <Trans>服务条款</Trans>
            </Text>
            <IconifyNavArrowRight width={18} height={18} color={textColorContent4} />
          </View>
        </Pressable>

        {/* 隐私政策 */}
        <Pressable onPress={() => router.push({ pathname: '/webview', params: { url: 'https://client.mullet.top/privacy/privacy.html', title: '隐私政策' } })}>
          <View className="h-[48px] flex-row items-center justify-between px-[32px]">
            <Text className="text-paragraph-p2 text-content-1">
              <Trans>隐私政策</Trans>
            </Text>
            <IconifyNavArrowRight width={18} height={18} color={textColorContent4} />
          </View>
        </Pressable>

        {/* 检查更新 */}
        <Pressable onPress={hasUpdate ? () => setUpdateVisible(true) : handleCheckUpdate}>
          <View className="h-[48px] flex-row items-center justify-between px-[32px]">
            <Text className="text-paragraph-p2 text-content-1">
              <Trans>检查更新</Trans>
            </Text>
            <View className="gap-xs flex-row items-center">
              {hasUpdate ? (
                <>
                  <View className="bg-status-danger h-[8px] w-[8px] rounded-full" />
                  <Text className="text-paragraph-p2 text-content-4">
                    <Trans>发现新版本 v{latestVersion}</Trans>
                  </Text>
                </>
              ) : (
                <Text className="text-paragraph-p2 text-content-4">
                  <Trans>当前最新版本</Trans>
                </Text>
              )}
              <IconifyNavArrowRight width={18} height={18} color={textColorContent4} />
            </View>
          </View>
        </Pressable>

        {/* 清除缓存 */}
        <Pressable onPress={() => setClearCacheVisible(true)}>
          <View className="h-[48px] flex-row items-center justify-between px-[32px]">
            <Text className="text-paragraph-p2 text-content-1">
              <Trans>清除缓存</Trans>
            </Text>
            <View className="gap-xs flex-row items-center">
              <Text className="text-paragraph-p2 text-content-4">{cacheSize}</Text>
              <IconifyNavArrowRight width={18} height={18} color={textColorContent4} />
            </View>
          </View>
        </Pressable>
      </View>

      {/* 清除缓存确认 Modal */}
      <ClearCacheModal
        visible={clearCacheVisible}
        onClose={() => setClearCacheVisible(false)}
        onConfirm={handleClearCache}
      />

      {/* 更新版本 Modal */}
      <UpgradeModal
        visible={updateVisible}
        onClose={() => setUpdateVisible(false)}
        onConfirm={handleConfirmUpdate}
        latestVersion={latestVersion ?? undefined}
        updateContent={updateContent}
        isForceUpdate={isForceUpdate}
      />
    </View>
  )
}
