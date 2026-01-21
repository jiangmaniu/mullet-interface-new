import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'

import { I18nProvider } from '@lingui/react'

import { EXPO_CONFIG_EXTRA } from '@/constants/expo'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { dynamicActivate, i18n, initialLocale } from '@/locales/i18n'
import { PrivyProvider } from '@privy-io/expo'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme()
  const [isI18nLoaded, setIsI18nLoaded] = useState(false)

  useEffect(() => {
    dynamicActivate(initialLocale).then(() => {
      setIsI18nLoaded(true)
    })
  }, [])

  if (!isI18nLoaded) {
    return null // Or a loading spinner / Splash Screen logic
  }

  return (
    <I18nProvider i18n={i18n}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <PrivyProvider appId={EXPO_CONFIG_EXTRA.PRIVY_APP_ID} clientId={EXPO_CONFIG_EXTRA.PRIVY_CLIENT_ID}>
          {children}
        </PrivyProvider>
      </ThemeProvider>
    </I18nProvider>
  )
}
