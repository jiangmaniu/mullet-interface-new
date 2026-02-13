import { Stack } from 'expo-router';

export default function PublicLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login/index" options={{ gestureEnabled: false, animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
