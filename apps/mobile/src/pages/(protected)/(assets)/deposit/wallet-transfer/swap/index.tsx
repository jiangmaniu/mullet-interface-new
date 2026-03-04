import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IconifyCoinsSwap } from '@/components/ui/icons/iconify';
import { IconUSDC1 } from '@/components/ui/icons/set/usdc-1';
import { IconUsdcSol } from '@/components/ui/icons/set/usdc-sol';
import { IconOkxWallet } from '@/components/ui/icons/set/wallet/okx-wallet';
import { IconAppLogoCircle } from '@/components/ui/icons/set/app-logo-circle';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, type Option } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';
import { useDepositStore } from '../../_store';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { SignatureStatusModal, type SignatureStatus } from '../../_comps/wallet-deposit-card/signature-status-modal';

type PageMode = 'input' | 'confirm';

const MOCK_BALANCE = 0.0;
const MOCK_WALLET_ADDRESS = '0x862D...B22A';
const COUNTDOWN_SECONDS = 30;

const PERCENT_OPTIONS = [
	{ label: '25%', value: '25' },
	{ label: '50%', value: '50' },
	{ label: '75%', value: '75' },
	{ label: 'Max', value: '100' },
];

const TOKEN_OPTIONS: Option[] = [
	{ label: 'SOL', value: 'SOL' },
];

const formatCurrency = (num: number): string =>
	num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const SwapTransferScreen = observer(function SwapTransferScreen() {
	const depositTargetAccount = useDepositStore((s) => s.depositTargetAccount);
	const [mode, setMode] = useState<PageMode>('input');
	const [sendAmount, setSendAmount] = useState<number | null>(null);
	const [sendDisplayText, setSendDisplayText] = useState('');
	const [selectedToken, setSelectedToken] = useState<Option>(TOKEN_OPTIONS[0]);
	const [selectedPercent, setSelectedPercent] = useState<string>('');
	const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
	const [signatureStatus, setSignatureStatus] = useState<SignatureStatus>('idle');
	const [showSignatureModal, setShowSignatureModal] = useState(false);
	const timerRef = useRef<ReturnType<typeof setInterval>>(null);

	const isValid = (sendAmount ?? 0) > 0;
	const receiveAmount = sendAmount ?? 0; // Mock: 1:1 兑换率

	const handleSendAmountChange = useCallback((text: string) => {
		const cleaned = text.replace(/[^0-9.]/g, '');
		if (cleaned === '') {
			setSendAmount(null);
			setSendDisplayText('');
			setSelectedPercent('');
			return;
		}
		const num = parseFloat(cleaned);
		if (!isNaN(num)) {
			setSendAmount(num);
			setSendDisplayText(cleaned);
			setSelectedPercent('');
		}
	}, []);

	const handlePercentChange = useCallback((value: string) => {
		setSelectedPercent(value);
		const pct = Number(value);
		if (pct > 0) {
			const calculated = Math.floor((MOCK_BALANCE * pct) / 100 * 100) / 100;
			setSendAmount(calculated);
			setSendDisplayText(formatCurrency(calculated));
		}
	}, []);

	const handleConfirmInput = useCallback(() => {
		setMode('confirm');
		setCountdown(COUNTDOWN_SECONDS);
	}, []);

	// 确认模式倒计时
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

	const handleConfirmSwap = useCallback(() => {
		setShowSignatureModal(true);
		setSignatureStatus('signing');
		// Mock: 模拟签名过程
		setTimeout(() => {
			setSignatureStatus('success');
		}, 3000);
	}, []);

	const handleRetrySignature = useCallback(() => {
		setSignatureStatus('signing');
		setTimeout(() => {
			setSignatureStatus(Math.random() > 0.3 ? 'success' : 'failed');
		}, 3000);
	}, []);

	const handleCloseSignatureModal = useCallback(() => {
		setShowSignatureModal(false);
		setSignatureStatus('idle');
		if (signatureStatus === 'success') {
			setMode('input');
			setSendAmount(null);
			setSendDisplayText('');
			setSelectedPercent('');
		}
	}, [signatureStatus]);

	const formattedSendAmount = sendAmount ? formatCurrency(sendAmount) : '0.00';
	const formattedReceiveAmount = receiveAmount ? formatCurrency(receiveAmount) : '0.00';

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
					{/* 付款信息 */}
					<View className="px-5 gap-medium">
						<Card>
							<CardContent className="py-medium gap-large">
								<View className="flex-row items-center justify-between">
									<Text className="text-paragraph-p2 text-content-4">
										<Trans>付</Trans>
									</Text>
									<Text className="text-paragraph-p2 text-status-danger">
										-{formattedSendAmount} {selectedToken.value}
									</Text>
								</View>
								<View className="flex-row items-center gap-medium">
									<IconOkxWallet width={24} height={24} />
									<View>
										<Text className="text-paragraph-p2 text-content-1">OKX Wallet</Text>
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
										+{formattedReceiveAmount} USDC
									</Text>
								</View>
								<View className="flex-row items-center gap-medium">
									<IconAppLogoCircle width={24} height={24} />
									<View>
										<Text className="text-paragraph-p2 text-content-1">{depositTargetAccount?.id ?? '-'}</Text>
										<Text className="text-paragraph-p3 text-content-4">{MOCK_WALLET_ADDRESS}</Text>
									</View>
								</View>
							</CardContent>
						</Card>
					</View>

					{/* 费用明细 */}
					<View className="px-5">
						<Card>
							<CardContent className="py-medium gap-large">
								<FeeRow label={<Trans>兑换率</Trans>} value={`1 ${selectedToken.value}≈1 USDC`} />
								<FeeRow label={<Trans>到账时间</Trans>} value="≈1分钟" />
								<FeeRow label={<Trans>滑点</Trans>} value="自动 0.5%" />
								<FeeRow label={<Trans>网络费</Trans>} value="0.01 SOL ($0.45)" />
								<FeeRow label={<Trans>服务费</Trans>} value="免费" />
							</CardContent>
						</Card>
					</View>

					{/* 兑换服务提示 */}
					<View className="px-5">
						<Text className="text-paragraph-p3 text-content-4 text-center">
							<Trans>兑换服务由Jup Swap提供</Trans>
						</Text>
					</View>
				</View>

				{/* 底部按钮 */}
				<SafeAreaView edges={['bottom']}>
					<View className="px-5">
						<Button
							block
							size="lg"
							color="primary"
							onPress={handleConfirmSwap}
							disabled={countdown <= 0}
						>
							<Text>
								<Trans>确认兑换</Trans>
							</Text>
						</Button>
					</View>
				</SafeAreaView>

				<SignatureStatusModal
					visible={showSignatureModal}
					status={signatureStatus}
					onClose={handleCloseSignatureModal}
					onRetry={handleRetrySignature}
					sendAmount={formattedSendAmount}
					sendToken={selectedToken.value}
					receiveAmount={formattedReceiveAmount}
					receiveToken="USDC"
				/>
			</View>
		);
	}

	return (
		<View className="flex-1 gap-xl">
			<ScreenHeader content={<Trans>兑换转入</Trans>} />

			<View className="flex-1 gap-xl">
				<View className="px-5 gap-medium">
					{/* 发送框 */}
					<Card>
						<CardContent className="py-medium gap-large">
							<Text className="text-paragraph-p3 text-content-4">
								<Trans>你将发送</Trans>
							</Text>

							<View className="flex-row items-center justify-between">
								{/* Token 选择器 */}
								<View className="flex-row items-center gap-medium">
									<IconUsdcSol width={24} height={24} />
									<Select value={selectedToken} onValueChange={setSelectedToken}>
										<SelectTrigger>
											<SelectValue placeholder="选择代币" />
										</SelectTrigger>
										<SelectContent>
											{TOKEN_OPTIONS.map((opt) => (
												<SelectItem key={opt.value} label={opt.label} value={opt.value} />
											))}
										</SelectContent>
									</Select>
								</View>

								{/* 金额输入 */}
								<TextInput
									value={sendDisplayText}
									onChangeText={handleSendAmountChange}
									keyboardType="decimal-pad"
									placeholder="0.00"
									placeholderTextColor="#656886"
									className="text-title-h3 p-0 text-content-1 text-right flex-1"
								/>
							</View>

							<View className="flex-row items-center justify-between">
								<Text className="text-paragraph-p3 text-content-4">
									<Trans>可用：{formatCurrency(MOCK_BALANCE)}</Trans>
								</Text>
							</View>

							{/* 百分比选择 */}
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
						</CardContent>
					</Card>

					{/* 兑换图标 */}
					<View className="items-center -my-medium z-10">
						<View className="bg-background-2 rounded-full p-xs">
							<IconifyCoinsSwap width={24} height={24} className="text-content-1" />
						</View>
					</View>

					{/* 接收框 */}
					<Card>
						<CardContent className="py-medium gap-large">
							<Text className="text-paragraph-p3 text-content-4">
								<Trans>你将收到</Trans>
							</Text>

							<View className="flex-row items-center justify-between">
								<View className="flex-row items-center gap-medium">
									<IconUSDC1 width={24} height={24} />
									<Text className="text-paragraph-p2 text-content-1">USDC</Text>
								</View>

								<Text className="text-title-h3 text-content-1">
									{formattedReceiveAmount}
								</Text>
							</View>
						</CardContent>
					</Card>
				</View>

				{/* 费用明细 */}
				<View className="px-5">
					<Card>
						<CardContent className="py-medium gap-large">
							<FeeRow label={<Trans>兑换率</Trans>} value={`1 ${selectedToken.value}≈1 USDC`} />
							<FeeRow label={<Trans>到账时间</Trans>} value="≈1分钟" />
							<FeeRow label={<Trans>滑点</Trans>} value="自动 0.5%" />
							<FeeRow label={<Trans>网络费</Trans>} value="0.01 SOL ($0.45)" />
							<FeeRow label={<Trans>服务费</Trans>} value="免费" />
						</CardContent>
					</Card>
				</View>

				{/* 兑换服务提示 */}
				<View className="px-5">
					<Text className="text-paragraph-p3 text-content-4 text-center">
						<Trans>兑换服务由Jup Swap提供</Trans>
					</Text>
				</View>
			</View>

			{/* 底部按钮 */}
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

export default SwapTransferScreen;

function FeeRow({ label, value }: { label: React.ReactNode; value: string }) {
	return (
		<View className="flex-row items-center justify-between">
			<Text className="text-paragraph-p3 text-content-4">{label}</Text>
			<Text className="text-paragraph-p3 text-content-1">{value}</Text>
		</View>
	);
}
