import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';
import { View, ScrollView, Pressable } from 'react-native';

const MOCK_ACCOUNTS: Account[] = [
	{ id: '1475632563', name: '标准账户', balance: '152,563.00', currency: 'USDC' },
	{ id: '1475632564', name: '标准账户', balance: '152,563.00', currency: 'USDC' },
	{ id: '1475632565', name: '标准账户', balance: '152,563.00', currency: 'USDC' },
];

export interface Account {
	id: string;
	name: string;
	balance: string;
	currency: string;
}

interface AccountSelectionDrawerProps {
	visible: boolean;
	onClose: () => void;
	onSelect: (account: Account) => void;
	selectedAccountId?: string;
}

export function AccountSelectionDrawer({
	visible,
	onClose,
	onSelect,
	selectedAccountId,
}: AccountSelectionDrawerProps) {
	return (
		<Drawer open={visible} onOpenChange={onClose}>
			<DrawerContent className='h-[240px]'>
				<ScrollView className="flex-1 pt-xl pb-3xl" showsVerticalScrollIndicator={false}>
					{MOCK_ACCOUNTS.map((account) => (
						<AccountRow
							key={account.id}
							account={account}
							isSelected={account.id === selectedAccountId}
							onPress={() => {
								onSelect(account);
								onClose();
							}}
						/>
					))}
					<View className="h-safe-bottom" />
				</ScrollView>
			</DrawerContent>
		</Drawer>
	);
}

function AccountRow({
	account,
	isSelected,
	onPress,
}: {
	account: Account;
	isSelected?: boolean;
	onPress: () => void;
}) {
	return (
		<Pressable onPress={onPress}>
			<Card className="border-0 bg-transparent">
				<CardContent className="px-5 py-[14px] flex-row items-center justify-between">
					<View className="gap-xs flex-1">
						<View className="flex-row items-center gap-medium">
							<Text className="text-paragraph-p2 text-content-1">
								{account.name}
							</Text>
							<Text className="text-paragraph-p2 text-content-4">
								{account.id}
							</Text>
							<Badge color="green">
								<Text><Trans>真实</Trans></Text>
							</Badge>
						</View>
						<Text className="text-paragraph-p3 text-content-4">
							{account.balance} {account.currency}
						</Text>
					</View>
					<Checkbox checked={!!isSelected} onCheckedChange={() => onPress()} />
				</CardContent>
			</Card>
		</Pressable>
	);
}
