import './global.css'
import React from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated'

import { Providers } from '@/components/providers'

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

export default function RootLayout() {

  return (
    <Providers>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(assets)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </Providers>
  )
}
