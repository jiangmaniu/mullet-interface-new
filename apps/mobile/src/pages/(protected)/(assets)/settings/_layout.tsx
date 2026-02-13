import { Stack } from 'expo-router';

export default function AssetsLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="about/index" />
		</Stack>
	);
}
