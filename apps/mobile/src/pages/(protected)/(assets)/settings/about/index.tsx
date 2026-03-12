import { Trans } from '@lingui/react/macro'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'

import { IconifyNavArrowRight } from '@/components/ui/icons'
import { IconAppLogoCircle } from '@/components/ui/icons/set/app-logo-circle'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Text } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'
import { EXPO_ENV_CONFIG } from '@/constants/expo'
import { useThemeColors } from '@/hooks/use-theme-colors'

import { ClearCacheModal } from './_comps/clear-cache-modal'
import { UpgradeModal } from './_comps/upgrade-modal'

export default function AboutScreen() {
  const { textColorContent4 } = useThemeColors()
  const [cacheSize, setCacheSize] = useState('137.97MB')
  const [clearCacheVisible, setClearCacheVisible] = useState(false)
  const [updateVisible, setUpdateVisible] = useState(false)
  const [newVersion, setNewVersion] = useState<string | null>(null)

  // 根据环境生成完整版本号：v{version}-{env} ({buildTime})
  const APP_VERSION = useMemo(() => {
    const { APP_VERSION: version, APP_ENV: env, BUILD_TIME: buildTime } = EXPO_ENV_CONFIG
    const versionStr = env === 'prod' ? `v${version}` : `v${version}-${env}`
    return `${versionStr} (${buildTime})`
  }, [])

  const handleCheckUpdate = useCallback(() => {
    // TODO: 替换为实际的版本检查 API
    const latestVersion: string = 'v1.1.0'
    if (latestVersion !== APP_VERSION) {
      setNewVersion(latestVersion)
    } else {
      toast.success('当前已是最新版本')
    }
  }, [APP_VERSION])

  useEffect(() => {
    handleCheckUpdate()
  }, [handleCheckUpdate])

  const handleClearCache = useCallback(() => {
    setClearCacheVisible(false)
    setCacheSize('0.00MB')
    toast.success('成功清除缓存')
  }, [])

  const handleConfirmUpdate = useCallback(() => {
    setUpdateVisible(false)
    // TODO: 实际更新逻辑，跳转到应用商店
  }, [])

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
        <Pressable onPress={() => {}}>
          <View className="h-[48px] flex-row items-center justify-between px-[32px]">
            <Text className="text-paragraph-p2 text-content-1">
              <Trans>服务条款</Trans>
            </Text>
            <IconifyNavArrowRight width={18} height={18} color={textColorContent4} />
          </View>
        </Pressable>

        {/* 隐私政策 */}
        <Pressable onPress={() => {}}>
          <View className="h-[48px] flex-row items-center justify-between px-[32px]">
            <Text className="text-paragraph-p2 text-content-1">
              <Trans>隐私政策</Trans>
            </Text>
            <IconifyNavArrowRight width={18} height={18} color={textColorContent4} />
          </View>
        </Pressable>

        {/* 检查更新 */}
        <Pressable onPress={newVersion ? () => setUpdateVisible(true) : handleCheckUpdate}>
          <View className="h-[48px] flex-row items-center justify-between px-[32px]">
            <Text className="text-paragraph-p2 text-content-1">
              <Trans>检查更新</Trans>
            </Text>
            <View className="gap-xs flex-row items-center">
              {newVersion ? (
                <>
                  <View className="bg-status-danger h-[8px] w-[8px] rounded-full" />
                  <Text className="text-paragraph-p2 text-content-4">发现新版本{newVersion}</Text>
                </>
              ) : (
                <Text className="text-paragraph-p2 text-content-4">{APP_VERSION} 当前最新版本</Text>
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
      <UpgradeModal visible={updateVisible} onClose={() => setUpdateVisible(false)} onConfirm={handleConfirmUpdate} />
    </View>
  )
}
