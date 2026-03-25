import { I18nProvider } from '@lingui/react'
import { DarkTheme, Theme, ThemeProvider } from '@react-navigation/native'
import { ThemeController } from '@reown/appkit-core-react-native'
import { AppKitProvider } from '@reown/appkit-react-native'
import { IconoirProvider } from 'iconoir-react-native'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useFonts } from 'expo-font'
import * as SystemUI from 'expo-system-ui'
import { Uniwind, useUniwind } from 'uniwind'

import { VersionCheckProvider } from '@/components/app-update/version-check-provider'
import { Loading } from '@/components/ui/loading'
import { Toaster } from '@/components/ui/toast'
import { EXPO_ENV_CONFIG } from '@/constants/expo'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { AppKit, appKit } from '@/lib/appkit'
import { dynamicActivate, i18n, initialLocale } from '@/locales/i18n'
import { initStoreSubscribes } from '@/stores'
import { V1Provider } from '@/v1/provider'
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter'
import { PrivyProvider } from '@privy-io/expo'
import { PrivyElements } from '@privy-io/expo/ui'

import { InspectorProvider } from './inspector-provider'
import { QueryProvider } from './query-provider'
import { WalletStateInjector } from './wallet-state-injector'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [isI18nLoaded, setIsI18nLoaded] = useState(false)
  const { theme } = useUniwind()
  const { colorBrandPrimary, backgroundColorSecondary, textColorContent1, colorBrandDefault, backgroundColorCard } =
    useThemeColors()

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  })

  const UniwindDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: colorBrandPrimary,
      background: backgroundColorSecondary,
      card: backgroundColorCard,
      text: textColorContent1,
      border: colorBrandDefault,
      notification: '#ffffff',
    },
  }

  useEffect(() => {
    Uniwind.setTheme('dark')
    SystemUI.setBackgroundColorAsync(backgroundColorSecondary)
    dynamicActivate(initialLocale).then(() => {
      setIsI18nLoaded(true)
      initStoreSubscribes()
    })
  }, [])

  // 同步 Uniwind 主题到 AppKit
  useEffect(() => {
    const appKitTheme = theme === 'dark' ? 'dark' : 'light'
    ThemeController.setDefaultThemeMode(appKitTheme)
  }, [theme])

  if (!isI18nLoaded) {
    return null // Or a loading spinner / Splash Screen logic
  }

  if (!fontsLoaded) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <InspectorProvider>
        <QueryProvider>
          <I18nProvider i18n={i18n}>
            <ThemeProvider value={UniwindDarkTheme}>
              <IconoirProvider iconProps={{ color: textColorContent1 }}>
                {/* AppKit Provider - 必须在使用 AppKit hooks 的组件之上 */}
                <AppKitProvider instance={appKit}>
                  <PrivyProvider appId={EXPO_ENV_CONFIG.PRIVY_APP_ID} clientId={EXPO_ENV_CONFIG.PRIVY_CLIENT_ID}>
                    {/* 注入钱包状态到 auth-handler */}
                    <WalletStateInjector>
                      <V1Provider>
                        <VersionCheckProvider>{children}</VersionCheckProvider>
                      </V1Provider>
                      <Toaster position="center" />
                      <Loading />
                    </WalletStateInjector>
                    {/* Privy UI Elements */}
                    <PrivyElements
                      config={{
                        appearance: {
                          colorScheme: theme === 'dark' ? 'dark' : 'light',
                          accentColor: '#EED94C',
                        },
                      }}
                    />

                    {/* AppKit Modal for wallet connection */}
                    {/* Expo Router Android workaround: https://docs.reown.com/appkit/react-native/core/installation#4-render-appkit-ui */}
                    <View style={{ position: 'absolute', height: '100%', width: '100%', pointerEvents: 'box-none' }}>
                      <AppKit />
                    </View>
                  </PrivyProvider>
                </AppKitProvider>
              </IconoirProvider>
            </ThemeProvider>
          </I18nProvider>
        </QueryProvider>
      </InspectorProvider>
    </GestureHandlerRootView>
  )
}
