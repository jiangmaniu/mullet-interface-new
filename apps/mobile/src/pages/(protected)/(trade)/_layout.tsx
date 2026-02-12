import { Stack } from 'expo-router';

export default function TradeLayout() {
  return (
    <Stack>
      <Stack.Screen name="[symbol]" options={{ headerShown: false }} />
      <Stack.Screen name="records" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}
