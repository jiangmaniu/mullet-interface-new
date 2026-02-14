import { Stack } from 'expo-router';

export default function AssetsLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="transfer/index" />
			<Stack.Screen name="account/index" />
			<Stack.Screen name="bills/index" />
			<Stack.Screen name="settings" />
			<Stack.Screen name="deposit" />
			<Stack.Screen name="withdraw" />
		</Stack>
	);
}
