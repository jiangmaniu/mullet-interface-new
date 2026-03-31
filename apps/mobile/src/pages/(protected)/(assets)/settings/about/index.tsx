import { Trans } from '@lingui/react/macro'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'

import { performNativeUpdate } from '@/components/app-update/_utils/native-update'
import { UpgradeModal } from '@/components/app-update/upgrade-modal'
import { IconifyNavArrowRight } from '@/components/ui/icons'
import { IconAppLogoCircle } from '@/components/ui/icons/set/app-logo-circle'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Text } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'
import { useAppCurrentVersion } from '@/hooks/common/use-app-version'
import { useI18n } from '@/hooks/use-i18n'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { useVersionCheck } from '@/hooks/use-version-check'
import { clearAppCache, formatBytes, getCacheSize } from '@/lib/storage/cache'
import { useAppUpdateStore } from '@/stores/app-update'
import { msg } from '@lingui/core/macro'
import { BNumber } from '@mullet/utils/number'

import { ClearCacheModal } from './_comps/clear-cache-modal'

const CACHE_SIZE_DECIMAlS = 2

export default function AboutScreen() {
  const router = useRouter()
  const { textColorContent4 } = useThemeColors()
  // const [cacheSize, setCacheSize] = useState('0')
  const [clearCacheVisible, setClearCacheVisible] = useState(false)
  const [updateVisible, setUpdateVisible] = useState(false)
  const { renderLinguiMsg } = useI18n()

  const { data: appCacheSize, refetch: refetchAppCacheSize } = useQuery({
    queryKey: ['app-cache-size'],
    queryFn: async (): Promise<string> => {
      const size = await getCacheSize()
      return size
    },
    initialData: '0',
  })
  // 页面加载时读取真实缓存大小
  useEffect(() => {
    // getCacheSize().then(setCacheSize)
  }, [])

  const { checkUpdate } = useVersionCheck()
  const hasUpdate = useAppUpdateStore((s) => s.hasUpdate)
  const latestVersion = useAppUpdateStore((s) => s.latestVersion)
  const updateContent = useAppUpdateStore((s) => s.updateContent)
  const downloadUrl = useAppUpdateStore((s) => s.downloadUrl)
  const isForceUpdate = useAppUpdateStore((s) => s.isForceUpdate)

  const { appCurrentVersion } = useAppCurrentVersion()

  const handleCheckUpdate = useCallback(async () => {
    const result = await checkUpdate()
    if (result.hasUpdate) {
      setUpdateVisible(true)
    } else {
      toast.success('当前已是最新版本')
    }
  }, [checkUpdate])

  const handleClearCache = useCallback(async () => {
    try {
      await clearAppCache()
      // setCacheSize('0')
      await refetchAppCacheSize()
      toast.success('成功清除缓存')
      setClearCacheVisible(false)
    } catch {
      toast.error('清除缓存失败')
    }
  }, [refetchAppCacheSize])

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
          <Text className="text-paragraph-p1 text-content-4">{appCurrentVersion}</Text>
        </View>
      </View>

      {/* 菜单项 */}
      <View className="gap-xl">
        {/* 服务条款 */}
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/webview',
              params: { url: 'https://client.mullet.top/privacy/terms.html', title: renderLinguiMsg(msg`服务条款`) },
            })
          }
        >
          <View className="h-[48px] flex-row items-center justify-between px-[32px]">
            <Text className="text-paragraph-p2 text-content-1">
              <Trans>服务条款</Trans>
            </Text>
            <IconifyNavArrowRight width={18} height={18} color={textColorContent4} />
          </View>
        </Pressable>

        {/* 隐私政策 */}
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/webview',
              params: { url: 'https://client.mullet.top/privacy/privacy.html', title: renderLinguiMsg(msg`隐私政策`) },
            })
          }
        >
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
        <Pressable
          onPress={() => {
            if (BNumber.from(appCacheSize).lte(0)) {
              toast.info(<Trans>没有需要清理的缓存</Trans>)
              return
            }

            setClearCacheVisible(true)
          }}
        >
          <View className="h-[48px] flex-row items-center justify-between px-[32px]">
            <Text className="text-paragraph-p2 text-content-1">
              <Trans>清除缓存</Trans>
            </Text>
            <View className="gap-xs flex-row items-center">
              <Text className="text-paragraph-p2 text-content-4">
                {formatBytes(appCacheSize, { decimals: CACHE_SIZE_DECIMAlS })}
              </Text>
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
