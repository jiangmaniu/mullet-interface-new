import { Button } from '@/components/ui/button';
import { IconifyNavArrowDown } from '@/components/ui/icons/iconify';
import { IconOkxWallet } from '@/components/ui/icons/set/wallet/okx-wallet';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Trans } from '@lingui/react/macro';
import { useCallback, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
	ChannelSelectionDrawer,
	CHANNELS,
} from './_comps/channel-selection-drawer';
import {
	CurrencySelectionDrawer,
	CURRENCIES,
} from './_comps/currency-selection-drawer';
import { CreditCardDepositStatusModal } from './_comps/deposit-status-modal';

const MOCK_BALANCE = '$136,523.00';

export default function WalletCreditCardDepositScreen() {
	const { textColorContent4, colorBrandSecondary3 } = useThemeColors();

	const [amount, setAmount] = useState<number | null>(null);
	const [displayText, setDisplayText] = useState('');
	const [selectedCurrency, setSelectedCurrency] = useState('HK');
	const [selectedChannel, setSelectedChannel] = useState('alchemy-pay');

	const [showCurrencyDrawer, setShowCurrencyDrawer] = useState(false);
	const [showChannelDrawer, setShowChannelDrawer] = useState(false);
	const [showStatusModal, setShowStatusModal] = useState(false);

	const currency = CURRENCIES.find((c) => c.code === selectedCurrency);
	const channel = CHANNELS.find((c) => c.id === selectedChannel);
	const hasAmount = (amount ?? 0) > 0;

	const handleTextChange = useCallback((text: string) => {
		const digits = text.replace(/[^0-9]/g, '');
		if (digits === '') {
			setAmount(null);
			setDisplayText('');
			return;
		}
		const num = parseInt(digits, 10);
		setAmount(num);
		setDisplayText('$' + num.toLocaleString('en-US'));
	}, []);

	const handleContinue = useCallback(() => {
		setShowStatusModal(true);
	}, []);

	return (
		<View className="flex-1 gap-xl">
			<ScreenHeader content={<Trans>信用卡买币</Trans>} />

			<View className="flex-1 px-5 gap-xl">
				{/* Balance */}
				<Text className="text-paragraph-p2 text-content-4">
					<Trans>余额：</Trans>
					{MOCK_BALANCE}
				</Text>

				{/* Amount section */}
				<View>
					{/* Currency selector */}
					<Pressable
						onPress={() => setShowCurrencyDrawer(true)}
						className="flex-row items-center justify-center gap-medium w-full"
					>
						<Text className="text-paragraph-p2 text-content-4">
							{selectedCurrency}D
						</Text>
						<IconifyNavArrowDown
							width={16}
							height={16}
							color={textColorContent4}
						/>
					</Pressable>

					{/* Amount input */}
					<View className="flex-row items-center justify-center py-3xl w-full">
						<TextInput
							value={displayText}
							onChangeText={handleTextChange}
							keyboardType="number-pad"
							placeholder="0.00"
							placeholderTextColor="#656886"
							className="text-title-h1 p-0 text-content-1 text-center"
						/>
					</View>
				</View>

				{/* Channel selector */}
				<Pressable
					onPress={() => setShowChannelDrawer(true)}
					className="flex-row items-center justify-between border border-brand-default rounded-small px-xl py-medium"
				>
					<View className="gap-xs">
						<Text className="text-paragraph-p2 text-content-1">
							<Trans>渠道选择</Trans>
						</Text>
						<Text className="text-paragraph-p3 text-content-4">
							<Trans>为您自动选择</Trans>
						</Text>
					</View>
					<View className="flex-row items-center gap-medium">
						<IconOkxWallet width={24} height={24} />
						<Text className="text-paragraph-p2 text-content-1">
							OKX Connect
						</Text>
						<IconifyNavArrowDown
							width={16}
							height={16}
							color={colorBrandSecondary3}
						/>
					</View>
				</Pressable>
			</View>

			{/* Bottom button */}
			<SafeAreaView edges={['bottom']}>
				<View className="px-5 py-6">
					<Button
						block
						size="lg"
						color={hasAmount ? 'primary' : 'default'}
						disabled={!hasAmount}
						onPress={handleContinue}
					>
						<Text>
							<Trans>继续</Trans>
						</Text>
					</Button>
				</View>
			</SafeAreaView>

			{/* Currency selection drawer */}
			<CurrencySelectionDrawer
				visible={showCurrencyDrawer}
				onClose={() => setShowCurrencyDrawer(false)}
				selectedCode={selectedCurrency}
				onSelect={setSelectedCurrency}
			/>

			{/* Channel selection drawer */}
			<ChannelSelectionDrawer
				visible={showChannelDrawer}
				onClose={() => setShowChannelDrawer(false)}
				selectedId={selectedChannel}
				onSelect={setSelectedChannel}
			/>

			{/* Deposit status modal */}
			<CreditCardDepositStatusModal
				visible={showStatusModal}
				onClose={() => setShowStatusModal(false)}
				channelName={channel?.name ?? 'Alchemy Pay'}
				channelIcon={
					channel?.icon ??
					'https://www.figma.com/api/mcp/asset/c06fb52f-a3a8-469b-81bb-0427ba80db1c'
				}
				currencyName={currency?.name.split(' ')[0] === 'Hong' ? '港元' : currency?.name ?? '港元'}
				tokenName="USDC"
			/>
		</View>
	);
}
