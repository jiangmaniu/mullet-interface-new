import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }}>
      <Stack.Screen name="search" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
