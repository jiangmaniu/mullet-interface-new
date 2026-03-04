import { Button } from '@/components/ui/button';
import { IconifyNavArrowDown } from '@/components/ui/icons';
import { IconArbitrum } from '@/components/ui/icons/set/arbitrum';
import { IconUSDC1 } from '@/components/ui/icons/set/usdc-1';
import { IconOkxWallet } from '@/components/ui/icons/set/wallet/okx-wallet';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, type Option } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Trans } from '@lingui/react/macro';
import { router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWithdrawStore } from '../_store';
import { BNumber } from '@mullet/utils/number';

type WalletMode = 'connected' | 'manual';

const TOKEN_OPTIONS: Option[] = [
	{ label: 'USDC', value: 'USDC' },
	{ label: 'SOL', value: 'SOL' },
	{ label: 'ETH', value: 'ETH' },
];

const NETWORK_OPTIONS: Option[] = [
	{ label: 'Arbitrum', value: 'Arbitrum' },
	{ label: 'Base', value: 'Base' },
	{ label: 'Solana', value: 'Solana' },
];

const MOCK_WALLET_ADDRESS = '0x862D...B22A';

const CryptoWithdrawScreen = observer(function CryptoWithdrawScreen() {
	const withdrawSourceAccount = useWithdrawStore((s) => s.withdrawSourceAccount);
	const [selectedToken, setSelectedToken] = useState<Option>(TOKEN_OPTIONS[0]);
	const [selectedNetwork, setSelectedNetwork] = useState<Option>(NETWORK_OPTIONS[0]);
	const [walletMode, setWalletMode] = useState<WalletMode>('connected');
	const [manualAddress, setManualAddress] = useState('');

	const selectedAccount = withdrawSourceAccount;
	const balance = selectedAccount?.money ?? 0;

	// 判断是否可以提交：连接钱包模式始终可以，手动输入模式需要有地址
	const canSubmit = walletMode === 'connected' || manualAddress.trim().length > 0;

	const handleConfirm = () => {
		if (selectedToken.value === 'USDC') {
			router.push('/(assets)/withdraw/crypto/usdc');
		} else {
			router.push('/(assets)/withdraw/crypto/swap');
		}
	};

	const tokenIcon = selectedToken.value === 'USDC' ? (
		<IconUSDC1 width={16} height={16} />
	) : null;

	const networkIcon = selectedNetwork.value === 'Arbitrum' ? (
		<IconArbitrum width={16} height={16} />
	) : null;

	return (
		<View className="flex-1 gap-xl">
			<ScreenHeader content={<Trans>加密货币取现</Trans>} />
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				<View className="px-5 gap-xl">
					<View className="gap-medium flex-row justify-between items-center pb-xl">
						<Text className="text-paragraph-p3 text-content-4">
							<Trans>余额：{BNumber.toFormatNumber(balance, { unit: selectedAccount?.currencyUnit, volScale: selectedAccount?.currencyDecimal })}</Trans>
						</Text>
						<Text className="text-paragraph-p3 text-content-4">
							<Trans>最低取现 200 USDC</Trans>
						</Text>
					</View>

					<View className="gap-xl">
						<Select value={selectedToken} onValueChange={setSelectedToken}>
							<SelectTrigger LeftContent={tokenIcon} placeholder="选择币种">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{TOKEN_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value} label={option.label} />
								))}
							</SelectContent>
						</Select>

						<Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
							<SelectTrigger LeftContent={networkIcon} placeholder="选择网络">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{NETWORK_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value} label={option.label} />
								))}
							</SelectContent>
						</Select>
					</View>

					<View className="gap-medium">
						<View className="flex-row items-center justify-between">
							<Text className="text-paragraph-p3 text-content-4">
								<Trans>接收钱包</Trans>
							</Text>
							<Pressable
								onPress={() => setWalletMode(walletMode === 'connected' ? 'manual' : 'connected')}
								className="flex-row items-center gap-xs"
							>
								<View className="w-4 h-4">
									{walletMode === 'connected' ? (
										<IconifyNavArrowDown width={16} height={16} className="text-content-1" />
									) : (
										<IconOkxWallet width={16} height={16} />
									)}
								</View>
								<Text className="text-paragraph-p3 text-content-1">
									{walletMode === 'connected' ? (
										<Trans>输入钱包地址</Trans>
									) : (
										<Trans>授权钱包</Trans>
									)}
								</Text>
							</Pressable>
						</View>

						{walletMode === 'connected' ? (
							<View className="flex-row items-center gap-medium">
								<IconOkxWallet width={24} height={24} />
								<View className="flex-1">
									<Text className="text-paragraph-p2 text-content-1">OKX Wallet</Text>
									<Text className="text-paragraph-p3 text-content-4">
										{MOCK_WALLET_ADDRESS}
									</Text>
								</View>
							</View>
						) : (
							<Input
								placeholder="请输入钱包地址"
								value={manualAddress}
								onChangeText={setManualAddress}
							/>
						)}
					</View>
				</View>
			</ScrollView>
			<SafeAreaView edges={['bottom']}>
				<View className="px-5 py-3xl">
					<Button block size="lg" color="primary" onPress={handleConfirm} disabled={!canSubmit}>
						<Text><Trans>确定</Trans></Text>
					</Button>
				</View>
			</SafeAreaView>
		</View>
	);
});

export default CryptoWithdrawScreen;
