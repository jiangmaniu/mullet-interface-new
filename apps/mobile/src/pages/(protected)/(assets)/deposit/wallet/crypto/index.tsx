import { Alert, AlertText } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { IconifyCopy } from '@/components/ui/icons/iconify';
import { IconArbitrum } from '@/components/ui/icons/set/arbitrum';
import { IconUSDC1 } from '@/components/ui/icons/set/usdc-1';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, type Option } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCodeStyled from 'react-native-qrcode-styled';
import * as ExpoClipboard from 'expo-clipboard';
import { DepositStatusModal, type DepositStatus } from './_comps/deposit-status-modal';
import { toast } from '@/components/ui/toast';
import { Card, CardContent } from '@/components/ui/card';

const MOCK_ADDRESS = '0x4aDA78eC7796d6C606A2FCFE3A5c2148c358c5bf';
const MOCK_BALANCE = '$136,523.00';

const TOKEN_OPTIONS: (Option & { icon: React.ReactNode })[] = [
	{ value: 'usdc-arb', label: 'USDC', icon: <IconUSDC1 width={16} height={16} /> },
	{ value: 'usdc-eth', label: 'USDC', icon: <IconUSDC1 width={16} height={16} /> },
	{ value: 'usdc-sol', label: 'USDC', icon: <IconUSDC1 width={16} height={16} /> },
];

export default function WalletCryptoDepositScreen() {
	const [selectedToken, setSelectedToken] = useState<Option>(TOKEN_OPTIONS[0]);
	const [depositStatus, setDepositStatus] = useState<DepositStatus>('idle');
	const [showStatusModal, setShowStatusModal] = useState(false);
	const timerRef = useRef<ReturnType<typeof setInterval>>(null);

	const tokenIcon = TOKEN_OPTIONS.find((t) => t.value === selectedToken.value)?.icon;

	const handleCopyAddress = useCallback(async () => {
		try {
			await ExpoClipboard.setStringAsync(MOCK_ADDRESS);
			toast.success(<Trans>复制成功</Trans>);
		} catch {
			toast.error(<Trans>复制失败，请重试</Trans>);
		}
	}, []);

	const handleConfirmDeposit = useCallback(() => {
		setDepositStatus('processing');
		setShowStatusModal(true);
		timerRef.current = setInterval(() => {
			setDepositStatus('success');
			clearInterval(timerRef.current!);
		}, 3000);
	}, []);

	useEffect(() => {
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, []);

	return (
		<View className="flex-1 gap-xl">
			<ScreenHeader content={<Trans>加密货币入金</Trans>} />
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				<View className="px-5 gap-xl pb-4xl">
					{/* 钱包余额 */}
					<Text className="text-paragraph-p2 text-content-4">
						<Trans>钱包余额：</Trans>{MOCK_BALANCE}
					</Text>

					<View className="gap-2xl pt-xl">
						{/* 代币选择器 */}
						<Select value={selectedToken} onValueChange={setSelectedToken}>
							<SelectTrigger LeftContent={tokenIcon}>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{TOKEN_OPTIONS.map((token) => (
									<SelectItem className='px-5 py-[14px]' key={token.value} value={token.value} label={token.label} icon={token.icon} />
								))}
							</SelectContent>
						</Select>

						{/* 网络选择器 */}
						<Select
							value={{ value: 'arbitrum', label: 'Arbitrum' }}
							onValueChange={() => { }}
						>
							<SelectTrigger LeftContent={<IconArbitrum width={16} height={16} />}>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem className='px-5 py-[14px]' value="arbitrum" label="Arbitrum" icon={<IconArbitrum width={16} height={16} />} />
							</SelectContent>
						</Select>
					</View>

					<View className="gap-medium">
						{/* 存款地址 */}
						<Text className="text-paragraph-p2 text-content-4">
							<Trans>存款地址</Trans>
						</Text>

						{/* QR Code */}
						<View className="items-center">
							<QRCodeStyled
								data={MOCK_ADDRESS}
								style={{ backgroundColor: 'white', borderRadius: 8 }}
								padding={10}
								size={112}
							/>
						</View>

						{/* 地址显示 + 复制 */}
						<View className="flex-row items-center bg-button rounded-medium p-2xl gap-2xl">
							<Text className="flex-1 text-paragraph-p3 text-content-1" numberOfLines={2}>
								{MOCK_ADDRESS}
							</Text>
							<Pressable onPress={handleCopyAddress} hitSlop={12}>
								<IconifyCopy width={18} height={18} className='text-content-4' />
							</Pressable>
						</View>
					</View>

					{/* 提示信息 */}
					<Alert variant="warning">
						<AlertText>
							<Trans>您可以向此地址发送任何可接受的代币，它将自动兑换成USDC转入您的账户</Trans>
						</AlertText>
					</Alert>

					{/* 费用明细 */}
					<Card>
						<CardContent className="gap-large px-xl py-medium">
							<FeeRow label={<Trans>网络费用</Trans>} value="0.00 USDC" />
							<FeeRow label={<Trans>价格影响</Trans>} value="0.00%" />
							<FeeRow label={<Trans>预估滑点</Trans>} value="自动 0.00%" />
						</CardContent>
					</Card>
				</View>
			</ScrollView>

			{/* 底部按钮 */}
			<SafeAreaView edges={['bottom']}>
				<View className="px-5 py-6">
					<Button block size="lg" color="primary" onPress={handleConfirmDeposit}>
						<Text><Trans>确定存款</Trans></Text>
					</Button>
				</View>
			</SafeAreaView>

			{/* 入金状态弹窗 */}
			<DepositStatusModal
				visible={showStatusModal}
				status={depositStatus}
				onClose={() => {
					setShowStatusModal(false);
					setDepositStatus('idle');
				}}
			/>
		</View>
	);
}

function FeeRow({ label, value }: { label: React.ReactNode; value: string }) {
	return (
		<View className="flex-row items-center justify-between">
			<Text
				className="text-paragraph-p3 text-content-4"
				style={{ textDecorationLine: 'underline', textDecorationStyle: 'dotted' }}
			>
				{label}
			</Text>
			<Text className="text-paragraph-p3 text-content-1">{value}</Text>
		</View>
	);
}
