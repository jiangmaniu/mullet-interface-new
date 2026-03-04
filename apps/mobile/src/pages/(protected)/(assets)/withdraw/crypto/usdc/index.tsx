import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IconUSDC1 } from '@/components/ui/icons/set/usdc-1';
import { IconOkxWallet } from '@/components/ui/icons/set/wallet/okx-wallet';
import { IconAppLogoCircle } from '@/components/ui/icons/set/app-logo-circle';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { useWithdrawStore } from '../../_store';

type PageMode = 'input' | 'confirm';

const MOCK_BALANCE = 3532.0;
const MOCK_WALLET_ADDRESS = '0x862D...B22A';
const COUNTDOWN_SECONDS = 30;

const PERCENT_OPTIONS = [
	{ label: '25%', value: '25' },
	{ label: '50%', value: '50' },
	{ label: '75%', value: '75' },
	{ label: 'Max', value: '100' },
];

const formatCurrency = (num: number): string =>
	num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const UsdcWithdrawScreen = observer(function UsdcWithdrawScreen() {
	const withdrawSourceAccount = useWithdrawStore((s) => s.withdrawSourceAccount);
	const [mode, setMode] = useState<PageMode>('input');
	const [amount, setAmount] = useState<number | null>(null);
	const [displayText, setDisplayText] = useState('');
	const [selectedPercent, setSelectedPercent] = useState<string>('');
	const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
	const timerRef = useRef<ReturnType<typeof setInterval>>(null);

	const selectedAccount = withdrawSourceAccount;
	const isValid = (amount ?? 0) > 0 && (amount ?? 0) <= MOCK_BALANCE;

	const handleTextChange = useCallback((text: string) => {
		const digits = text.replace(/[^0-9.]/g, '');
		if (digits === '') {
			setAmount(null);
			setDisplayText('');
			setSelectedPercent('');
			return;
		}
		const num = parseFloat(digits);
		if (!isNaN(num)) {
			setAmount(num);
			setDisplayText(digits);
			setSelectedPercent('');
		}
	}, []);

	const handlePercentChange = useCallback((value: string) => {
		setSelectedPercent(value);
		const pct = Number(value);
		if (pct > 0) {
			const calculated = Math.floor((MOCK_BALANCE * pct) / 100 * 100) / 100;
			setAmount(calculated);
			setDisplayText(formatCurrency(calculated));
		}
	}, []);

	const handleConfirmInput = useCallback(() => {
		setMode('confirm');
		setCountdown(COUNTDOWN_SECONDS);
	}, []);

	useEffect(() => {
		if (mode !== 'confirm') return;

		timerRef.current = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(timerRef.current!);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [mode]);

	const handleConfirmWithdraw = useCallback(() => {
		router.push('/(assets)/withdraw/crypto/verify');
	}, []);

	const formattedAmount = amount ? formatCurrency(amount) : '0.00';

	if (mode === 'confirm') {
		return (
			<View className="flex-1 gap-xl">
				<ScreenHeader
					content={
						<Text>
							<Trans>订单确认</Trans> {countdown}S
						</Text>
					}
				/>

				<View className="flex-1 gap-xl">
					<View className="px-5 gap-medium">
						<Card>
							<CardContent className="py-medium gap-large">
								<View className="flex-row items-center justify-between">
									<Text className="text-paragraph-p2 text-content-4">
										<Trans>付</Trans>
									</Text>
									<Text className="text-paragraph-p2 text-status-danger">
										-{formattedAmount} USDC
									</Text>
								</View>
								<View className="flex-row items-center gap-medium">
									<IconAppLogoCircle width={24} height={24} />
									<View>
										<Text className="text-paragraph-p2 text-content-1">{selectedAccount?.id ?? '-'}</Text>
										<Text className="text-paragraph-p3 text-content-4">{MOCK_WALLET_ADDRESS}</Text>
									</View>
								</View>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="py-medium gap-large">
								<View className="flex-row items-center justify-between">
									<Text className="text-paragraph-p2 text-content-4">
										<Trans>收</Trans>
									</Text>
									<Text className="text-paragraph-p2 text-status-success">
										+{formattedAmount} USDC
									</Text>
								</View>
								<View className="flex-row items-center gap-medium">
									<IconOkxWallet width={24} height={24} />
									<View>
										<Text className="text-paragraph-p2 text-content-1">
											<Trans>未知钱包</Trans>
										</Text>
										<Text className="text-paragraph-p3 text-content-4">{MOCK_WALLET_ADDRESS}</Text>
									</View>
								</View>
							</CardContent>
						</Card>
					</View>

					<View className="px-5">
						<Card>
							<CardContent className="py-medium gap-large">
								<FeeRow label={<Trans>兑换率</Trans>} value="1：1" />
								<FeeRow label={<Trans>到账时间</Trans>} value="≈1分钟" />
								<FeeRow label={<Trans>Gas费</Trans>} value="0.0001 SOL" />
								<FeeRow label={<Trans>预计到账</Trans>} value={`${formattedAmount} USDC`} />
								<FeeRow label={<Trans>服务费</Trans>} value="免费" />
							</CardContent>
						</Card>
					</View>
				</View>

				<SafeAreaView edges={['bottom']}>
					<View className="px-5">
						<Button
							block
							size="lg"
							color="primary"
							onPress={handleConfirmWithdraw}
							disabled={countdown <= 0}
						>
							<Text>
								<Trans>确认取现</Trans>
							</Text>
						</Button>
					</View>
				</SafeAreaView>
			</View>
		);
	}

	return (
		<View className="flex-1 gap-xl">
			<ScreenHeader content={<Trans>加密货币取现</Trans>} />

			<View className="flex-1 gap-xl">
				<View className="px-5">
					<Text className="text-paragraph-p2 text-content-4">
						<Trans>余额：${formatCurrency(MOCK_BALANCE)}</Trans>
					</Text>
					<Text className="text-paragraph-p3 text-content-4">
						<Trans>最低取现 200 USDC</Trans>
					</Text>
				</View>

				<View className="px-5 gap-3xl">
					<View className="gap-xl">
						<View className="items-center">
							<IconUSDC1 width={48} height={48} />

							<Text className="text-paragraph-p2 text-content-1 mt-medium">USDC</Text>

							<View className="flex-row items-center justify-center gap-xs py-3xl">
								<TextInput
									value={displayText}
									onChangeText={handleTextChange}
									keyboardType="decimal-pad"
									placeholder="0.00"
									placeholderTextColor="#656886"
									className="text-title-h1 p-0 text-content-1 text-center"
								/>
							</View>
						</View>

						<View className="flex-row items-center justify-center">
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

					<View className="gap-medium">
						<Text className="text-paragraph-p3 text-content-4">
							<Trans>接收地址</Trans>
						</Text>
						<Card className="rounded-small">
							<CardContent className="py-xl px-xl">
								<View className="flex-row items-center gap-medium">
									<IconOkxWallet width={24} height={24} />
									<View className="flex-1">
										<Text className="text-paragraph-p2 text-content-1">OKX Wallet</Text>
										<Text className="text-paragraph-p3 text-content-4">{MOCK_WALLET_ADDRESS}</Text>
									</View>
								</View>
							</CardContent>
						</Card>
					</View>
				</View>
			</View>

			<SafeAreaView edges={['bottom']}>
				<View className="px-5">
					<Button
						block
						size="lg"
						color="primary"
						disabled={!isValid}
						onPress={handleConfirmInput}
					>
						<Text>
							<Trans>确定</Trans>
						</Text>
					</Button>
				</View>
			</SafeAreaView>
		</View>
	);
});

export default UsdcWithdrawScreen;

function FeeRow({ label, value }: { label: React.ReactNode; value: string }) {
	return (
		<View className="flex-row items-center justify-between">
			<Text className="text-paragraph-p3 text-content-4">{label}</Text>
			<Text className="text-paragraph-p3 text-content-1">{value}</Text>
		</View>
	);
}
