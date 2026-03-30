import { Stack } from 'expo-router'

export default function TradeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[symbol]" />
      <Stack.Screen name="records/index" />
      <Stack.Screen name="settings" />
    </Stack>
  )
}
