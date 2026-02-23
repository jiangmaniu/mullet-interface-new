import { Alert, AlertText } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { IconArbitrum } from '@/components/ui/icons/set/arbitrum';
import { IconUSDC1 } from '@/components/ui/icons/set/usdc-1';
import { ScreenHeader } from '@/components/ui/screen-header';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	type Option,
} from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Trans } from '@lingui/react/macro';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WithdrawStatusModal } from './_comps/withdraw-status-modal';

const MOCK_BALANCE = '$136,523.00';
const MOCK_AVAILABLE = '0.00000 USDC';

const TOKEN_OPTIONS: (Option & { icon: React.ReactNode })[] = [
	{
		value: 'usdc',
		label: 'USDC',
		icon: <IconUSDC1 width={16} height={16} />,
	},
];

const NETWORK_OPTIONS: (Option & { icon: React.ReactNode })[] = [
	{
		value: 'arbitrum',
		label: 'Arbitrum',
		icon: <IconArbitrum width={16} height={16} />,
	},
];

export default function WalletWithdrawScreen() {
	const [selectedToken, setSelectedToken] = useState<Option>(TOKEN_OPTIONS[0]);
	const [selectedNetwork, setSelectedNetwork] = useState<Option>(
		NETWORK_OPTIONS[0],
	);
	const [address, setAddress] = useState('');
	const [amount, setAmount] = useState('');
	const [showStatusModal, setShowStatusModal] = useState(false);

	const tokenIcon = TOKEN_OPTIONS.find(
		(t) => t.value === selectedToken.value,
	)?.icon;
	const networkIcon = NETWORK_OPTIONS.find(
		(n) => n.value === selectedNetwork.value,
	)?.icon;

	const hasAddress = address.length > 0;
	const hasAmount = amount.length > 0 && amount !== '0';
	const isValid = hasAddress && hasAmount;

	// Mock address validation
	const addressError =
		hasAddress && address.length > 10 && !address.startsWith('0x')
			? '地址与网络不匹配，请重新输入或选择地址。'
			: undefined;

	const handleConfirm = useCallback(() => {
		setShowStatusModal(true);
	}, []);

	const handleMaxPress = useCallback(() => {
		setAmount('1000.00');
	}, []);

	return (
		<View className="flex-1 gap-xl">
			<ScreenHeader content={<Trans>取现</Trans>} />

			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
			>
				<View className="px-5 gap-xl pb-4xl">
					{/* Balance */}
					<Text className="text-paragraph-p2 text-content-4 mb-2xl">
						<Trans>钱包余额：</Trans>
						{MOCK_BALANCE}
					</Text>

					{/* Token & Network selectors */}
					<View className="gap-2xl">
						<Select
							value={selectedToken}
							onValueChange={setSelectedToken}
						>
							<SelectTrigger
								LeftContent={tokenIcon}
								placeholder="选择币种"
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{TOKEN_OPTIONS.map((token) => (
									<SelectItem
										className="px-5 py-[14px]"
										key={token.value}
										value={token.value}
										label={token.label}
										icon={token.icon}
									/>
								))}
							</SelectContent>
						</Select>

						<Select
							value={selectedNetwork}
							onValueChange={setSelectedNetwork}
						>
							<SelectTrigger
								LeftContent={networkIcon}
								placeholder="选择网络"
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{NETWORK_OPTIONS.map((network) => (
									<SelectItem
										className="px-5 py-[14px]"
										key={network.value}
										value={network.value}
										label={network.label}
										icon={network.icon}
									/>
								))}
							</SelectContent>
						</Select>
					</View>

					{/* Address input */}
					<Input
						placeholder="输入取现地址"
						labelText="取现地址"
						value={address}
						size='md'
						onValueChange={setAddress}
						errorMessage={addressError}
						multiline
					/>

					{/* Amount input */}
					<Input
						placeholder="输入取现数量"
						labelText="取现数量"
						value={amount}
						size='md'
						onValueChange={setAmount}
						keyboardType="decimal-pad"
						hintLabel={<Trans>可用</Trans>}
						hintValue={MOCK_AVAILABLE}
						RightContent={
							<Pressable onPress={handleMaxPress}>
								<Text className="text-paragraph-p2 text-content-1 font-medium">
									<Trans>全部</Trans>
								</Text>
							</Pressable>
						}
					/>

					{/* Warning */}
					<Alert variant="warning">
						<AlertText>
							<Trans>
								请确保您选择的提现网络，与您在外部钱包/交易所的收款网络一致。否则资产可能会丢失
							</Trans>
						</AlertText>
					</Alert>

					{/* Fee details */}
					<Card>
						<CardContent className="gap-large px-xl py-medium">
							<FeeRow
								label={<Trans>网络费用</Trans>}
								value="0.00 USDC"
								tooltip="链上转账所需的手续费"
							/>
							<FeeRow
								label={<Trans>价格影响</Trans>}
								value="0.00%"
								tooltip="交易对市场价格的影响程度"
							/>
							<FeeRow
								label={<Trans>预估滑点</Trans>}
								value="自动 0.00%"
								tooltip="实际成交价与预期价格的偏差"
							/>
						</CardContent>
					</Card>
				</View>
			</ScrollView>

			{/* Bottom button */}
			<SafeAreaView edges={['bottom']}>
				<View className="px-5 py-6">
					<Button
						block
						size="lg"
						color={isValid ? 'primary' : 'default'}
						disabled={!isValid}
						onPress={handleConfirm}
					>
						<Text>
							<Trans>确定取现</Trans>
						</Text>
					</Button>
				</View>
			</SafeAreaView>

			{/* Withdraw status modal */}
			<WithdrawStatusModal
				visible={showStatusModal}
				onClose={() => setShowStatusModal(false)}
				amount={amount || '100.00'}
				token="USDC"
			/>
		</View>
	);
}

function FeeRow({
	label,
	value,
	tooltip,
}: {
	label: React.ReactNode;
	value: string;
	tooltip?: string;
}) {
	return (
		<View className="flex-row items-center justify-between">
			<Tooltip title={label}>
				<TooltipTrigger>{label}</TooltipTrigger>
				<TooltipContent>{tooltip}</TooltipContent>
			</Tooltip>
			<Text className="text-paragraph-p3 text-content-1">{value}</Text>
		</View>
	);
}
