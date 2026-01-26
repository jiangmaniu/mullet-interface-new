import { DarkTheme, Theme, ThemeProvider } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'

import { I18nProvider } from '@lingui/react'

import { EXPO_CONFIG_EXTRA } from '@/constants/expo'
import { dynamicActivate, i18n, initialLocale } from '@/locales/i18n'
import { PrivyProvider } from '@privy-io/expo'
import { Uniwind } from 'uniwind'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { IconoirProvider } from 'iconoir-react-native'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [isI18nLoaded, setIsI18nLoaded] = useState(false)

  const { colorBrandPrimary, backgroundColorSecondary, textColorContent1, colorBrandDefault, backgroundColorCard } = useThemeColors()

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

  if (!isI18nLoaded) {
    return null // Or a loading spinner / Splash Screen logic
  }

  
  return (
    <I18nProvider i18n={i18n}>
      <ThemeProvider value={UniwindDarkTheme}>
        <IconoirProvider iconProps={{ color: textColorContent1 }}>
          <PrivyProvider appId={EXPO_CONFIG_EXTRA.PRIVY_APP_ID} clientId={EXPO_CONFIG_EXTRA.PRIVY_CLIENT_ID}>
            {children}
          </PrivyProvider>
        </IconoirProvider>
      </ThemeProvider>
    </I18nProvider>
  )
}
