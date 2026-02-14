import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';
import { View } from 'react-native';

export default function PrivyCreditCardDepositScreen() {
	return (
		<View className="flex-1">
			<ScreenHeader content={<Trans>信用卡买币</Trans>} />
			<View className="flex-1 items-center justify-center px-5">
				<Text className="text-paragraph-p2 text-content-4">
					<Trans>即将推出</Trans>
				</Text>
			</View>
		</View>
	);
}
