import { Initializer } from "@/components/initializer";
import { LoginGuard } from "@/components/router-guard/login-guard";
import { Stack } from "expo-router";

export default function ProtectedLayout() {
  return (

    <LoginGuard>
      <Initializer>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(assets)" options={{ headerShown: false }} />
          <Stack.Screen name="(trade)" options={{ headerShown: false }} />
          <Stack.Screen name="(home)" options={{ headerShown: false }} />
          <Stack.Screen
            name="symbol-selector"
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />
        </Stack>
      </Initializer>
    </LoginGuard>

  )
}
