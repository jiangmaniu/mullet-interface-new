import { Trans, useLingui } from '@lingui/react/macro'
import { useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import type { Locale } from '@/locales/i18n'

import { IconifyNavArrowRight } from '@/components/ui/icons'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Text } from '@/components/ui/text'
import { EXPO_ENV_CONFIG } from '@/constants/expo'
import { useI18n } from '@/hooks/use-i18n'
import { useLogout } from '@/hooks/use-logout'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { locales } from '@/locales/i18n'

import { LanguageDrawer } from './_comps/language-drawer'

export default function SettingScreen() {
  const router = useRouter()
  const { logout, isLoggingOut } = useLogout()
  const { textColorContent4 } = useThemeColors()
  const { locale } = useI18n()
  const [languageVisible, setLanguageVisible] = useState(false)

  const currentLocaleName = locales[locale] || '简体中文'

  // 根据环境生成完整版本号：v{version}-{env} ({buildTime})
  const appVersion = useMemo(() => {
    const { APP_VERSION: version, APP_ENV: env, BUILD_TIME: buildTime } = EXPO_ENV_CONFIG
    const versionStr = env === 'prod' ? `v${version}` : `v${version}-${env}`
    return `${versionStr} (${buildTime})`
  }, [])

  return (
    <View className="bg-secondary flex-1">
      <ScreenHeader content={<Trans>设置</Trans>} />

      <View className="gap-xl pt-xl">
        {/* 语言设置 */}
        <Pressable onPress={() => setLanguageVisible(true)}>
          <View className="px-xl h-[48px] flex-row items-center justify-between">
            <Text className="text-paragraph-p2 text-content-1">
              <Trans>语言设置</Trans>
            </Text>
            <View className="gap-xs flex-row items-center">
              <Text className="text-paragraph-p2 text-content-4">{currentLocaleName}</Text>
              <IconifyNavArrowRight width={18} height={18} color={textColorContent4} />
            </View>
          </View>
        </Pressable>

        {/* 设置资金密码 */}
        {/* <Pressable onPress={() => {}}>
          <View className="h-[48px] flex-row items-center justify-between px-xl">
            <Text className="text-paragraph-p2 text-content-1">
              <Trans>设置资金密码</Trans>
            </Text>
            <View className="flex-row items-center gap-xs">
              <Text className="text-paragraph-p2 text-content-4">
                <Trans>仅支持MPC登录方式设置</Trans>
              </Text>
              <IconifyNavArrowRight
                width={18}
                height={18}
                color={textColorContent4}
              />
            </View>
          </View>
        </Pressable> */}

        {/* 关于Mullet */}
        <Pressable onPress={() => router.push('/settings/about')}>
          <View className="px-xl h-[48px] flex-row items-center justify-between">
            <Text className="text-paragraph-p2 text-content-1">
              <Trans>关于Mullet</Trans>
            </Text>
            <View className="gap-xs flex-row items-center">
              <Text className="text-paragraph-p2 text-content-4">{appVersion}</Text>
              <IconifyNavArrowRight width={18} height={18} color={textColorContent4} />
            </View>
          </View>
        </Pressable>
      </View>

      {/* 退出登录 */}
      <View className="mt-xl">
        <Pressable onPress={logout}>
          <View className="flex w-full items-center justify-center px-3 py-3.5">
            <Text className="text-content-4 text-paragraph-p2">
              {isLoggingOut ? <Trans>退出中...</Trans> : <Trans>退出登录</Trans>}
            </Text>
          </View>
        </Pressable>
      </View>

      <LanguageDrawer visible={languageVisible} onClose={() => setLanguageVisible(false)} />
    </View>
  )
}
