import { Initializer } from "@/components/initializer";
import { LoginGuard } from "@/components/router-guard/login-guard";
import { Stack } from "expo-router";

export default function ProtectedLayout() {
  return (

    <LoginGuard>
      <Initializer>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(assets)" />
          <Stack.Screen name="(trade)" />
          <Stack.Screen name="(home)" />
          <Stack.Screen name="symbol-selector" options={{ presentation: 'modal' }} />
        </Stack>
      </Initializer>
    </LoginGuard>

  )
}
