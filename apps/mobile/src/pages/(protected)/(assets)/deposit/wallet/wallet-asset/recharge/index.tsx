import { Button } from '@/components/ui/button';
import { IconifyArrowRightTagSolid, IconifyDataTransferBoth } from '@/components/ui/icons/iconify';
import { IconUsdcSol } from '@/components/ui/icons/set/usdc-sol';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOCK_BALANCE = 136523.0;
const MIN_AMOUNT = 1;

const PERCENT_OPTIONS = [
	{ label: '25%', value: '25' },
	{ label: '50%', value: '50' },
	{ label: '75%', value: '75' },
	{ label: 'Max', value: '100' },
];

const formatCurrency = (num: number): string =>
	'$' + num.toLocaleString('en-US');

export default function RechargeWalletScreen() {
	const [amount, setAmount] = useState<number | null>(null);
	const [displayText, setDisplayText] = useState('');
	const [selectedPercent, setSelectedPercent] = useState<string>('');

	const isValid = (amount ?? 0) >= MIN_AMOUNT && (amount ?? 0) <= MOCK_BALANCE;

	const handleTextChange = useCallback((text: string) => {
		const digits = text.replace(/[^0-9]/g, '');
		if (digits === '') {
			setAmount(null);
			setDisplayText('');
			setSelectedPercent('');
			return;
		}
		const num = parseInt(digits, 10);
		setAmount(num);
		setDisplayText(formatCurrency(num));
		setSelectedPercent('');
	}, []);

	const handlePercentChange = useCallback((value: string) => {
		setSelectedPercent(value);
		const pct = Number(value);
		if (pct > 0) {
			const calculated = Math.floor((MOCK_BALANCE * pct) / 100);
			setAmount(calculated);
			setDisplayText(formatCurrency(calculated));
		}
	}, []);

	const handlePress = useCallback(() => {
		router.push('/(assets)/deposit/wallet/wallet-asset/recharge/confirm');
	}, []);

	return (
		<View className="flex-1 gap-xl">
			<ScreenHeader content={<Trans>充值您的钱包</Trans>} />

			<View className="flex-1 gap-xl">
				{/* 钱包余额 */}
				<View className="px-5">
					<Text className="text-paragraph-p2 text-content-4">
						<Trans>钱包余额：${MOCK_BALANCE.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Trans>
					</Text>
				</View>

				<View className="px-5 gap-3xl">
					{/* 金额输入区域 */}
					<View className="gap-xl">
						<View className="items-center">
							{/* 金额输入 */}
							<View className="flex-row items-center justify-center gap-xs py-3xl">
								<TextInput
									value={displayText}
									onChangeText={handleTextChange}
									keyboardType="number-pad"
									placeholder="0.00"
									placeholderTextColor="#656886"
									className="text-title-h1 p-0 text-content-1"
								/>
							</View>

							{/* USDC 换算 */}
							<View className="flex-row items-center justify-center gap-medium">
								<IconifyDataTransferBoth width={16} height={16} className="text-content-4" />
								<Text className="text-paragraph-p2 text-content-4">
									0.00 USDC
								</Text>
							</View>
						</View>

						{/* 百分比选择 */}
						<View className='flex-row items-center justify-center'>
							<Tabs value={selectedPercent} onValueChange={handlePercentChange}>
								<TabsList variant="solid" size="md">
									{PERCENT_OPTIONS.map((opt) => (
										<TabsTrigger key={opt.value} value={opt.value}>
											<Text>{opt.label}</Text>
										</TabsTrigger>
									))}
								</TabsList>
							</Tabs>
						</View>
					</View>

					{/* 最低存款 + 代币流向 */}
					<View className="gap-xs items-center">
						<Text className="text-paragraph-p3 text-content-4">
							<Trans>最低存款金额$1</Trans>
						</Text>

						{/* 代币流向 */}
						<View className="flex-row items-center justify-center gap-3xl py-xl">
							<View className="flex-row items-center gap-xs">
								<IconUsdcSol width={24} height={24} />
								<View>
									<Text className="text-paragraph-p2 text-content-1">
										<Trans>您将发送</Trans>
									</Text>
									<Text className="text-paragraph-p3 text-content-4">USDC</Text>
								</View>
							</View>

							<IconifyArrowRightTagSolid width={24} height={24} className="text-brand-secondary-1" />

							<View className="flex-row items-center gap-xs">
								<IconUsdcSol width={24} height={24} />
								<View>
									<Text className="text-paragraph-p2 text-content-1">
										<Trans>您将收到</Trans>
									</Text>
									<Text className="text-paragraph-p3 text-content-4">USDC</Text>
								</View>
							</View>
						</View>
					</View>
				</View>
			</View>


			{/* 底部按钮 */}
			<SafeAreaView edges={['bottom']}>
				<View className='px-5'>
					<Button
						block
						size="lg"
						color='primary'
						disabled={!isValid}
						onPress={handlePress}
					>
						<Text><Trans>确定</Trans></Text>
					</Button>
				</View>
			</SafeAreaView>
		</View>
	);
}
