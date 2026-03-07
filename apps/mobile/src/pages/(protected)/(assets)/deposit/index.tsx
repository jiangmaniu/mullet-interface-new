import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';
import { useDepositState, useDepositActions } from './_hooks/use-deposit-state';
import { useSelectedDepositAccount } from './_hooks/use-selected-account';
import { router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { DepositAccountSelector } from './_comps/account-selection';
import { QrDepositCard } from './_comps/qr-deposit-card';
import { BankDepositCard } from './_comps/bank-deposit-card';
import { IconRecord } from '@/components/ui/icons';
import { WalletDepositCard } from './_comps/wallet-deposit-card';

const DepositScreen = observer(function DepositScreen() {
	const selectedAccount = useSelectedDepositAccount();
	const { reset } = useDepositActions();

	// 离开入金模块时重置状态
	useEffect(() => {
		return () => reset();
	}, [reset]);

	return (
		<View className="flex-1">
			<ScreenHeader
				content={<Trans>存款</Trans>}
				right={
					<Pressable onPress={() => router.push({ pathname: '/(protected)/(assets)/bills', params: { tab: 'deposit', accountId: selectedAccount?.id } })}>
						<IconRecord width={24} height={24} className="text-content-1" />
					</Pressable>}
			/>
			<View className="flex-1 gap-xl pt-xl">
				<View className="px-5 mb-xl">
					<DepositAccountSelector />
				</View>
				<View className="px-5">
					<Text className="text-paragraph-p2 text-content-4">
						<Trans>选择适合您的入金方式</Trans>
					</Text>
				</View>
				<View className="px-5 gap-xl">
					{/* 钱包入金 */}
					<WalletDepositCard />
					{/* 扫码入金 */}
					<QrDepositCard />
					{/* 银行卡入金 */}
					<BankDepositCard />
				</View>
			</View>
		</View>
	);
});

export default DepositScreen;
