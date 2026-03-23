import { Stack } from 'expo-router'

import { Initializer } from '@/components/initializer'
import { LoginGuard } from '@/components/router-guard/login-guard'
import { useAnnouncementListener } from '@/hooks/use-announcement-listener'

/** 登录后才监听公告推送 */
function AnnouncementListener() {
  useAnnouncementListener()
  return null
}

export default function ProtectedLayout() {
  return (
    <LoginGuard>
      <AnnouncementListener />
      <Initializer>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(assets)" />
          <Stack.Screen name="(trade)" />
          <Stack.Screen name="(home)" />
          <Stack.Screen name="webview/index" />
          <Stack.Screen name="symbol-selector" options={{ presentation: 'modal' }} />
        </Stack>
      </Initializer>
    </LoginGuard>
  )
}
