import './global.css'
import { Uniwind } from 'uniwind'
import React from 'react'

import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { Providers } from '@/components/providers'

export const unstable_settings = {
  anchor: '(tabs)',
}

export default function RootLayout() {
  React.useEffect(() => {
    Uniwind.setTheme('dark')
  }, [])
  return (
    <Providers>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </Providers>
  )
}
