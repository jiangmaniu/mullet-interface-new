import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
	CollapsibleScrollView,
	CollapsibleTab,
	CollapsibleTabScene,
} from '@/components/ui/collapsible-tab';
import {
	IconifyFilter,
	IconifyNavArrowDown,
	IconifyUserCircle,
} from '@/components/ui/icons';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { t } from '@/locales/i18n';
import { Trans } from '@lingui/react/macro';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { Account, AccountSelectDrawer } from './_comps/account-select-drawer';
import { DateFilterDrawer, DateRange } from './_comps/date-filter-drawer';

// Mock data types
interface WithdrawalRecord {
	id: string;
	amount: string;
	currency: string;
	status: 'success' | 'failed';
	fromAccount: string;
	fromAccountType: string;
	toAddress: string;
	toAddressLabel: string;
	orderNumber: string;
	time: string;
}

interface DepositRecord {
	id: string;
	amount: string;
	currency: string;
	status: 'success' | 'failed';
	toAccount: string;
	toAccountType: string;
	fromAddress: string;
	fromAddressLabel: string;
	orderNumber: string;
	time: string;
}

interface TransferRecord {
	id: string;
	amount: string;
	currency: string;
	status: 'success' | 'failed';
	fromAccount: string;
	fromAccountType: string;
	toAccount: string;
	toAccountType: string;
	time: string;
}

// Mock data
const MOCK_WITHDRAWALS: WithdrawalRecord[] = [
	{
		id: '1',
		amount: '0.10',
		currency: 'USDC',
		status: 'success',
		fromAccount: '4563155256',
		fromAccountType: 'STP',
		toAddress: '0x862D...B22A',
		toAddressLabel: 'MetaMask',
		orderNumber: '844564126145498456',
		time: '2026-01-01 12:00:00',
	},
	{
		id: '2',
		amount: '0.10',
		currency: 'USDC',
		status: 'failed',
		fromAccount: '4563155256',
		fromAccountType: 'STP',
		toAddress: '0x862D...B22A',
		toAddressLabel: 'MetaMask',
		orderNumber: '844564126145498456',
		time: '2026-01-01 12:00:00',
	},
	{
		id: '3',
		amount: '0.10',
		currency: 'USDC',
		status: 'success',
		fromAccount: '4563155256',
		fromAccountType: 'STP',
		toAddress: '0x862D...B22A',
		toAddressLabel: 'MetaMask',
		orderNumber: '844564126145498456',
		time: '2026-01-01 12:00:00',
	},
];

const MOCK_DEPOSITS: DepositRecord[] = [
	{
		id: '1',
		amount: '0.10',
		currency: 'USDC',
		status: 'success',
		toAccount: '4563155256',
		toAccountType: 'STP',
		fromAddress: '0x862D...B22A',
		fromAddressLabel: 'MetaMask',
		orderNumber: '844564126145498456',
		time: '2026-01-01 12:00:00',
	},
	{
		id: '2',
		amount: '0.10',
		currency: 'USDC',
		status: 'failed',
		toAccount: '4563155256',
		toAccountType: 'STP',
		fromAddress: '0x862D...B22A',
		fromAddressLabel: 'MetaMask',
		orderNumber: '844564126145498456',
		time: '2026-01-01 12:00:00',
	},
];

const MOCK_TRANSFERS: TransferRecord[] = [
	{
		id: '1',
		amount: '0.10',
		currency: 'USDC',
		status: 'success',
		fromAccount: '4563155256',
		fromAccountType: 'STP',
		toAccount: '4563155256',
		toAccountType: 'STP',
		time: '2026-01-01 12:00:00',
	},
	{
		id: '2',
		amount: '0.10',
		currency: 'USDC',
		status: 'success',
		fromAccount: '4563155256',
		fromAccountType: 'STP',
		toAccount: '4563155256',
		toAccountType: 'STP',
		time: '2026-01-01 12:00:00',
	},
	{
		id: '3',
		amount: '0.10',
		currency: 'USDC',
		status: 'success',
		fromAccount: '4563155256',
		fromAccountType: 'STP',
		toAccount: '4563155256',
		toAccountType: 'STP',
		time: '2026-01-01 12:00:00',
	},
];

// MetaMask Icon Component
function MetaMaskIcon({ width = 20, height = 20 }: { width?: number; height?: number }) {
	return (
		<Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
			<Rect width="24" height="24" rx="4" fill="#F5841F" />
			<Path
				d="M18.5 5L12.5 9.5L13.5 7L18.5 5Z"
				fill="#E17726"
				stroke="#E17726"
				strokeWidth="0.25"
			/>
			<Path
				d="M5.5 5L11.4 9.55L10.5 7L5.5 5Z"
				fill="#E27625"
				stroke="#E27625"
				strokeWidth="0.25"
			/>
			<Path
				d="M16.2 15.5L14.5 18.2L18 19.2L19 15.6L16.2 15.5Z"
				fill="#E27625"
				stroke="#E27625"
				strokeWidth="0.25"
			/>
			<Path
				d="M5 15.6L6 19.2L9.5 18.2L7.8 15.5L5 15.6Z"
				fill="#E27625"
				stroke="#E27625"
				strokeWidth="0.25"
			/>
			<Path
				d="M9.3 11L8.3 12.5L11.8 12.7L11.7 9L9.3 11Z"
				fill="#E27625"
				stroke="#E27625"
				strokeWidth="0.25"
			/>
			<Path
				d="M14.7 11L12.2 8.9L12.2 12.7L15.7 12.5L14.7 11Z"
				fill="#E27625"
				stroke="#E27625"
				strokeWidth="0.25"
			/>
			<Path
				d="M9.5 18.2L11.6 17.1L9.8 15.6L9.5 18.2Z"
				fill="#E27625"
				stroke="#E27625"
				strokeWidth="0.25"
			/>
			<Path
				d="M12.4 17.1L14.5 18.2L14.2 15.6L12.4 17.1Z"
				fill="#E27625"
				stroke="#E27625"
				strokeWidth="0.25"
			/>
		</Svg>
	);
}

export default function BillsScreen() {
	const [accountSelectVisible, setAccountSelectVisible] = useState(false);
	const [dateFilterVisible, setDateFilterVisible] = useState(false);
	const [dateRange, setDateRange] = useState<DateRange>({
		startDate: null,
		endDate: null,
	});
	const [selectedAccount, setSelectedAccount] = useState<Account>({
		id: '152365963',
		type: 'STP',
		balance: '10,234.50',
		currency: 'USDC',
		isReal: true,
	});

	const handleFilterPress = () => {
		setDateFilterVisible(true);
	};

	const handleAccountSelect = (account: Account) => {
		setSelectedAccount(account);
	};

	const handleDateFilterApply = (range: DateRange) => {
		setDateRange(range);
		// TODO: Filter records based on date range
	};

	return (
		<>
			<ScreenHeader
				showBackButton={true}
				content={<Trans>账单</Trans>}
				right={
					<TouchableOpacity onPress={handleFilterPress}>
						<IconifyFilter width={22} height={22} className='text-content-1' />
					</TouchableOpacity>
				}
			/>
			<View className="flex-1">
				<CollapsibleTab
					minHeaderHeight={0}
					scrollEnabled={false}
					initialTabName="withdrawal"
					size="md"
					variant="underline"
				>
					<CollapsibleTabScene name="withdrawal" label={t`出金`}>
						<CollapsibleScrollView className='flex-1'>
							<View className="gap-xl px-xl pt-xl">
								<AccountSelector
									accountId={selectedAccount.id}
									accountType={selectedAccount.type}
									isReal={selectedAccount.isReal}
									onPress={() => setAccountSelectVisible(true)}
								/>
								{MOCK_WITHDRAWALS.map((record) => (
									<WithdrawalCard key={record.id} record={record} />
								))}
							</View>
						</CollapsibleScrollView>
					</CollapsibleTabScene>

					<CollapsibleTabScene name="deposit" label={t`入金`}>
						<CollapsibleScrollView className='flex-1'>
							<View className="gap-xl px-xl pt-xl">
								<AccountSelector
									accountId={selectedAccount.id}
									accountType={selectedAccount.type}
									isReal={selectedAccount.isReal}
									onPress={() => setAccountSelectVisible(true)}
								/>
								{MOCK_DEPOSITS.map((record) => (
									<DepositCard key={record.id} record={record} />
								))}
							</View>
						</CollapsibleScrollView>
					</CollapsibleTabScene>

					<CollapsibleTabScene name="transfer" label={t`划`}>
						<CollapsibleScrollView className='flex-1' contentContainerStyle={{ paddingBottom: 24 }}>
							<View className="gap-xl px-xl pt-xl">
								{MOCK_TRANSFERS.map((record) => (
									<TransferCard key={record.id} record={record} />
								))}
							</View>
						</CollapsibleScrollView>
					</CollapsibleTabScene>
				</CollapsibleTab>
			</View>

			<AccountSelectDrawer
				visible={accountSelectVisible}
				onClose={() => setAccountSelectVisible(false)}
				selectedAccountId={selectedAccount.id}
				onSelect={handleAccountSelect}
			/>

			<DateFilterDrawer
				visible={dateFilterVisible}
				onClose={() => setDateFilterVisible(false)}
				dateRange={dateRange}
				onApply={handleDateFilterApply}
			/>
		</>
	);
}

// Account Selector Component
function AccountSelector({
	accountId,
	accountType,
	isReal,
	onPress,
}: {
	accountId: string;
	accountType: string;
	isReal: boolean;
	onPress: () => void;
}) {
	const { textColorContent1 } = useThemeColors();

	return (
		<TouchableOpacity onPress={onPress}>
			<View className="flex-row items-center justify-between px-xl py-xl bg-special rounded-small">
				<View className="flex-row items-center gap-medium">
					<IconifyUserCircle width={20} height={20} color={textColorContent1} />
					<Text className="text-paragraph-p2 text-content-1">{accountId}</Text>
					{isReal && (
						<Badge color="rise">
							<Text><Trans>真实</Trans></Text>
						</Badge>
					)}
					<Badge color="default">
						<Text>{accountType}</Text>
					</Badge>
				</View>
				<IconifyNavArrowDown width={18} height={18} color={textColorContent1} />
			</View>
		</TouchableOpacity>
	);
}

// Status Badge Component
function StatusBadge({ status }: { status: 'success' | 'failed' }) {
	return (
		<Text className={status === 'success' ? 'text-market-rise text-paragraph-p3' : 'text-market-fall text-paragraph-p3'}>
			{status === 'success' ? <Trans>成功</Trans> : <Trans>失败</Trans>}
		</Text>
	);
}

// Account Type Badge
function AccountTypeBadge({ type }: { type: string }) {
	return (
		<Badge color="default">
			<Text>{type}</Text>
		</Badge>
	);
}

// Row Component for consistent styling
function InfoRow({
	label,
	value,
	valueComponent,
}: {
	label: React.ReactNode;
	value?: React.ReactNode;
	valueComponent?: React.ReactNode;
}) {
	return (
		<View className="flex-row items-center justify-between">
			<Text className="text-paragraph-p3 text-content-4">{label}</Text>
			{valueComponent || <Text className="text-paragraph-p3 text-content-1">{value}</Text>}
		</View>
	);
}

// Withdrawal Card Component
function WithdrawalCard({ record }: { record: WithdrawalRecord }) {
	return (
		<Card>
			<CardContent className="gap-xs">
				<InfoRow
					label={<Trans>出金金额</Trans>}
					value={`${record.amount} ${record.currency}`}
				/>
				<InfoRow
					label={<Trans>出金状态</Trans>}
					valueComponent={<StatusBadge status={record.status} />}
				/>
				<InfoRow
					label={<Trans>转出账户</Trans>}
					valueComponent={
						<View className="flex-row items-center gap-xs">
							<AccountTypeBadge type={record.fromAccountType} />
							<Text className="text-paragraph-p3 text-content-1">{record.fromAccount}</Text>
						</View>
					}
				/>
				<InfoRow
					label={<Trans>收款地址</Trans>}
					valueComponent={
						<View className="flex-row items-center gap-xs">
							<MetaMaskIcon width={18} height={18} />
							<Text className="text-paragraph-p3 text-content-1">
								{record.toAddressLabel}({record.toAddress})
							</Text>
						</View>
					}
				/>
				<InfoRow label={<Trans>单号</Trans>} value={record.orderNumber} />
				<InfoRow label={<Trans>时间</Trans>} value={record.time} />
			</CardContent>
		</Card>
	);
}

// Deposit Card Component
function DepositCard({ record }: { record: DepositRecord }) {
	return (
		<Card>
			<CardContent className="gap-xs">
				<InfoRow
					label={<Trans>入金金额</Trans>}
					value={`${record.amount} ${record.currency}`}
				/>
				<InfoRow
					label={<Trans>入金状态</Trans>}
					valueComponent={<StatusBadge status={record.status} />}
				/>
				<InfoRow
					label={<Trans>收款账户</Trans>}
					valueComponent={
						<View className="flex-row items-center gap-xs">
							<AccountTypeBadge type={record.toAccountType} />
							<Text className="text-paragraph-p3 text-content-1">{record.toAccount}</Text>
						</View>
					}
				/>
				<InfoRow
					label={<Trans>转入地址</Trans>}
					valueComponent={
						<View className="flex-row items-center gap-xs">
							<MetaMaskIcon width={18} height={18} />
							<Text className="text-paragraph-p3 text-content-1">
								{record.fromAddressLabel}({record.fromAddress})
							</Text>
						</View>
					}
				/>
				<InfoRow label={<Trans>单号</Trans>} value={record.orderNumber} />
				<InfoRow label={<Trans>时间</Trans>} value={record.time} />
			</CardContent>
		</Card>
	);
}

// Transfer Card Component
function TransferCard({ record }: { record: TransferRecord }) {
	return (
		<Card>
			<CardContent className="gap-medium">
				<InfoRow
					label={<Trans>划转金额</Trans>}
					value={`${record.amount} ${record.currency}`}
				/>
				<InfoRow
					label={<Trans>划转状态</Trans>}
					valueComponent={<StatusBadge status={record.status} />}
				/>
				<InfoRow
					label={<Trans>转出账户</Trans>}
					valueComponent={
						<View className="flex-row items-center gap-xs">
							<AccountTypeBadge type={record.fromAccountType} />
							<Text className="text-paragraph-p3 text-content-1">{record.fromAccount}</Text>
						</View>
					}
				/>
				<InfoRow
					label={<Trans>转入账户</Trans>}
					valueComponent={
						<View className="flex-row items-center gap-xs">
							<AccountTypeBadge type={record.toAccountType} />
							<Text className="text-paragraph-p3 text-content-1">{record.toAccount}</Text>
						</View>
					}
				/>
				<InfoRow label={<Trans>时间</Trans>} value={record.time} />
			</CardContent>
		</Card>
	);
}
