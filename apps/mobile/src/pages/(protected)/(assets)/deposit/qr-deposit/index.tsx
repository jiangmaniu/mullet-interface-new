import { ScreenHeader } from '@/components/ui/screen-header';
import { useDepositStore } from '../_store';
import { Trans } from '@lingui/react/macro';
import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { DepositAddressSection } from './_comps/deposit-address-section';
import { TokenChainSelector } from './_comps/token-chain-selector';

export default function QrDepositScreen() {
	const reset = useDepositStore((s) => s.reset);

	// 页面卸载时重置状态
	useEffect(() => {
		return () => {
			reset();
		};
	}, [reset]);

	return (
		<View className="flex-1 gap-xl">
			<ScreenHeader content={<Trans>扫码转入</Trans>} />

			<ScrollView className="flex-1 pt-small" showsVerticalScrollIndicator={false}>
				<View className="px-5 gap-xl pb-4xl">
					{/* 代币和网络选择 */}
					<TokenChainSelector />

					{/* 存款地址和注意事项 */}
					<DepositAddressSection />
				</View>
			</ScrollView>
		</View>
	);
}
