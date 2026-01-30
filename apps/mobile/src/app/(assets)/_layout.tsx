import { Stack } from 'expo-router';

export default function AssetsLayout() {
	return (
		<Stack>
			<Stack.Screen name="transfer/index" options={{ headerShown: false }} />
			<Stack.Screen name="account/index" options={{ headerShown: false }} />
			<Stack.Screen name="bills/index" options={{ headerShown: false }} />
		</Stack>
	);
}
