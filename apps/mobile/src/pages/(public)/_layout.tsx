import { Stack } from 'expo-router';

export default function PublicLayout() {
  return (
    <Stack >
      <Stack.Screen name="login/index" options={{ headerShown: false, gestureEnabled: false, animation: 'slide_from_bottom', }} />
    </Stack>
  );
}
