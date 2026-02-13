import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { LogBox } from 'react-native'
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated'

import { Providers } from '@/components/providers'

// Suppress Expo Router warnings for files in _ prefixed directories (_comps, _hooks, etc.)
LogBox.ignoreLogs([/missing the required default export/])

// Disable strict mode warnings from Reanimated
// These warnings are triggered by third-party libraries (react-native-collapsible-tab-view)
// that read shared values during render, which we cannot fix without forking the library
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
})

export const unstable_settings = {
  anchor: '(tabs)',
}

// Note: StrictMode is disabled due to findNodeHandle deprecation warnings
// from react-native-pager-view (used by react-native-collapsible-tab-view)
// Re-enable when the library is updated to use refs instead of findNodeHandle

export default function RootLayout() {
  return (
    <Providers>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(protected)" />
        <Stack.Screen name="(public)" />
      </Stack>
      <StatusBar style="auto" />
    </Providers >
  )
}
