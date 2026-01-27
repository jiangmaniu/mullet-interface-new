import { DarkTheme, Theme, ThemeProvider } from '@react-navigation/native'
import { AppKitProvider } from '@reown/appkit-react-native'
import { ThemeController } from '@reown/appkit-core-react-native'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useUniwind, Uniwind } from 'uniwind'
import { PrivyElements } from '@privy-io/expo/ui'
import { AppKit, appKit } from '@/lib/appkit'
import { AuthInitializer } from './auth-initializer'
import { I18nProvider } from '@lingui/react'
import { EXPO_CONFIG_EXTRA } from '@/constants/expo'
import { dynamicActivate, i18n, initialLocale } from '@/locales/i18n'
import { PrivyProvider } from '@privy-io/expo'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { IconoirProvider } from 'iconoir-react-native'
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [isI18nLoaded, setIsI18nLoaded] = useState(false)
  const { theme } = useUniwind()
  const { colorBrandPrimary, backgroundColorSecondary, textColorContent1, colorBrandDefault, backgroundColorCard } = useThemeColors()

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

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
    dynamicActivate(initialLocale).then(() => {
      setIsI18nLoaded(true)
    })
  }, [])

  // 同步 Uniwind 主题到 AppKit
  useEffect(() => {
    const appKitTheme = theme === 'dark' ? 'dark' : 'light'
    ThemeController.setThemeMode(appKitTheme)
  }, [theme])

  if (!isI18nLoaded) {
    return null // Or a loading spinner / Splash Screen logic
  }

  if (!fontsLoaded) {
    return null
  }

  return (
    <I18nProvider i18n={i18n}>
      <ThemeProvider value={UniwindDarkTheme}>
        <IconoirProvider iconProps={{ color: textColorContent1 }}>
          {/* AppKit Provider - 必须在使用 AppKit hooks 的组件之上 */}
          <AppKitProvider instance={appKit}>
            <PrivyProvider appId={EXPO_CONFIG_EXTRA.PRIVY_APP_ID} clientId={EXPO_CONFIG_EXTRA.PRIVY_CLIENT_ID}>

              {/* 认证状态初始化：将 Privy token 同步到后端 */}
              <AuthInitializer>
                {children}
              </AuthInitializer>

              {/* Privy UI Elements */}
              <PrivyElements
                config={{
                  appearance: {
                    colorScheme: theme === 'dark' ? 'dark' : 'light',
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
  )
}
