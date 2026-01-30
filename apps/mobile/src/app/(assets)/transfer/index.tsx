import { Button, IconButton } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IconGroup5, IconifyCoinsSwap, IconifyNavArrowRight, IconifyPlusCircle } from '@/components/ui/icons';
import { IconRecord } from '@/components/ui/icons/set/record';
import { Input } from '@/components/ui/input';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Trans } from '@lingui/react/macro';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AccountSelectionDrawer, Account } from './_comps/account-selection-drawer';

const INITIAL_ACCOUNTS: Account[] = [
	{ id: '88234911', type: 'STP', balance: '10,234.50', currency: 'USDC' },
	{ id: '88234912', type: 'STP', balance: '5,000.00', currency: 'USDC' },
];

export default function TransferScreen() {
	const insets = useSafeAreaInsets();
	const { textColorContent1 } = useThemeColors();

	const [fromAccount, setFromAccount] = useState<Account>(INITIAL_ACCOUNTS[0]);
	const [toAccount, setToAccount] = useState<Account>(INITIAL_ACCOUNTS[1]);
	const [amount, setAmount] = useState('');

	const [isFromDrawerOpen, setIsFromDrawerOpen] = useState(false);
	const [isToDrawerOpen, setIsToDrawerOpen] = useState(false);

	const handleSwap = () => {
		setFromAccount(toAccount);
		setToAccount(fromAccount);
	};

	const handleMax = () => {
		// Remove commas for calculation, assuming balance string is formatted
		const balance = parseFloat(fromAccount.balance.replace(/,/g, ''));
		setAmount(balance.toFixed(2));
	};

	return (
		<View className="flex-1">
			<ScreenHeader
				content={<Trans>划转</Trans>}
				right={
					<TouchableOpacity>
						<IconRecord width={24} height={24} color={textColorContent1} />
					</TouchableOpacity>
				}
			/>

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				className="flex-1"
			>
				<View className="flex-1 px-xl">
					{/* Account Selection Area */}
					<View className="relative mt-4">
						{/* From Account */}
						<AccountSelector
							label={<Trans>从</Trans>}
							account={fromAccount}
							onPress={() => setIsFromDrawerOpen(true)}
						/>

						{/* Swap Button */}
						<View className="absolute left-1/2 top-1/2 -ml-[20px] -mt-[20px] z-10">
							<IconButton variant='ghost' onPress={handleSwap}>
								<IconGroup5 width={24} height={24} />
							</IconButton>
						</View>

						{/* To Account */}
						<View className="mt-2">
							<AccountSelector
								label={<Trans>到</Trans>}
								account={toAccount}
								onPress={() => setIsToDrawerOpen(true)}
							/>
						</View>
					</View>

					{/* Amount Input */}
					<View className="mt-6 gap-medium">
						<Input
							placeholder="请输入金额"
							value={amount}
							onChangeText={setAmount}
							keyboardType="numeric"
							size='md'
							RightContent={
								<View className="flex-row items-center gap-xs ml-2">
									<Text className="text-paragraph-p2 text-content-1">USDC</Text>
									<TouchableOpacity onPress={handleMax}>
										<Text className="text-paragraph-p2 text-brand-primary"><Trans>最大</Trans></Text>
									</TouchableOpacity>
								</View>
							}
						/>

						<View className="w-full flex-row justify-between items-center gap-1">
							<Text className="text-paragraph-p3 text-content-4"><Trans>可用余额</Trans></Text>
							<View className="flex-row items-center gap-xs">
								<Text className="text-paragraph-p3 text-content-1">
									{fromAccount.balance} {fromAccount.currency}
								</Text>
								<IconButton variant='ghost' color='primary'>
									<IconifyPlusCircle width={14} height={14} />
								</IconButton>
							</View>
						</View>
					</View>
				</View>


				{/* Footer Button */}
				<View
					className="px-4 pt-4"
					style={{ paddingBottom: Math.max(insets.bottom, 20) }}
				>
					<Button
						size="lg"
						color='primary'
						disabled={amount === ''}
						onPress={() => { }}
					>
						<Text><Trans>确定</Trans></Text>
					</Button>
				</View>
			</KeyboardAvoidingView >

			<AccountSelectionDrawer
				visible={isFromDrawerOpen}
				onClose={() => setIsFromDrawerOpen(false)}
				onSelect={setFromAccount}
				selectedAccountId={fromAccount.id}
				title={<Trans>从</Trans>}
			/>

			<AccountSelectionDrawer
				visible={isToDrawerOpen}
				onClose={() => setIsToDrawerOpen(false)}
				onSelect={setToAccount}
				selectedAccountId={toAccount.id}
				title={<Trans>到</Trans>}
			/>
		</View >
	);
}

function AccountSelector({
	label,
	account,
	onPress
}: {
	label: React.ReactNode,
	account: Account,
	onPress: () => void
}) {
	return (
		<TouchableOpacity onPress={onPress} activeOpacity={0.8}>
			<Card className="bg-special border-0 rounded-small">
				<CardContent className="p-xl flex-row items-center justify-between">
					<View className="flex-1 gap-1">
						<Text className="text-paragraph-p3 text-content-1">{label}</Text>
						<Text className="text-paragraph-p2 text-content-1" numberOfLines={1}>{account.id}</Text>
					</View>
					<IconifyNavArrowRight width={18} height={18} className='text-brand-secondary-3' />
				</CardContent>
			</Card>
		</TouchableOpacity>
	);
}