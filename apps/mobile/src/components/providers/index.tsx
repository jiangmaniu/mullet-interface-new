import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'

import { EXPO_CONFIG_EXTRA } from '@/constants/expo'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { PrivyProvider } from '@privy-io/expo'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme()

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PrivyProvider appId={EXPO_CONFIG_EXTRA.PRIVY_APP_ID} clientId={EXPO_CONFIG_EXTRA.PRIVY_CLIENT_ID}>
        {children}
      </PrivyProvider>
    </ThemeProvider>
  )
}
