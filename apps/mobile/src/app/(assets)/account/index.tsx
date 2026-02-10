import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from '@/components/ui/screen-header';
import { CollapsibleTab, CollapsibleTabScene, CollapsibleScrollView, CollapsibleStickyNavBar, CollapsibleStickyContent, CollapsibleStickyHeader } from '@/components/ui/collapsible-tab';
import { Trans } from '@lingui/react/macro';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconifyUserCircle } from '@/components/ui/icons';
import { t } from '@lingui/core/macro';

// --- Data & Types ---

export interface AccountType {
	id: string;
	name: React.ReactNode;
	type: 'real' | 'mock';
	tags: string[];
	minDeposit: string;
	spread: string;
	commission: React.ReactNode;
	currency: string;
	leverage: string; // e.g. "1:500"
}

// --- Components ---

interface AccountTypeCardProps {
	data: AccountType;
	isSelected?: boolean;
	onPress: () => void;
}



const REAL_Account_TYPES: AccountType[] = [
	{
		id: 'standard_real',
		name: <Trans>标准账户</Trans>,
		type: 'real',
		tags: ['STP'],
		minDeposit: '10.00',
		spread: '0.2',
		commission: <Trans>无手续费</Trans>,
		currency: 'USDC',
		leverage: '1:500'
	},
	{
		id: 'raw_real',
		name: <Trans>裸点账户</Trans>,
		type: 'real',
		tags: ['ECN'],
		minDeposit: '200.00',
		spread: '0.0',
		commission: '$3.5',
		currency: 'USDC',
		leverage: '1:500'
	},
	{
		id: 'pro_real',
		name: <Trans>免息账户</Trans>,
		type: 'real',
		tags: ['STP'],
		minDeposit: '1000.00',
		spread: '0.1',
		commission: <Trans>无手续费</Trans>,
		currency: 'USDC',
		leverage: '1:200'
	}
];

const MOCK_ACCOUNT_TYPES: AccountType[] = [
	{
		id: 'standard_mock',
		name: <Trans>标准账户</Trans>,
		type: 'mock',
		tags: ['STP'],
		minDeposit: '10.00',
		spread: '0.2',
		commission: <Trans>无手续费</Trans>,
		currency: 'USDC',
		leverage: '1:500'
	},
	{
		id: 'raw_mock',
		name: <Trans>裸点账户</Trans>,
		type: 'mock',
		tags: ['ECN'],
		minDeposit: '200.00',
		spread: '0.0',
		commission: '$3.5',
		currency: 'USDC',
		leverage: '1:500'
	}
];


function AccountTypeCard({ data, isSelected, onPress }: AccountTypeCardProps) {
	const isMock = data.type === 'mock';

	return (
		<Pressable onPress={onPress}>
			<Card className={isSelected ? 'border-brand-primary' : ''}>
				<CardContent className='gap-xs p-xl'>
					{/* Header */}
					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center gap-xs">
							<IconifyUserCircle width={20} height={20} className='text-content-1' />
							<Text className="text-paragraph-p1 text-content-1">{data.name}</Text>
						</View>

						<View className="flex-row items-center gap-xs">
							<Badge color={isMock ? 'secondary' : 'rise'}>
								<Text>{isMock ? <Trans>模拟</Trans> : <Trans>真实</Trans>}</Text>
							</Badge>
							{data.tags.map(tag => (
								<Badge key={tag} color='default'>
									<Text>{tag}</Text>
								</Badge>
							))}
						</View>
					</View>

					{/* Details */}
					<View className="gap-xs">
						<View className="flex-row justify-between items-center h-6">
							<Text className="text-paragraph-p3 text-content-4"><Trans>最低入金金额</Trans></Text>
							<Text className="text-paragraph-p3 text-content-1">{data.minDeposit} {data.currency}</Text>
						</View>
						<View className="flex-row justify-between items-center h-6">
							<Text className="text-paragraph-p3 text-content-4"><Trans>点差</Trans></Text>
							<Text className="text-paragraph-p3 text-content-1">{data.spread}<Trans>点起</Trans></Text>
						</View>
						<View className="flex-row justify-between items-center h-6">
							<Text className="text-paragraph-p3 text-content-4"><Trans>手续费</Trans></Text>
							<Text className="text-paragraph-p3 text-content-1">{data.commission}</Text>
						</View>
					</View>
				</CardContent>
			</Card>
		</Pressable>
	);
}

// --- Main Screen ---

export default function AccountScreen() {
	const [selectedAccount, setSelectedAccount] = useState<AccountType | null>(null);

	const renderHeader = React.useCallback(() => {
		return (
			<CollapsibleStickyHeader className="bg-secondary">
				<CollapsibleStickyNavBar>
					<ScreenHeader
						content={<Trans>创建账户</Trans>}
					/>
				</CollapsibleStickyNavBar>

				<CollapsibleStickyContent className="p-xl">
					<Text className="text-paragraph-p4 text-content-4">
						<Trans>
							您最多可以创建10个账户，允许您独立管理每个账户的资产，并灵活分配杠杆率和保证金使用情况。资金可以在帐户之间快速转移，以实现高效的资金配置和方便的交易统计追踪。
						</Trans>
					</Text>
				</CollapsibleStickyContent>
			</CollapsibleStickyHeader>
		);
	}, []);

	const handleCreateAccount = () => {
		// TODO: Implement create account logic or navigation
		console.log('Create account', selectedAccount);
	}

	return (
		<View className="flex-1 bg-secondary relative">
			<CollapsibleTab
				renderHeader={renderHeader}
				initialTabName="real"
				size='md'
				variant='underline'
				scrollEnabled={false} // Disable scroll to make tabs fill width (flex-1)
				onIndexChange={() => setSelectedAccount(null)}
			>
				<CollapsibleTabScene name="real" label={t`真实账户`}>
					<CollapsibleScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 80 }}>
						<View className='gap-medium p-xl'>
							{REAL_Account_TYPES.map(account => (
								<AccountTypeCard
									key={account.id}
									data={account}
									isSelected={selectedAccount?.id === account.id}
									onPress={() => setSelectedAccount(account)}
								/>
							))}
						</View>
					</CollapsibleScrollView>
				</CollapsibleTabScene>

				<CollapsibleTabScene name="mock" label={t`模拟账户`}>
					<CollapsibleScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 80 }}>
						<View className='gap-medium p-xl'>
							{MOCK_ACCOUNT_TYPES.map(account => (
								<AccountTypeCard
									key={account.id}
									data={account}
									isSelected={selectedAccount?.id === account.id}
									onPress={() => setSelectedAccount(account)}
								/>
							))}
						</View>
					</CollapsibleScrollView>
				</CollapsibleTabScene>
			</CollapsibleTab>

			{/* Fixed Bottom Button */}
			<View className="absolute bottom-0 left-0 right-0 bg-secondary px-xl pb-3xl">
				<Button
					size="lg"
					color='primary'
					disabled={!selectedAccount}
					onPress={handleCreateAccount}
				>
					<Text><Trans>创建账户</Trans></Text>
				</Button>
			</View>
		</View>
	);
} 