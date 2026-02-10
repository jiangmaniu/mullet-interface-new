import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';
import { View, ScrollView, Pressable } from 'react-native';

const REAL_ACCOUNTS = [
	{ id: '88234911', type: 'STP' as const, balance: '10,234.50', currency: 'USDC', leverage: '500', platform: 'MT5' as const, server: 'Mullet-Live', address: '0x862D...B22A' },
	{ id: '88234912', type: 'STP' as const, balance: '5,000.00', currency: 'USDC', leverage: '100', platform: 'MT5' as const, server: 'Mullet-Live', address: '0x1A2B...C3D4' },
	{ id: '88234933', type: 'STP' as const, balance: '10,234.50', currency: 'USDC', leverage: '500', platform: 'MT5' as const, server: 'Mullet-Live', address: '0x862D...B22A' },
	{ id: '88234935', type: 'STP' as const, balance: '10,234.50', currency: 'USDC', leverage: '500', platform: 'MT5' as const, server: 'Mullet-Live', address: '0x862D...B22A' },
	{ id: '88234937', type: 'STP' as const, balance: '10,234.50', currency: 'USDC', leverage: '500', platform: 'MT5' as const, server: 'Mullet-Live', address: '0x862D...B22A' },
];

export interface Account {
	id: string;
	type: string;
	balance: string;
	currency: string;
}

interface AccountSelectionDrawerProps {
	visible: boolean;
	onClose: () => void;
	onSelect: (account: Account) => void;
	selectedAccountId?: string;
	title?: React.ReactNode;
}

export function AccountSelectionDrawer({
	visible,
	onClose,
	onSelect,
	selectedAccountId,
	title
}: AccountSelectionDrawerProps) {
	return (
		<Drawer open={visible} onOpenChange={onClose}>
			<DrawerContent className='h-[240px]'>
				<ScrollView className='flex-1 pt-xl pb-3xl' showsVerticalScrollIndicator={false}>
					{REAL_ACCOUNTS.map(account => (
						<AccountRow
							key={account.id}
							{...account}
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
	id,
	type,
	balance,
	currency,
	isSelected,
	onPress
}: Account & { isSelected?: boolean, onPress: () => void }) {

	return (
		<Pressable onPress={onPress}>
			<Card className='border-0 bg-transparent'>
				<CardContent className='px-5 py-[14px] flex-row items-center justify-between'>
					<View className='gap-xs'>
						<View className="flex-row items-center justify-between gap-medium">

							<Text className="text-paragraph-p2 text-content-1">{id}</Text>

							<View className="flex-row items-center gap-medium">
								<Badge color='green'>
									<Text><Trans>真实</Trans></Text>
								</Badge>
								<Badge color='default'>
									<Text>{type.toUpperCase()}</Text>
								</Badge>
							</View>
						</View>

						<Text className="text-paragraph-p3 text-content-4">{balance} {currency}</Text>
					</View>

					<Checkbox checked={!!isSelected} onCheckedChange={() => onPress()} />
				</CardContent>
			</Card>
		</Pressable>
	);
}
